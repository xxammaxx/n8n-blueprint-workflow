#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { diagnoseN8nHttp } from "./diagnose-n8n-http.mjs";
import { scanN8nLiveReadiness } from "./scan-n8n-live-readiness.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const findRepoRoot = (startDir) => {
  let current = path.resolve(startDir);
  while (true) {
    const hasMarkers =
      existsSync(path.join(current, "scripts")) &&
      existsSync(path.join(current, "workflows")) &&
      existsSync(path.join(current, "examples"));
    if (hasMarkers) return current;

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return path.resolve(startDir, "..");
};

const repoRoot = findRepoRoot(__dirname);
const evidenceDir = path.join(repoRoot, "evidence");
const trustedReadinessJsonPath = path.join(evidenceDir, "trusted-readiness-scan.json");
const trustedReadinessMdPath = path.join(evidenceDir, "trusted-readiness-scan.md");
const trustedDiagnosisJsonPath = path.join(evidenceDir, "n8n-http-diagnosis-trusted.json");
const trustedDiagnosisMdPath = path.join(evidenceDir, "n8n-http-diagnosis-trusted.md");
const trustedScanJsonPath = path.join(evidenceDir, "n8n-live-readiness-scan-trusted.json");
const trustedScanMdPath = path.join(evidenceDir, "n8n-live-readiness-scan-trusted.md");
const trustedApiMdPath = path.join(evidenceDir, "n8n-api-readiness-scan-trusted.md");

const RUNNER_NAME = "run-trusted-readiness-scan.mjs";
const RUNNER_MODE = "trusted_imported_functions";
const DEFAULT_BASE_URL = "http://192.168.1.52:5678";

const asText = (value, fallback = "") => {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const summarize = (value, maxLength = 300) => asText(value).replace(/\s+/g, " ").slice(0, maxLength);

const toBooleanEnv = (name) => asText(process.env[name]).toLowerCase() === "true";

const renderMarkdown = (result) => {
  const lines = [];
  lines.push("# Trusted Readiness Scan");
  lines.push("");
  lines.push(`Date: \`${result.generated_at}\``);
  lines.push(`Runner: \`${result.runner.name}\``);
  lines.push(`Mode: \`${result.runner.mode}\``);
  lines.push(`Repo root: \`${result.runner.repo_root}\``);
  lines.push(`Decision: \`${result.scan.decision}\``);
  lines.push(`Allowed next action: \`${result.scan.allowed_next_action}\``);
  lines.push("");
  lines.push("## Diagnosis");
  lines.push("");
  lines.push(`- Base URL: \`${result.diagnosis.n8n_base_url}\``);
  lines.push(`- Decision: \`${result.diagnosis.decision}\``);
  lines.push(`- Summary: ok=\`${result.diagnosis.summary.ok_count}\`, failed=\`${result.diagnosis.summary.failure_count}\`, timeout=\`${result.diagnosis.summary.timeout_count}\``);
  lines.push("");
  lines.push("## Scan");
  lines.push("");
  lines.push(`- Base status: \`${result.scan.base_status}\``);
  lines.push(`- API status: \`${result.scan.api_status}\``);
  lines.push(`- Workflow status: \`${result.scan.workflow_status}\``);
  lines.push(`- Workflow active: \`${result.scan.workflow_active}\``);
  lines.push(`- Credential status: \`${result.scan.credential_status}\``);
  lines.push(`- Webhook URL status: \`${result.scan.webhook_url_status}\``);
  lines.push(`- Webhook method: \`${result.scan.webhook_method}\``);
  lines.push("");
  lines.push("## Safety");
  lines.push("");
  lines.push(`- API key present: \`${result.safety.api_key_present}\``);
  lines.push(`- API key logged: \`${result.safety.api_key_logged}\``);
  lines.push(`- Secret values accessed: \`${result.safety.secret_values_accessed}\``);
  lines.push(`- Entrypoint tool gap accepted: \`${result.runner.entrypoint_tool_gap_accepted}\``);
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  if (!result.notes.length) {
    lines.push("- none");
  } else {
    for (const note of result.notes) lines.push(`- ${note}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
};

export const runTrustedReadinessScan = async ({ writeEvidence = true } = {}) => {
  mkdirSync(evidenceDir, { recursive: true });

  const baseUrl = asText(process.env.N8N_BASE_URL, DEFAULT_BASE_URL);
  const entrypointToolGapAccepted = toBooleanEnv("SPEC_KIT_ACCEPT_ENTRYPOINT_TOOL_GAP");

  const diagnosis = await diagnoseN8nHttp(baseUrl);
  const scan = await scanN8nLiveReadiness({
    writeEvidence,
    baseDiagnosis: diagnosis,
    evidencePaths: {
      scanJson: trustedScanJsonPath,
      scanMd: trustedScanMdPath,
      apiMd: trustedApiMdPath,
    },
    runnerContext: {
      name: RUNNER_NAME,
      mode: RUNNER_MODE,
      repo_root: repoRoot,
      cwd: process.cwd(),
      entrypoint_tool_gap_accepted: entrypointToolGapAccepted,
    },
  });

  const result = {
    generated_at: new Date().toISOString(),
    runner: {
      name: RUNNER_NAME,
      mode: RUNNER_MODE,
      repo_root: repoRoot,
      cwd: process.cwd(),
      script_dir: __dirname,
      entrypoint_tool_gap_accepted: entrypointToolGapAccepted,
    },
    diagnosis: {
      generated_at: diagnosis.generated_at,
      n8n_base_url: diagnosis.n8n_base_url,
      decision: diagnosis.decision,
      summary: diagnosis.summary,
      trusted_diagnosis_path: trustedDiagnosisJsonPath,
    },
    scan: {
      decision: scan.decision,
      allowed_next_action: scan.allowed_next_action,
      base_status: scan.n8n?.base_status || "N8N_BASE_UNKNOWN",
      api_status: scan.n8n?.api_status || "N8N_API_ERROR",
      workflow_status: scan.workflow?.status || "UNKNOWN",
      workflow_active: scan.workflow?.active === true,
      credential_status: scan.credential?.credential_status || "UNKNOWN",
      webhook_url_status: scan.webhook?.webhook_url_status || "UNKNOWN",
      webhook_method: scan.webhook?.webhook_method || "unknown",
      trusted_scan_path: trustedScanJsonPath,
    },
    safety: {
      api_key_present: Boolean(asText(process.env.N8N_API_KEY)),
      api_key_logged: false,
      secret_values_accessed: false,
    },
    notes: [],
  };

  if (scan.n8n?.base_status !== diagnosis.decision) {
    result.notes.push(
      `Scan base_status ${scan.n8n?.base_status || "N8N_BASE_UNKNOWN"} differs from diagnosis decision ${diagnosis.decision}.`,
    );
  }

  if (writeEvidence) {
    writeFileSync(trustedDiagnosisJsonPath, `${JSON.stringify(diagnosis, null, 2)}\n`, "utf8");
    writeFileSync(
      trustedDiagnosisMdPath,
      [
        "# Trusted HTTP Diagnosis",
        "",
        `Date: \`${diagnosis.generated_at}\``,
        `Base URL: \`${diagnosis.n8n_base_url}\``,
        `Decision: \`${diagnosis.decision}\``,
        "",
      ].join("\n"),
      "utf8",
    );
    writeFileSync(trustedReadinessJsonPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    writeFileSync(trustedReadinessMdPath, renderMarkdown(result), "utf8");
    process.stdout.write(
      `${trustedReadinessJsonPath}\n${trustedReadinessMdPath}\n${trustedDiagnosisJsonPath}\n${trustedScanJsonPath}\n`,
    );
  }

  return {
    ...result,
    diagnosis_raw: diagnosis,
    scan_raw: scan,
  };
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  runTrustedReadinessScan().catch((error) => {
    process.stderr.write(`${summarize(error.stack || error.message || String(error), 4000)}\n`);
    process.exit(1);
  });
}
