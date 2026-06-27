#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { runStableDiagnosis } from "./diagnose-n8n-http.mjs";

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

const getEnv = () => ({
  n8nBaseUrl: process.env.N8N_BASE_URL || "http://192.168.1.52:5678",
  proxmoxHost: process.env.PROXMOX_HOST || "192.168.1.136",
  runnerContainer: process.env.RUNNER_CONTAINER || "n8n-runners",
  workspace: process.env.WORKSPACE || "/workspace",
  expectedWorkflowName:
    process.env.SPEC_KIT_EXPECTED_WORKFLOW_NAME ||
    process.env.EXPECTED_WORKFLOW_NAME ||
    "Spec Kit OpenCode Proxmox Runner Orchestrator",
  expectedWebhookPath:
    process.env.SPEC_KIT_EXPECTED_WEBHOOK_PATH ||
    process.env.EXPECTED_WEBHOOK_PATH ||
    "spec-kit-opencode-proxmox-runner",
  expectedCredentialName:
    process.env.SPEC_KIT_EXPECTED_CREDENTIAL_NAME ||
    process.env.EXPECTED_CREDENTIAL_NAME ||
    "Proxmox Docker Host SSH",
  manualWebhookUrl: process.env.SPEC_KIT_N8N_WEBHOOK_URL || "",
  manualWebhookType: process.env.SPEC_KIT_N8N_WEBHOOK_URL_TYPE || "",
  apiKeyPresent: Boolean(String(process.env.N8N_API_KEY || "").trim()),
  acceptCredentialMetadataOnly:
    String(process.env.SPEC_KIT_ACCEPT_CREDENTIAL_METADATA_ONLY || "").trim().toLowerCase() === "true",
  playwrightStatus:
    process.env.PLAYWRIGHT_MCP_AGENT_STATUS || "PLAYWRIGHT_MCP_TOOL_GAP",
  playwrightReason:
    process.env.PLAYWRIGHT_MCP_AGENT_REASON || "No callable Playwright MCP tool was exposed in this session.",
});

const getPaths = () => ({
  workflowJson: path.join(repoRoot, "workflows", "spec-kit-opencode-proxmox-runner-orchestrator.json"),
  liveDryHopPayload: path.join(repoRoot, "examples", "live-dry-hop-payload.example.json"),
  buildScript: path.join(repoRoot, "scripts", "build-workflow.mjs"),
  dryRunScript: path.join(repoRoot, "scripts", "dry-run-local.mjs"),
  validateScript: path.join(repoRoot, "scripts", "validate-local.mjs"),
  scanJson: path.join(evidenceDir, "n8n-live-readiness-scan.json"),
  scanMd: path.join(evidenceDir, "n8n-live-readiness-scan.md"),
  apiMd: path.join(evidenceDir, "n8n-api-readiness-scan.md"),
});

const getOutputPaths = (paths, evidencePaths = {}) => ({
  scanJson: evidencePaths.scanJson || paths.scanJson,
  scanMd: evidencePaths.scanMd || paths.scanMd,
  apiMd: evidencePaths.apiMd || paths.apiMd,
});

const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /-----BEGIN OPENSSH PRIVATE KEY-----/,
  /AIza[0-9A-Za-z\-_]{20,}/,
];

const BANNED_PATTERNS = [
  /\bqm destroy\b/,
  /\bpct destroy\b/,
  /\bdocker rm\b/,
  /\bdocker volume rm\b/,
  /\bdocker system prune\b/,
  /\bgit reset --hard\b/,
  /\/speckit\.implement\b/,
  /\/speckit\.taskstoissues\b/,
  /--yolo\b/,
];

const asString = (value, fallback = "") => {
  if (value == null) return fallback;
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : fallback;
};

const summarizeText = (value, maxLength = 500) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (SECRET_PATTERNS.some((pattern) => pattern.test(text))) {
    return "[redacted secret-like output]";
  }
  return text.slice(0, maxLength);
};

const hasSecretLike = (value) => SECRET_PATTERNS.some((pattern) => pattern.test(String(value || "")));

const safeReadJson = (targetPath) => {
  try {
    const raw = readFileSync(targetPath, "utf8").replace(/^\uFEFF/, "");
    return {
      ok: true,
      value: JSON.parse(raw),
      raw,
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      raw: "",
      error: summarizeText(error.message || String(error), 300),
    };
  }
};

const runNodeScript = (relativePath) => {
  const result = spawnSync("node", [relativePath], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
  return {
    command: `node ${relativePath.replaceAll("\\", "/")}`,
    exit_code: typeof result.status === "number" ? result.status : 1,
    ok: result.status === 0,
    stdout: summarizeText(result.stdout, 4000),
    stderr: summarizeText(result.stderr, 2000),
  };
};

const escapePowerShellSingleQuoted = (value) => String(value || "").replace(/'/g, "''");

const httpProbePowerShell = (url, includeApiKey = false) => {
  const safeUrl = escapePowerShellSingleQuoted(url);
  const headerLine = includeApiKey
    ? "$headers = @{ 'X-N8N-API-KEY' = $env:N8N_API_KEY; 'Accept' = 'application/json' }"
    : "$headers = @{ 'Accept' = 'application/json' }";
  const command = [
    "$ErrorActionPreference='Stop'",
    headerLine,
    `$uri='${safeUrl}'`,
    "try {",
    "  $resp = Invoke-WebRequest -UseBasicParsing -Uri $uri -Headers $headers -TimeoutSec 10",
    "  [pscustomobject]@{ ok=$true; status=[int]$resp.StatusCode; body=[string]$resp.Content; error='' } | ConvertTo-Json -Compress",
    "} catch {",
    "  $status = -1",
    "  $body = ''",
    "  if ($_.Exception.Response) {",
    "    try { $status = [int]$_.Exception.Response.StatusCode } catch {}",
    "    try { $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $body = $sr.ReadToEnd() } catch {}",
    "  }",
    "  [pscustomobject]@{ ok=$false; status=$status; body=[string]$body; error=[string]$_.Exception.Message } | ConvertTo-Json -Compress",
    "}",
  ].join("; ");

  const result = spawnSync("powershell", ["-NoProfile", "-Command", command], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

  if (result.status !== 0 && !result.stdout.trim()) {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: summarizeText(result.stderr || result.error || "PowerShell HTTP probe failed", 300),
    };
  }

  const parsed = tryParseJson(result.stdout);
  if (!parsed) {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: summarizeText(result.stdout || result.stderr || "PowerShell HTTP probe returned invalid JSON", 300),
    };
  }

  return {
    ok: parsed.ok === true,
    status: Number.isFinite(parsed.status) ? parsed.status : -1,
    body_text: String(parsed.body || ""),
    body_preview: summarizeText(parsed.body || "", 1000),
    content_type: "",
    error: parsed.error ? summarizeText(parsed.error, 300) : undefined,
  };
};

const httpProbe = async (url, init = {}) => {
  try {
    const response = await fetch(url, {
      ...init,
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      body_text: text,
      body_preview: summarizeText(text, 1000),
      content_type: response.headers.get("content-type") || "",
    };
  } catch (error) {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: summarizeText(error.message || String(error), 300),
    };
  }
};

const httpProbeCurl = (url, includeApiKey = false) => {
  if (process.platform !== "win32") {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: "curl.exe fallback is only enabled on Windows in this project.",
    };
  }

  const args = [
    "-sS",
    "--max-time",
    "10",
    "-H",
    "Accept: application/json",
  ];
  if (includeApiKey && process.env.N8N_API_KEY) {
    args.push("-H", `X-N8N-API-KEY: ${process.env.N8N_API_KEY}`);
  }
  args.push(
    "-o",
    "-",
    "-w",
    "\nCURL_HTTP_STATUS:%{http_code}\nCURL_CONTENT_TYPE:%{content_type}",
    url,
  );

  const result = spawnSync("curl.exe", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

  const output = String(result.stdout || "");
  const statusMatch = output.match(/CURL_HTTP_STATUS:(\d{3})/);
  const contentTypeMatch = output.match(/CURL_CONTENT_TYPE:(.*)$/m);
  const body = output
    .replace(/\nCURL_HTTP_STATUS:\d{3}[\s\S]*$/m, "")
    .trim();
  const status = Number(statusMatch?.[1] || 0);

  if (result.status !== 0 && status === 0) {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: summarizeText(result.stderr || "curl.exe fallback failed", 300),
    };
  }

  return {
    ok: status >= 200 && status < 300,
    status,
    body_text: body,
    body_preview: summarizeText(body, 1000),
    content_type: summarizeText(contentTypeMatch?.[1] || "", 160),
  };
};

const httpProbeInlineNode = (url, includeApiKey = false) => {
  const code = [
    "const headers = { Accept: 'application/json' };",
    includeApiKey
      ? "if (process.env.N8N_API_KEY) headers['X-N8N-API-KEY'] = process.env.N8N_API_KEY;"
      : "",
    `const targetUrl = ${JSON.stringify(url)};`,
    "try {",
    "  const response = await fetch(targetUrl, { headers, redirect: 'follow', signal: AbortSignal.timeout(10000) });",
    "  const text = await response.text();",
    "  console.log(JSON.stringify({ ok: response.ok, status: response.status, body_text: text, content_type: response.headers.get('content-type') || '' }));",
    "} catch (error) {",
    "  console.log(JSON.stringify({ ok: false, status: -1, error_name: error?.name || 'Error', error_code: error?.code || '', error: error?.message || String(error) }));",
    "}",
  ].filter(Boolean).join("\n");

  const result =
    process.platform === "win32"
      ? spawnSync(
          "powershell",
          [
            "-NoProfile",
            "-Command",
            `@'\n${code}\n'@ | node --input-type=module -`,
          ],
          {
            cwd: repoRoot,
            encoding: "utf8",
            maxBuffer: 16 * 1024 * 1024,
          },
        )
      : spawnSync("node", ["--input-type=module", "-"], {
          cwd: repoRoot,
          encoding: "utf8",
          input: code,
          maxBuffer: 16 * 1024 * 1024,
        });

  if (result.status !== 0 && !String(result.stdout || "").trim()) {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: summarizeText(result.stderr || result.error || "Inline node HTTP probe failed", 300),
    };
  }

  const parsed = tryParseJson(String(result.stdout || "").trim());
  if (!parsed) {
    return {
      ok: false,
      status: -1,
      body_text: "",
      body_preview: "",
      content_type: "",
      error: summarizeText(result.stdout || result.stderr || "Inline node HTTP probe returned invalid JSON", 300),
    };
  }

  return {
    ok: parsed.ok === true,
    status: Number.isFinite(parsed.status) ? parsed.status : -1,
    body_text: String(parsed.body_text || ""),
    body_preview: summarizeText(parsed.body_text || "", 1000),
    content_type: String(parsed.content_type || ""),
    error: parsed.error ? summarizeText(parsed.error, 300) : undefined,
  };
};

const tryParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const deriveWebhookUrl = (baseUrl, webhookPath, type) => {
  const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
  const normalizedPath = String(webhookPath || "").replace(/^\/+/, "");
  if (!normalizedBase || !normalizedPath) return "";
  const prefix = type === "test" ? "/webhook-test/" : "/webhook/";
  return `${normalizedBase}${prefix}${normalizedPath}`;
};

const parseManualWebhookEnv = (env) => {
  const url = asString(env.manualWebhookUrl);
  const type = asString(env.manualWebhookType, "unknown").toLowerCase();
  if (!url) {
    return {
      present: false,
      status: "skipped",
      type: "unknown",
      url: "",
      error: "",
    };
  }

  try {
    const parsed = new URL(url);
    return {
      present: true,
      status: "checked",
      type: type === "test" || type === "production" ? type : "unknown",
      url: parsed.toString(),
      error: "",
      secret_like: hasSecretLike(parsed.toString()),
    };
  } catch (error) {
    return {
      present: true,
      status: "failed",
      type: type === "test" || type === "production" ? type : "unknown",
      url,
      error: summarizeText(error.message || String(error), 300),
      secret_like: hasSecretLike(url),
    };
  }
};

const findWorkflowMatches = (payload, expectedWorkflowName) => {
  if (!payload || typeof payload !== "object") return [];
  const candidates = [];
  if (Array.isArray(payload)) candidates.push(...payload);
  if (Array.isArray(payload.data)) candidates.push(...payload.data);
  if (Array.isArray(payload.items)) candidates.push(...payload.items);
  return candidates.filter((item) => asString(item.name) === expectedWorkflowName);
};

const parseWorkflowNodes = (nodes) => {
  const list = Array.isArray(nodes) ? nodes : [];
  const webhookNode = list.find((node) => node.type === "n8n-nodes-base.webhook");
  const respondNode = list.find((node) => node.type === "n8n-nodes-base.respondToWebhook");
  const sshNodes = list.filter((node) => node.type === "n8n-nodes-base.ssh");

  const sshCredentialMetadata = sshNodes.map((node) => {
    const sshCredential = node.credentials?.ssh || {};
    return {
      node_name: asString(node.name),
      credential_name: asString(sshCredential.name),
      credential_id: asString(sshCredential.id),
    };
  });

  return {
    webhookNode,
    respondNode,
    sshNodes,
    sshCredentialMetadata,
  };
};

const renderScanMarkdown = (scan) => {
  const lines = [];
  lines.push("# n8n Live Readiness Scan");
  lines.push("");
  lines.push(`Date: \`${scan.generated_at}\``);
  lines.push(`Decision: \`${scan.decision}\``);
  lines.push(`Allowed next action: \`${scan.allowed_next_action}\``);
  lines.push("");
  lines.push("## Sources");
  lines.push("");
  for (const [name, status] of Object.entries(scan.sources)) {
    lines.push(`- ${name}: \`${status}\``);
  }
  lines.push("");
  lines.push("## n8n");
  lines.push("");
  lines.push(`- Base URL: \`${scan.n8n.base_url}\``);
  lines.push(`- Base status: \`${scan.n8n.base_status}\``);
  lines.push(`- API status: \`${scan.n8n.api_status}\``);
  lines.push(`- API key present: \`${scan.n8n.api_key_present}\``);
  lines.push("");
  lines.push("## Workflow");
  lines.push("");
  lines.push(`- Status: \`${scan.workflow.status}\``);
  lines.push(`- Expected name: \`${scan.workflow.name_expected}\``);
  lines.push(`- ID: \`${scan.workflow.id || ""}\``);
  lines.push(`- Active: \`${scan.workflow.active}\``);
  lines.push("");
  lines.push("## Webhook");
  lines.push("");
  lines.push(`- URL status: \`${scan.webhook.webhook_url_status}\``);
  lines.push(`- URL type: \`${scan.webhook.webhook_url_type}\``);
  lines.push(`- Method: \`${scan.webhook.webhook_method}\``);
  lines.push(`- Path: \`${scan.webhook.webhook_path}\``);
  lines.push(`- Source: \`${scan.webhook.source}\``);
  if (scan.webhook.webhook_url) lines.push(`- URL: \`${scan.webhook.webhook_url}\``);
  lines.push("");
  lines.push("## Credential");
  lines.push("");
  lines.push(`- Status: \`${scan.credential.credential_status}\``);
  lines.push(`- Expected name: \`${scan.credential.credential_name_expected}\``);
  lines.push(`- SSH nodes checked: \`${scan.credential.ssh_nodes_checked}\``);
  lines.push(`- Secret values accessed: \`${scan.credential.secret_values_accessed}\``);
  if (scan.credential.metadata_only_accepted_by_env) {
    lines.push(`- Metadata-only acceptance: \`${scan.credential.metadata_only_accepted_by_env}\``);
  }
  lines.push("");
  lines.push("## Payload");
  lines.push("");
  lines.push(`- Safe: \`${scan.payload.safe}\``);
  lines.push(`- dry_run: \`${scan.payload.dry_run}\``);
  lines.push(`- live_dry_hop_only: \`${scan.payload.live_dry_hop_only}\``);
  lines.push(`- enable_implement: \`${scan.payload.enable_implement}\``);
  lines.push(`- enable_taskstoissues: \`${scan.payload.enable_taskstoissues}\``);
  lines.push(`- enable_converge: \`${scan.payload.enable_converge}\``);
  lines.push("");
  lines.push("## Local Gates");
  lines.push("");
  for (const gate of scan.local_gates.commands) {
    lines.push(`- \`${gate.command}\` -> Exit \`${gate.exit_code}\``);
  }
  lines.push("");
  lines.push("## Reasons");
  lines.push("");
  if (scan.reasons.length === 0) lines.push("- none");
  for (const reason of scan.reasons) lines.push(`- ${reason}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
};

const renderApiMarkdown = (scan) => {
  const lines = [];
  lines.push("# n8n API Readiness Scan");
  lines.push("");
  lines.push(`Date: \`${scan.generated_at}\``);
  lines.push(`API status: \`${scan.n8n.api_status}\``);
  lines.push(`API key present: \`${scan.n8n.api_key_present}\``);
  lines.push(`Source status: \`${scan.sources.n8n_public_api}\``);
  lines.push("");
  lines.push("## API Endpoint");
  lines.push("");
  lines.push(`- Base URL: \`${scan.n8n.base_url}\``);
  lines.push(`- Endpoint: \`${scan.api_scan.endpoint}\``);
  lines.push(`- HTTP status: \`${scan.api_scan.http_status}\``);
  lines.push(`- Read-only scan: \`true\``);
  lines.push("");
  lines.push("## Workflow Result");
  lines.push("");
  lines.push(`- Workflow status: \`${scan.workflow.status}\``);
  lines.push(`- Workflow confirmed: \`${scan.workflow.status === "CONFIRMED_IMPORTED"}\``);
  lines.push(`- Workflow active: \`${scan.workflow.active}\``);
  lines.push(`- Webhook confirmed: \`${scan.webhook.webhook_url_status === "CONFIRMED_FROM_UI_OR_API"}\``);
  lines.push(`- Credential status: \`${scan.credential.credential_status}\``);
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  if (!scan.api_scan.notes.length) lines.push("- none");
  for (const note of scan.api_scan.notes) lines.push(`- ${note}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
};

const probeWithFallback = async (url, includeApiKey = false) => {
  if (process.platform === "win32") {
    const curl = httpProbeCurl(url, includeApiKey);
    if (curl.status !== -1) return curl;
    const inline = httpProbeInlineNode(url, includeApiKey);
    if (inline.status !== -1) return inline;
    const powershell = httpProbePowerShell(url, includeApiKey);
    if (powershell.status !== -1) return powershell;
  }

  const primary = await httpProbe(url, includeApiKey
    ? {
        headers: {
          Accept: "application/json",
          "X-N8N-API-KEY": process.env.N8N_API_KEY,
        },
      }
    : {
        headers: {
          Accept: "application/json",
        },
      });

  if (primary.status !== -1) return primary;
  return httpProbePowerShell(url, includeApiKey);
};

export const scanN8nLiveReadiness = async ({
  writeEvidence = true,
  baseDiagnosis = null,
  evidencePaths = {},
  runnerContext = null,
} = {}) => {
  mkdirSync(evidenceDir, { recursive: true });
  const env = getEnv();
  const paths = getPaths();
  const outputPaths = getOutputPaths(paths, evidencePaths);

  const scan = {
    generated_at: new Date().toISOString(),
    runner: runnerContext
      ? {
          ...runnerContext,
        }
      : undefined,
    sources: {
      local_workflow_json: "skipped",
      n8n_base_http: "skipped",
      n8n_public_api: "not_available",
      playwright_mcp_ui: "skipped",
      manual_env: "skipped",
    },
    n8n: {
      base_url: env.n8nBaseUrl,
      base_status: "N8N_UNKNOWN",
      api_status: env.apiKeyPresent ? "N8N_API_ERROR" : "N8N_API_AUTH_MISSING",
      api_key_present: env.apiKeyPresent,
    },
    local_project: {
      repo_root_exists: existsSync(repoRoot),
      workflow_json_exists: existsSync(paths.workflowJson),
      live_dry_hop_payload_exists: existsSync(paths.liveDryHopPayload),
      scan_script_exists: existsSync(path.join(repoRoot, "scripts", "scan-n8n-live-readiness.mjs")),
    },
    local_gates: {
      ok: false,
      commands: [],
    },
    local_workflow_scan: {},
    base_http: {},
    api_scan: {
      endpoint: new URL("/api/v1/workflows", env.n8nBaseUrl).toString(),
      http_status: 0,
      notes: [],
      workflow_matches: 0,
      node_count: 0,
      ssh_nodes_count: 0,
      response_mode_confirmed: false,
      webhook_method_confirmed: false,
      webhook_path_confirmed: false,
    },
    workflow: {
      status: "UNKNOWN",
      name_expected: env.expectedWorkflowName,
      id: "",
      active: false,
      source: "unknown",
    },
    webhook: {
      webhook_url_status: "UNKNOWN",
      webhook_url: "",
      webhook_url_type: "unknown",
      webhook_method: "unknown",
      webhook_path: env.expectedWebhookPath,
      source: "unknown",
    },
    credential: {
      credential_status: "UNKNOWN",
      credential_name_expected: env.expectedCredentialName,
      ssh_nodes_checked: false,
      secret_values_accessed: false,
      metadata_only_accepted_by_env: env.acceptCredentialMetadataOnly,
      ssh_node_credential_metadata: [],
    },
    payload: {
      safe: false,
      dry_run: false,
      live_dry_hop_only: false,
      enable_implement: false,
      enable_taskstoissues: false,
      enable_converge: false,
      secret_like_found: false,
    },
    playwright: {
      status: env.playwrightStatus,
      reason: env.playwrightReason,
      tool_available: env.playwrightStatus === "PLAYWRIGHT_MCP_READY",
      used: false,
    },
    reasons: [],
    decision: "GREEN_PARTIAL_TOOL_GAP",
    allowed_next_action: "STOP_AND_DOCUMENT",
  };

  const localGateResults = [
    runNodeScript("scripts/build-workflow.mjs"),
    runNodeScript("scripts/dry-run-local.mjs"),
    runNodeScript("scripts/validate-local.mjs"),
  ];
  scan.local_gates.commands = localGateResults;
  scan.local_gates.ok = localGateResults.every((result) => result.ok);

  const payloadResult = safeReadJson(paths.liveDryHopPayload);
  scan.local_project.payload_json_valid = payloadResult.ok;
  scan.local_project.payload_json_error = payloadResult.error;
  if (payloadResult.ok && payloadResult.value) {
    const payload = payloadResult.value;
    scan.payload = {
      safe:
        payload.dry_run === true &&
        payload.live_dry_hop_only === true &&
        payload.enable_implement === false &&
        payload.enable_taskstoissues === false &&
        payload.enable_converge === false &&
        !hasSecretLike(payloadResult.raw),
      dry_run: payload.dry_run === true,
      live_dry_hop_only: payload.live_dry_hop_only === true,
      enable_implement: payload.enable_implement === true,
      enable_taskstoissues: payload.enable_taskstoissues === true,
      enable_converge: payload.enable_converge === true,
      secret_like_found: hasSecretLike(payloadResult.raw),
    };
  }

  const workflowResult = safeReadJson(paths.workflowJson);
  scan.local_workflow_scan.workflow_json_valid = workflowResult.ok;
  scan.local_workflow_scan.workflow_json_error = workflowResult.error;

  if (workflowResult.ok && workflowResult.value) {
    scan.sources.local_workflow_json = "checked";
    const nodesInfo = parseWorkflowNodes(workflowResult.value.nodes);
    scan.local_workflow_scan = {
      ...scan.local_workflow_scan,
      workflow_name: asString(workflowResult.value.name),
      expected_workflow_name_matches: asString(workflowResult.value.name) === env.expectedWorkflowName,
      webhook_node_present: Boolean(nodesInfo.webhookNode),
      webhook_method: asString(nodesInfo.webhookNode?.parameters?.httpMethod, "unknown"),
      webhook_path: asString(nodesInfo.webhookNode?.parameters?.path, "unknown"),
      response_mode: asString(nodesInfo.webhookNode?.parameters?.responseMode, "unknown"),
      respond_to_webhook_node_present: Boolean(nodesInfo.respondNode),
      ssh_nodes_present: nodesInfo.sshNodes.length > 0,
      ssh_nodes_count: nodesInfo.sshNodes.length,
      ssh_node_names: nodesInfo.sshNodes.map((node) => node.name),
      credential_reference_name: asString(nodesInfo.sshCredentialMetadata[0]?.credential_name),
      credentials_visible_in_json: nodesInfo.sshCredentialMetadata.some(
        (item) => item.credential_name || item.credential_id,
      ),
      secret_like_content_found: hasSecretLike(workflowResult.raw),
      destructive_patterns_found: BANNED_PATTERNS.filter((pattern) => pattern.test(workflowResult.raw)).map(String),
    };

    scan.webhook.webhook_method = scan.local_workflow_scan.webhook_method;
    scan.webhook.webhook_path = scan.local_workflow_scan.webhook_path || env.expectedWebhookPath;
  } else {
    scan.sources.local_workflow_json = "failed";
  }

  const effectiveBaseDiagnosis = baseDiagnosis || (await runStableDiagnosis(env.n8nBaseUrl));
  const healthz = await probeWithFallback(new URL("/healthz", env.n8nBaseUrl).toString());
  const settings = await probeWithFallback(new URL("/rest/settings", env.n8nBaseUrl).toString());
  const workflowsAnon = await probeWithFallback(new URL("/rest/workflows", env.n8nBaseUrl).toString());
  const credentialsAnon = await probeWithFallback(new URL("/rest/credentials", env.n8nBaseUrl).toString());
  scan.base_http = {
    diagnosis: effectiveBaseDiagnosis,
    healthz,
    settings,
    workflows_anonymous: workflowsAnon,
    credentials_anonymous: credentialsAnon,
  };
  scan.sources.n8n_base_http = "checked";

  scan.n8n.base_status = effectiveBaseDiagnosis.decision || "N8N_BASE_UNKNOWN";

  const manualWebhook = parseManualWebhookEnv(env);
  scan.sources.manual_env = manualWebhook.status;

  scan.playwright = {
    status: env.playwrightStatus,
    reason: env.playwrightReason,
    tool_available: env.playwrightStatus === "PLAYWRIGHT_MCP_READY",
    used: false,
  };
  scan.sources.playwright_mcp_ui =
    env.playwrightStatus === "PLAYWRIGHT_MCP_READY"
      ? "checked"
      : env.playwrightStatus === "PLAYWRIGHT_MCP_AUTH_REQUIRED"
        ? "auth_required"
        : env.playwrightStatus === "RED_HOLD_SECRET_EXPOSURE_RISK"
          ? "failed"
          : "tool_gap";

  if (!env.apiKeyPresent) {
    scan.sources.n8n_public_api = "auth_missing";
    scan.n8n.api_status = "N8N_API_AUTH_MISSING";
    scan.api_scan.notes.push("N8N_API_KEY is not present in this shell session.");
  } else {
    const apiResponse = await probeWithFallback(scan.api_scan.endpoint, true);
    scan.api_scan.http_status = apiResponse.status;

    if (apiResponse.status === 401 || apiResponse.status === 403) {
      scan.sources.n8n_public_api = "auth_failed";
      scan.n8n.api_status = "N8N_API_AUTH_FAILED";
      scan.api_scan.notes.push("Authenticated request to /api/v1/workflows was rejected.");
    } else if (apiResponse.status === 404 || apiResponse.status === 405) {
      scan.sources.n8n_public_api = "not_available";
      scan.n8n.api_status = "N8N_API_NOT_AVAILABLE";
      scan.api_scan.notes.push("/api/v1/workflows is not available on this n8n instance.");
    } else if (apiResponse.status === -1) {
      scan.sources.n8n_public_api = "failed";
      scan.n8n.api_status = "N8N_API_ERROR";
      scan.api_scan.notes.push(`API request failed: ${apiResponse.error || "unknown error"}.`);
    } else {
      scan.sources.n8n_public_api = "checked";
      const parsed = tryParseJson(apiResponse.body_text);
      if (!parsed) {
        scan.n8n.api_status = "N8N_API_ERROR";
        scan.api_scan.notes.push("API response from /api/v1/workflows was not valid JSON.");
      } else {
        scan.n8n.api_status = "N8N_API_READY";
        const matches = findWorkflowMatches(parsed, env.expectedWorkflowName);
        scan.api_scan.workflow_matches = matches.length;

        if (matches.length === 0) {
          scan.workflow.status = "MISSING";
          scan.api_scan.notes.push(`Workflow ${env.expectedWorkflowName} was not found via /api/v1/workflows.`);
        } else if (matches.length > 1) {
          scan.workflow.status = "MULTIPLE_MATCHES";
          scan.api_scan.notes.push(`Multiple workflows matched ${env.expectedWorkflowName}.`);
        } else {
          const workflow = matches[0];
          const nodesInfo = parseWorkflowNodes(workflow.nodes);
          scan.workflow = {
            status: "CONFIRMED_IMPORTED",
            name_expected: env.expectedWorkflowName,
            id: asString(workflow.id),
            active: workflow.active === true,
            source: "n8n_api",
          };
          scan.api_scan.node_count = Array.isArray(workflow.nodes) ? workflow.nodes.length : 0;
          scan.api_scan.ssh_nodes_count = nodesInfo.sshNodes.length;
          scan.api_scan.webhook_method_confirmed =
            asString(nodesInfo.webhookNode?.parameters?.httpMethod).toUpperCase() === "POST";
          scan.api_scan.webhook_path_confirmed =
            asString(nodesInfo.webhookNode?.parameters?.path) === env.expectedWebhookPath;
          scan.api_scan.response_mode_confirmed =
            Boolean(nodesInfo.respondNode) &&
            asString(nodesInfo.webhookNode?.parameters?.responseMode) === "responseNode";

          scan.credential.ssh_nodes_checked = nodesInfo.sshNodes.length > 0;
          scan.credential.ssh_node_credential_metadata = nodesInfo.sshCredentialMetadata;

          const credentialNames = nodesInfo.sshCredentialMetadata
            .map((item) => item.credential_name)
            .filter(Boolean);
          const credentialIds = nodesInfo.sshCredentialMetadata
            .map((item) => item.credential_id)
            .filter(Boolean);

          if (
            credentialNames.length === nodesInfo.sshNodes.length &&
            credentialNames.every((name) => name === env.expectedCredentialName)
          ) {
            scan.credential.credential_status = "CONFIRMED_ASSIGNED";
          } else if (
            credentialNames.length > 0 ||
            credentialIds.length > 0
          ) {
            scan.credential.credential_status = "METADATA_ONLY";
          } else if (nodesInfo.sshNodes.length > 0) {
            scan.credential.credential_status = "UNKNOWN";
          } else {
            scan.credential.credential_status = "MISSING";
          }

          if (
            workflow.active === true &&
            scan.api_scan.webhook_method_confirmed &&
            scan.api_scan.webhook_path_confirmed
          ) {
            scan.webhook = {
              webhook_url_status: "CONFIRMED_FROM_UI_OR_API",
              webhook_url: deriveWebhookUrl(env.n8nBaseUrl, env.expectedWebhookPath, "production"),
              webhook_url_type: "production",
              webhook_method: "POST",
              webhook_path: env.expectedWebhookPath,
              source: "n8n_api",
            };
          } else if (
            scan.api_scan.webhook_method_confirmed &&
            scan.api_scan.webhook_path_confirmed &&
            workflow.active !== true
          ) {
            scan.webhook = {
              webhook_url_status: "BLOCKED",
              webhook_url: "",
              webhook_url_type: "production",
              webhook_method: "POST",
              webhook_path: env.expectedWebhookPath,
              source: "n8n_api",
            };
            scan.api_scan.notes.push("Workflow exists, but production webhook use is blocked because it is not active.");
          }
        }
      }
    }
  }

  if (scan.credential.credential_status === "UNKNOWN" && scan.local_workflow_scan.ssh_nodes_present) {
    scan.credential.ssh_nodes_checked = true;
  }

  if (scan.webhook.webhook_url_status === "UNKNOWN") {
    if (manualWebhook.present && manualWebhook.status === "checked" && !manualWebhook.secret_like) {
      scan.webhook = {
        webhook_url_status: "BLOCKED",
        webhook_url: manualWebhook.url,
        webhook_url_type: manualWebhook.type || "unknown",
        webhook_method: scan.local_workflow_scan.webhook_method || "unknown",
        webhook_path: scan.local_workflow_scan.webhook_path || env.expectedWebhookPath,
        source: "manual_env",
      };
    } else if (scan.local_workflow_scan.webhook_node_present) {
      scan.webhook = {
        webhook_url_status: "LOCAL_ONLY_DERIVED",
        webhook_url: deriveWebhookUrl(env.n8nBaseUrl, env.expectedWebhookPath, "production"),
        webhook_url_type: "production",
        webhook_method: scan.local_workflow_scan.webhook_method || "unknown",
        webhook_path: scan.local_workflow_scan.webhook_path || env.expectedWebhookPath,
        source: "local_workflow_json",
        local_test_webhook_url: deriveWebhookUrl(env.n8nBaseUrl, env.expectedWebhookPath, "test"),
      };
    }
  }

  const redHold =
    scan.payload.secret_like_found ||
    scan.local_workflow_scan.secret_like_content_found ||
    hasSecretLike(manualWebhook.url || "");

  if (!scan.local_gates.ok) {
    scan.decision = "YELLOW_INCONSISTENT";
    scan.allowed_next_action = "FIX_LOCAL_ARTIFACTS";
    scan.reasons.push("At least one local gate failed during preflight.");
  }

  if (!scan.payload.safe) {
    scan.decision = "YELLOW_INCONSISTENT";
    scan.allowed_next_action = "FIX_LOCAL_ARTIFACTS";
    scan.reasons.push("Live dry-hop payload does not satisfy all required safe flags.");
  }

  if (redHold) {
    scan.decision = "RED_HOLD";
    scan.allowed_next_action = "RED_HOLD_STOP";
    scan.reasons.push("Secret-like content was detected in payload, workflow, or manual webhook environment input.");
  }

  if ((scan.local_workflow_scan.destructive_patterns_found || []).length > 0) {
    scan.decision = "RED_HOLD";
    scan.allowed_next_action = "RED_HOLD_STOP";
    scan.reasons.push("Destructive command patterns were detected in the local workflow JSON.");
  }

  if (scan.n8n.base_status === "N8N_BASE_INCONSISTENT") {
    if (scan.decision !== "RED_HOLD") {
      scan.decision = "YELLOW_INCONSISTENT";
      scan.allowed_next_action = "STOP_AND_DOCUMENT";
    }
    scan.reasons.push("n8n base HTTP checks are inconsistent across diagnostic methods.");
  } else if (scan.n8n.base_status !== "N8N_BASE_REACHABLE") {
    if (scan.decision !== "RED_HOLD" && scan.decision !== "YELLOW_INCONSISTENT") {
      scan.decision = "GREEN_PARTIAL_TOOL_GAP";
      scan.allowed_next_action = "STOP_AND_DOCUMENT";
    }
    scan.reasons.push(`n8n base is not fully reachable: ${scan.n8n.base_status}.`);
  }

  if (scan.n8n.api_status === "N8N_API_AUTH_MISSING") {
    scan.reasons.push("N8N_API_KEY is missing, so authenticated workflow and credential evidence could not be collected.");
  } else if (scan.n8n.api_status === "N8N_API_AUTH_FAILED") {
    scan.reasons.push("The provided N8N_API_KEY was rejected by the n8n public API.");
  } else if (scan.n8n.api_status === "N8N_API_NOT_AVAILABLE") {
    scan.reasons.push("The n8n public API endpoint /api/v1/workflows is not available on this instance.");
  } else if (scan.n8n.api_status === "N8N_API_ERROR") {
    scan.reasons.push("The authenticated n8n API scan failed before confirming workflow state.");
  }

  if (scan.workflow.status !== "CONFIRMED_IMPORTED") {
    if (scan.decision !== "RED_HOLD" && scan.decision !== "YELLOW_INCONSISTENT") {
      scan.decision = "GREEN_PARTIAL_TOOL_GAP";
      scan.allowed_next_action = "STOP_AND_DOCUMENT";
    }
    scan.reasons.push("Workflow import state is not confirmed by authenticated n8n API or UI evidence.");
  }

  if (scan.webhook.webhook_method !== "POST") {
    if (scan.decision !== "RED_HOLD") {
      scan.decision = "YELLOW_INCONSISTENT";
      scan.allowed_next_action = "FIX_LOCAL_ARTIFACTS";
    }
    scan.reasons.push("Webhook method is not confirmed as POST.");
  }

  if (scan.webhook.webhook_url_status !== "CONFIRMED_FROM_UI_OR_API") {
    if (scan.decision !== "RED_HOLD" && scan.decision !== "YELLOW_INCONSISTENT") {
      scan.decision = "GREEN_PARTIAL_TOOL_GAP";
      scan.allowed_next_action = "STOP_AND_DOCUMENT";
    }
    scan.reasons.push("Exact webhook URL is not confirmed from n8n API or UI evidence.");
  }

  if (scan.credential.credential_status === "METADATA_ONLY" && !env.acceptCredentialMetadataOnly) {
    if (scan.decision !== "RED_HOLD" && scan.decision !== "YELLOW_INCONSISTENT") {
      scan.decision = "GREEN_PARTIAL_TOOL_GAP";
      scan.allowed_next_action = "STOP_AND_DOCUMENT";
    }
    scan.reasons.push(
      "SSH credential metadata is present, but metadata-only confirmation is not accepted without SPEC_KIT_ACCEPT_CREDENTIAL_METADATA_ONLY=true.",
    );
  } else if (
    !["CONFIRMED_ASSIGNED", "METADATA_ONLY"].includes(scan.credential.credential_status)
  ) {
    if (scan.decision !== "RED_HOLD" && scan.decision !== "YELLOW_INCONSISTENT") {
      scan.decision = "GREEN_PARTIAL_TOOL_GAP";
      scan.allowed_next_action = "STOP_AND_DOCUMENT";
    }
    scan.reasons.push("SSH credential assignment is not confirmed by API or UI evidence.");
  }

  if (
    scan.local_gates.ok &&
    scan.payload.safe &&
    scan.n8n.base_status === "N8N_BASE_REACHABLE" &&
    scan.workflow.status === "CONFIRMED_IMPORTED" &&
    scan.workflow.active === true &&
    scan.webhook.webhook_url_status === "CONFIRMED_FROM_UI_OR_API" &&
    scan.webhook.webhook_method === "POST" &&
    (scan.credential.credential_status === "CONFIRMED_ASSIGNED" ||
      (scan.credential.credential_status === "METADATA_ONLY" && env.acceptCredentialMetadataOnly)) &&
    !redHold &&
    (scan.local_workflow_scan.destructive_patterns_found || []).length === 0
  ) {
    scan.decision = "READY_FOR_LIVE_POST";
    scan.allowed_next_action = "POST_LIVE_DRY_HOP";
    scan.reasons = [];
  }

  if (writeEvidence) {
    writeFileSync(outputPaths.scanJson, `${JSON.stringify(scan, null, 2)}\n`, "utf8");
    writeFileSync(outputPaths.scanMd, renderScanMarkdown(scan), "utf8");
    writeFileSync(outputPaths.apiMd, renderApiMarkdown(scan), "utf8");
    process.stdout.write(`${outputPaths.scanJson}\n${outputPaths.scanMd}\n${outputPaths.apiMd}\n`);
  }

  return scan;
};

export const runScan = scanN8nLiveReadiness;

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  scanN8nLiveReadiness().catch((error) => {
    process.stderr.write(`${error.stack || error.message || String(error)}\n`);
    process.exit(1);
  });
}
