#!/usr/bin/env node
/**
 * Dispatcher Health Check Script (READ-ONLY)
 * ============================================
 * Checks the operational health of the n8n Blueprint Dispatcher system.
 * Never writes to n8n, GitHub, or any remote system.
 * Never outputs secrets or credential values.
 *
 * Usage: node scripts/dispatcher-health-check.mjs
 *
 * Output:
 *   - evidence/post-green-stabilization-<TIMESTAMP>/dispatcher-health-check.json
 *   - evidence/post-green-stabilization-<TIMESTAMP>/dispatcher-health-check.md
 *
 * Exit codes:
 *   0 = HEALTH_GREEN or HEALTH_GREEN_WITH_NOTES
 *   1 = HEALTH_YELLOW
 *   2 = HEALTH_RED
 *   3 = Script error (unable to run checks)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  n8nBaseUrl: process.env.N8N_BASE_URL || 'http://192.168.1.52:5678',
  n8nApiKey: process.env.N8N_API_KEY || null, // May be undefined (auth missing)
  repo: 'xxammaxx/n8n-blueprint-workflow',
  workflowId: 'Sv12QTo56NoPUu2D',
  workflowName: 'GitHub Ready Issue → Runner Agent Dispatch',
  protectedIssues: [3, 4, 5, 6, 7],
  scheduleIntervalMinutes: 15,
  runnerHost: 'lxc-dev-runner',
  runnerIp: '192.168.1.53',
  ctNumber: 101,
  lastCanaryIssue: 7,
  lastCanaryRunId: 'gh-issue-7-20260627T100030Z',
  greenCommit: '869fa69',
  timeout: 10000,
};

// ============================================================================
// Utility Functions
// ============================================================================

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', 'T').replace(/\.\d{3}Z$/, 'Z');
}

function now() {
  return new Date().toISOString();
}

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

function hrDuration(start) {
  const diff = process.hrtime(start);
  return (diff[0] * 1000 + diff[1] / 1e6).toFixed(0);
}

// ============================================================================
// Check Functions (each returns { check, status, detail, evidence })
// ============================================================================

async function checkN8nReachable() {
  const start = process.hrtime();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
    const response = await fetch(`${CONFIG.n8nBaseUrl}/healthz`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const body = await response.text();
    const isN8n = body.toLowerCase().includes('n8n') || body.includes('"status":"ok"');
    if (response.ok) {
      return {
        check: 'n8n-reachable',
        status: 'PASS',
        detail: `HTTP ${response.status}, ${body.length} bytes, n8n signature: ${isN8n ? 'found' : 'not_found'}`,
        evidence: { statusCode: response.status, contentLength: body.length, n8nSignatureFound: isN8n },
        durationMs: parseInt(hrDuration(start)),
      };
    }
    return {
      check: 'n8n-reachable',
      status: 'FAIL',
      detail: `HTTP ${response.status} — unexpected response`,
      evidence: { statusCode: response.status },
      durationMs: parseInt(hrDuration(start)),
    };
  } catch (err) {
    return {
      check: 'n8n-reachable',
      status: 'FAIL',
      detail: `Connection failed: ${err.message}`,
      evidence: { error: err.message },
      durationMs: parseInt(hrDuration(start)),
    };
  }
}

async function checkN8nBasePage() {
  const start = process.hrtime();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
    const response = await fetch(`${CONFIG.n8nBaseUrl}`, { signal: controller.signal });
    clearTimeout(timeout);
    const body = await response.text();
    const hasN8nSignature = body.includes('n8n') || body.includes('n8n-design-system');
    return {
      check: 'n8n-base-page',
      status: response.ok && hasN8nSignature ? 'PASS' : 'WARN',
      detail: `HTTP ${response.status}, content: ${body.length} bytes`,
      evidence: { statusCode: response.status, hasN8nSignature },
      durationMs: parseInt(hrDuration(start)),
    };
  } catch (err) {
    return {
      check: 'n8n-base-page',
      status: 'FAIL',
      detail: `Connection failed: ${err.message}`,
      evidence: { error: err.message },
      durationMs: parseInt(hrDuration(start)),
    };
  }
}

async function checkWorkflowViaApi() {
  const start = process.hrtime();
  if (!CONFIG.n8nApiKey) {
    return {
      check: 'workflow-api',
      status: 'SKIP',
      detail: 'N8N_API_KEY not available — API check skipped',
      evidence: { reason: 'auth_missing' },
      durationMs: 0,
    };
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.timeout);
    const response = await fetch(
      `${CONFIG.n8nBaseUrl}/api/v1/workflows/${CONFIG.workflowId}`,
      {
        signal: controller.signal,
        headers: { 'X-N8N-API-KEY': CONFIG.n8nApiKey },
      }
    );
    clearTimeout(timeout);
    if (!response.ok) {
      return {
        check: 'workflow-api',
        status: 'WARN',
        detail: `API returned HTTP ${response.status}`,
        evidence: { httpStatus: response.status },
        durationMs: parseInt(hrDuration(start)),
      };
    }
    const data = await response.json();
    const isActive = data.active || false;
    const nodeCount = Array.isArray(data.nodes) ? data.nodes.length : 'unknown';
    const scheduleNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger')
      : null;
    const schedulePresent = !!scheduleNode;
    const manualNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.type === 'n8n-nodes-base.manualTrigger')
      : null;
    const manualPresent = !!manualNode;
    const guardrailsNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.name && n.name.includes('Guardrail'))
      : null;
    const guardrailsPresent = !!guardrailsNode;
    const formatNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.name && n.name.includes('Format Final Result'))
      : null;
    const formatPresent = !!formatNode;

    return {
      check: 'workflow-api',
      status: 'PASS',
      detail: `Workflow found: active=${isActive}, nodes=${nodeCount}`,
      evidence: {
        workflowId: CONFIG.workflowId,
        workflowName: data.name || 'unknown',
        active: isActive,
        nodeCount,
        scheduleTriggerPresent: schedulePresent,
        manualTriggerPresent: manualPresent,
        guardrailsNodePresent: guardrailsPresent,
        formatFinalResultPresent: formatPresent,
      },
      durationMs: parseInt(hrDuration(start)),
    };
  } catch (err) {
    return {
      check: 'workflow-api',
      status: 'FAIL',
      detail: `API call failed: ${err.message}`,
      evidence: { error: err.message },
      durationMs: parseInt(hrDuration(start)),
    };
  }
}

function checkWorkflowFromLocalExport() {
  const exportPath = join(
    process.cwd(),
    'exports',
    'green',
    'dispatcher-green-20260627T131737Z.json'
  );
  if (!existsSync(exportPath)) {
    // Try finding any green export
    const exportsDir = join(process.cwd(), 'exports', 'green');
    if (!existsSync(exportsDir)) {
      return {
        check: 'workflow-local',
        status: 'WARN',
        detail: 'No green workflow export found in exports/green/',
        evidence: { exportFound: false },
        durationMs: 0,
      };
    }
    return {
      check: 'workflow-local',
      status: 'WARN',
      detail: 'Export directory exists but snapshot file not found',
      evidence: { exportFound: false, exportDir: 'exports/green/' },
      durationMs: 0,
    };
  }
  try {
    const content = readFileSync(exportPath, 'utf-8');
    const data = JSON.parse(content);
    const isCorrectId = data.id === CONFIG.workflowId;
    const isActive = data.active || false;
    const nodeCount = Array.isArray(data.nodes) ? data.nodes.length : 0;
    const scheduleNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger')
      : null;
    const manualNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.type === 'n8n-nodes-base.manualTrigger')
      : null;
    const guardrailsNode = Array.isArray(data.nodes)
      ? data.nodes.find(n => n.name && n.name.toLowerCase().includes('guardrail'))
      : null;

    return {
      check: 'workflow-local',
      status: isCorrectId ? 'PASS' : 'WARN',
      detail: `Local export: id=${data.id}, active=${isActive}, nodes=${nodeCount}`,
      evidence: {
        exportPath,
        workflowId: data.id,
        workflowName: data.name,
        active: isActive,
        nodeCount,
        scheduleTriggerPresent: !!scheduleNode,
        manualTriggerPresent: !!manualNode,
        guardrailsPresent: !!guardrailsNode,
        exportHash: sha256(content),
      },
      durationMs: 0,
    };
  } catch (err) {
    return {
      check: 'workflow-local',
      status: 'WARN',
      detail: `Failed to parse local export: ${err.message}`,
      evidence: { error: err.message },
      durationMs: 0,
    };
  }
}

async function checkProtectedIssues() {
  const start = process.hrtime();
  const results = [];
  for (const issueNum of CONFIG.protectedIssues) {
    try {
      const stdout = execSync(
        `gh issue view ${issueNum} --repo ${CONFIG.repo} --json labels,state --jq ". | {labels: [.labels[].name], state: .state}"`,
        { encoding: 'utf-8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const data = JSON.parse(stdout);
      const labels = data.labels || [];
      const hasReady = labels.includes('agent:ready');
      const hasRunning = labels.includes('agent:running');
      const hasNeedsReview = labels.includes('agent:needs-review');
      const hasEvidence = labels.includes('evidence:attached');

      results.push({
        issue: `#${issueNum}`,
        state: data.state,
        hasAgentReady: hasReady,
        hasAgentRunning: hasRunning,
        hasNeedsReview: hasNeedsReview,
        hasEvidenceAttached: hasEvidence,
        safe: !hasReady && !hasRunning, // Safe if not ready and not running
        labels,
      });
    } catch (err) {
      results.push({
        issue: `#${issueNum}`,
        state: 'unknown',
        error: err.message,
        safe: false,
        labels: [],
      });
    }
  }
  const allSafe = results.every(r => r.safe);
  const anyReady = results.some(r => r.hasAgentReady);
  return {
    check: 'protected-issues',
    status: allSafe ? 'PASS' : (anyReady ? 'FAIL' : 'WARN'),
    detail: `${results.filter(r => r.safe).length}/${results.length} issues safe`,
    evidence: { issues: results, allSafe, anyReady },
    durationMs: parseInt(hrDuration(start)),
  };
}

function checkGitStatus() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    const commit = execSync('git log -1 --format=%H', { encoding: 'utf-8' }).trim();
    const commitMsg = execSync('git log -1 --format=%s', { encoding: 'utf-8' }).trim();
    const isGreenCommit = commit.startsWith(CONFIG.greenCommit);
    return {
      check: 'git-status',
      status: isGreenCommit ? 'PASS' : 'WARN',
      detail: `Branch: ${branch}, Commit: ${commit.substring(0, 7)}, Green: ${isGreenCommit}`,
      evidence: { branch, commit, commitMessage: commitMsg, isGreenCommit },
      durationMs: 0,
    };
  } catch (err) {
    return {
      check: 'git-status',
      status: 'WARN',
      detail: `Git check failed: ${err.message}`,
      evidence: { error: err.message },
      durationMs: 0,
    };
  }
}

function checkEvidenceDirectories() {
  const evidenceDir = join(process.cwd(), 'evidence');
  if (!existsSync(evidenceDir)) {
    return {
      check: 'evidence-dirs',
      status: 'WARN',
      detail: 'Evidence directory not found',
      evidence: { evidenceDirExists: false },
      durationMs: 0,
    };
  }
  try {
    const dirs = execSync(
      `powershell -Command "Get-ChildItem -LiteralPath '${evidenceDir}' -Directory | Select-Object Name, LastWriteTime | Sort-Object LastWriteTime -Descending | ConvertTo-Json"`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    let dirList = [];
    try { dirList = JSON.parse(dirs); } catch { dirList = []; }
    if (!Array.isArray(dirList)) dirList = [dirList];
    return {
      check: 'evidence-dirs',
      status: dirList.length > 0 ? 'PASS' : 'WARN',
      detail: `${dirList.length} evidence directories found`,
      evidence: { count: dirList.length, latest: dirList[0]?.Name || 'unknown' },
      durationMs: 0,
    };
  } catch (err) {
    return {
      check: 'evidence-dirs',
      status: 'WARN',
      detail: `Could not list evidence dirs: ${err.message}`,
      evidence: { error: err.message },
      durationMs: 0,
    };
  }
}

function checkExportsExist() {
  const exportDir = join(process.cwd(), 'exports', 'green');
  const exists = existsSync(exportDir);
  if (!exists) {
    return {
      check: 'exports-exist',
      status: 'WARN',
      detail: 'Green exports directory not found',
      evidence: { exportsGreenExists: false },
      durationMs: 0,
    };
  }
  try {
    const files = execSync(
      `powershell -Command "Get-ChildItem -LiteralPath '${exportDir}' -Filter *.json | Select-Object Name, Length | ConvertTo-Json"`,
      { encoding: 'utf-8', timeout: 10000 }
    );
    let fileList = [];
    try { fileList = JSON.parse(files); } catch { fileList = []; }
    return {
      check: 'exports-exist',
      status: fileList.length > 0 ? 'PASS' : 'WARN',
      detail: `${fileList.length} green export files`,
      evidence: { exportsGreenExists: true, fileCount: fileList.length },
      durationMs: 0,
    };
  } catch {
    return {
      check: 'exports-exist',
      status: 'WARN',
      detail: 'Could not list export files',
      evidence: { exportsGreenExists: true },
      durationMs: 0,
    };
  }
}

function checkRunbookExists() {
  const runbookPaths = [
    join(process.cwd(), 'evidence', 'post-green-stabilization-20260627T131737Z', 'OPERATIONS_RUNBOOK.md'),
    join(process.cwd(), 'OPERATIONS_RUNBOOK.md'),
  ];
  const found = runbookPaths.find(p => existsSync(p));
  return {
    check: 'runbook-exists',
    status: found ? 'PASS' : 'WARN',
    detail: found ? `OPERATIONS_RUNBOOK.md found` : 'OPERATIONS_RUNBOOK.md not found',
    evidence: { runbookExists: !!found, path: found || null },
    durationMs: 0,
  };
}

function checkGreenBaselineExists() {
  const baselinePaths = [
    join(process.cwd(), 'evidence', 'post-green-stabilization-20260627T131737Z', 'GREEN_BASELINE.md'),
    join(process.cwd(), 'GREEN_BASELINE.md'),
  ];
  const found = baselinePaths.find(p => existsSync(p));
  return {
    check: 'green-baseline-exists',
    status: found ? 'PASS' : 'FAIL',
    detail: found ? 'GREEN_BASELINE.md found' : 'GREEN_BASELINE.md NOT found',
    evidence: { baselineExists: !!found, path: found || null },
    durationMs: 0,
  };
}

function checkSecretHygiene() {
  try {
    const result = execSync('node scripts/validate-secret-hygiene.mjs', {
      encoding: 'utf-8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return {
      check: 'secret-hygiene',
      status: 'PASS',
      detail: 'Secret hygiene script passed',
      evidence: { passed: true, output: result.substring(0, 500) },
      durationMs: 0,
    };
  } catch (err) {
    return {
      check: 'secret-hygiene',
      status: 'FAIL',
      detail: `Secret hygiene script failed: ${err.message}`,
      evidence: { passed: false, error: err.message },
      durationMs: 0,
    };
  }
}

// ============================================================================
// Status Classification
// ============================================================================

function classifyHealth(results) {
  const statuses = results.map(r => r.status);
  const hasFail = statuses.includes('FAIL');
  const hasWarn = statuses.includes('WARN');
  const hasSkip = statuses.includes('SKIP');
  const skipCount = statuses.filter(s => s === 'SKIP').length;
  const passCount = statuses.filter(s => s === 'PASS').length;
  const total = results.length;

  if (hasFail) {
    const criticalFails = results.filter(r => r.status === 'FAIL' && r.check !== 'secret-hygiene');
    if (criticalFails.length > 0 && criticalFails.some(f => f.check === 'n8n-reachable' || f.check === 'protected-issues')) {
      return 'HEALTH_RED';
    }
    return 'HEALTH_YELLOW';
  }

  if (hasWarn || hasSkip) {
    return 'HEALTH_GREEN_WITH_NOTES';
  }

  return 'HEALTH_GREEN';
}

// ============================================================================
// Report Generation
// ============================================================================

function generateMarkdown(results, healthStatus, meta) {
  const lines = [];
  lines.push('# Dispatcher Health Check Report');
  lines.push('');
  lines.push(`**Date/Time:** ${meta.timestamp}`);
  lines.push(`**Health Status:** \`${healthStatus}\``);
  lines.push(`**Session:** ${meta.sessionId}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Checks | ${results.length} |`);
  lines.push(`| PASS | ${results.filter(r => r.status === 'PASS').length} |`);
  lines.push(`| WARN | ${results.filter(r => r.status === 'WARN').length} |`);
  lines.push(`| SKIP | ${results.filter(r => r.status === 'SKIP').length} |`);
  lines.push(`| FAIL | ${results.filter(r => r.status === 'FAIL').length} |`);
  lines.push(`| Health | ${healthStatus} |`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Check Results');
  lines.push('');

  for (const result of results) {
    const icon = result.status === 'PASS' ? '✅' :
                 result.status === 'WARN' ? '⚠️' :
                 result.status === 'SKIP' ? '⏭️' : '❌';
    lines.push(`### ${icon} ${result.check}`);
    lines.push(`- **Status:** ${result.status}`);
    lines.push(`- **Detail:** ${result.detail}`);
    lines.push(`- **Duration:** ${result.durationMs}ms`);
    if (result.evidence) {
      lines.push(`- **Evidence:** \`${JSON.stringify(result.evidence).substring(0, 200)}\``);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Meta');
  lines.push('');
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| n8n Base URL | ${CONFIG.n8nBaseUrl} |`);
  lines.push(`| n8n API Key Available | ${CONFIG.n8nApiKey ? 'Yes' : 'No'} |`);
  lines.push(`| Workflow ID | ${CONFIG.workflowId} |`);
  lines.push(`| Protected Issues | ${CONFIG.protectedIssues.join(', ')} |`);
  lines.push(`| Total Duration | ${meta.totalDurationMs}ms |`);

  return lines.join('\n');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const totalStart = process.hrtime();
  const timestamp = now();
  const sessionId = `post-green-stabilization-${getTimestamp().substring(0, 15)}`;

  console.log('='.repeat(60));
  console.log('  Dispatcher Health Check (READ-ONLY)');
  console.log(`  ${timestamp}`);
  console.log('='.repeat(60));
  console.log('');

  // Run checks
  const checks = [
    checkN8nReachable,
    checkN8nBasePage,
    checkWorkflowViaApi,
    checkWorkflowFromLocalExport,
    checkProtectedIssues,
    checkGitStatus,
    checkEvidenceDirectories,
    checkExportsExist,
    checkRunbookExists,
    checkGreenBaselineExists,
    checkSecretHygiene,
  ];

  const results = [];
  for (const checkFn of checks) {
    console.log(`Running: ${checkFn.name}...`);
    try {
      const result = await checkFn();
      results.push(result);
      const icon = result.status === 'PASS' ? '✅' :
                   result.status === 'WARN' ? '⚠️' :
                   result.status === 'SKIP' ? '⏭️' : '❌';
      console.log(`  ${icon} ${result.check}: ${result.status} — ${result.detail}`);
    } catch (err) {
      results.push({
        check: checkFn.name,
        status: 'FAIL',
        detail: `Check threw exception: ${err.message}`,
        evidence: { error: err.message },
        durationMs: 0,
      });
      console.log(`  ❌ ${checkFn.name}: FAIL — ${err.message}`);
    }
    console.log('');
  }

  const healthStatus = classifyHealth(results);
  const totalDurationMs = parseInt(hrDuration(totalStart));

  const meta = {
    timestamp,
    sessionId,
    totalDurationMs,
    n8nBaseUrl: CONFIG.n8nBaseUrl,
    workflowId: CONFIG.workflowId,
    hasApiKey: !!CONFIG.n8nApiKey,
  };

  // Generate outputs
  const jsonOutput = {
    meta,
    healthStatus,
    results,
    summary: {
      total: results.length,
      pass: results.filter(r => r.status === 'PASS').length,
      warn: results.filter(r => r.status === 'WARN').length,
      skip: results.filter(r => r.status === 'SKIP').length,
      fail: results.filter(r => r.status === 'FAIL').length,
    },
  };

  const mdOutput = generateMarkdown(results, healthStatus, meta);

  // Determine evidence directory
  const evidenceDir = join(process.cwd(), 'evidence', `post-green-stabilization-${getTimestamp().substring(0, 15)}`);
  if (!existsSync(evidenceDir)) {
    mkdirSync(evidenceDir, { recursive: true });
  }

  // Write outputs
  const jsonPath = join(evidenceDir, 'dispatcher-health-check.json');
  const mdPath = join(evidenceDir, 'dispatcher-health-check.md');

  writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
  writeFileSync(mdPath, mdOutput, 'utf-8');

  console.log('='.repeat(60));
  console.log(`  Health Status: ${healthStatus}`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  Markdown: ${mdPath}`);
  console.log(`  Total Duration: ${totalDurationMs}ms`);
  console.log('='.repeat(60));

  // Exit codes
  const exitCodes = {
    HEALTH_GREEN: 0,
    HEALTH_GREEN_WITH_NOTES: 0,
    HEALTH_YELLOW: 1,
    HEALTH_RED: 2,
  };

  const exitCode = exitCodes[healthStatus] ?? 3;
  process.exit(exitCode);
}

main().catch(err => {
  console.error('Health check script error:', err.message);
  process.exit(3);
});
