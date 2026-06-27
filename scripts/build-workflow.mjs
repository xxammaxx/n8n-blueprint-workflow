#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const workflowPath = path.join(repoRoot, "workflows", "spec-kit-opencode-proxmox-runner-orchestrator.json");

const loadFile = (relativePath) => readFileSync(path.join(repoRoot, relativePath), "utf8");
const toBase64 = (value) => Buffer.from(value, "utf8").toString("base64");
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");

const hostScript = loadFile("scripts/remote_runner_orchestrator.sh");
const containerPipeline = loadFile("scripts/container_pipeline.mjs");

const hostScriptB64 = toBase64(hostScript);
const containerPipelineB64 = toBase64(containerPipeline);
const hostScriptSha = sha256(hostScript);
const containerPipelineSha = sha256(containerPipeline);

const prepareCode = `const RUNNER_HOST_SCRIPT_B64 = '${hostScriptB64}';
const RUNNER_HOST_SCRIPT_SHA256 = '${hostScriptSha}';
const CONTAINER_PIPELINE_B64 = '${containerPipelineB64}';
const CONTAINER_PIPELINE_SHA256 = '${containerPipelineSha}';
const MAX_EMBEDDED_PAYLOAD_BYTES = 180 * 1024;
const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /AIza[0-9A-Za-z\\-_]{20,}/,
];

const asString = (value, fallback = '') => {
  if (value == null) return fallback;
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : fallback;
};

const asBoolean = (value, fallback) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowered = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(lowered)) return true;
    if (['false', '0', 'no', 'off'].includes(lowered)) return false;
  }
  return fallback;
};

const sanitizeProjectSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 63);

const shellEscape = (value) => {
  const stringValue = String(value ?? '');
  return "'" + stringValue.replace(/'/g, "'\\"'\\"'") + "'";
};

const normalizeMode = (value, proxmoxHost, dockerTargetHost) => {
  const raw = asString(value, dockerTargetHost === proxmoxHost ? 'direct-proxmox-docker' : 'separate-target-host');
  if (['direct-proxmox-docker', 'separate-target-host', 'unknown-target'].includes(raw)) {
    return raw;
  }
  return 'unknown-target';
};

const containsSecretLike = (value) => {
  const text = String(value || '');
  return SECRET_PATTERNS.some((pattern) => pattern.test(text));
};

const buildPreflightCommand = (payload) => {
  return [
    'set -eu',
    'PROXMOX_HOST=' + shellEscape(payload.proxmox_host),
    'DOCKER_TARGET_MODE=' + shellEscape(payload.docker_target_mode),
    'docker_reachable=false',
    'if command -v docker >/dev/null 2>&1 && docker version >/dev/null 2>&1; then docker_reachable=true; fi',
    'tool_gap=false',
    'message="Proxmox preflight completed."',
    'if [ "$DOCKER_TARGET_MODE" = "direct-proxmox-docker" ] && [ "$docker_reachable" != "true" ]; then tool_gap=true; message="TOOL_GAP: Docker target host not configured or Docker not reachable from Proxmox host."; fi',
    "printf '{\\"ok\\":true,\\"phase\\":\\"proxmox_preflight\\",\\"proxmox_host\\":\\"%s\\",\\"requested_mode\\":\\"%s\\",\\"docker_reachable\\":%s,\\"tool_gap\\":%s,\\"message\\":\\"%s\\"}\\\\n' \\"$PROXMOX_HOST\\" \\"$DOCKER_TARGET_MODE\\" \\"$docker_reachable\\" \\"$tool_gap\\" \\"$message\\"",
  ].join('\\n');
};

const buildRunnerCommand = (payload) => {
  return [
    'set -eu',
    'PAYLOAD_B64=' + shellEscape(payload.payload_b64),
    'RUNNER_HOST_SCRIPT_B64=' + shellEscape(RUNNER_HOST_SCRIPT_B64),
    'CONTAINER_PIPELINE_B64=' + shellEscape(CONTAINER_PIPELINE_B64),
    'RUNNER_CONTAINER_NAME=' + shellEscape(payload.runner_container_name),
    'TMP_DIR=$(mktemp -d /tmp/spec-kit-opencode-ssh-XXXXXX)',
    'cleanup() { rm -rf "$TMP_DIR"; }',
    'trap cleanup EXIT INT TERM',
    'printf %s "$PAYLOAD_B64" | base64 -d > "$TMP_DIR/payload.json"',
    'printf %s "$RUNNER_HOST_SCRIPT_B64" | base64 -d > "$TMP_DIR/remote_runner_orchestrator.sh"',
    'chmod 700 "$TMP_DIR/remote_runner_orchestrator.sh"',
    'CONTAINER_PIPELINE_B64="$CONTAINER_PIPELINE_B64" "$TMP_DIR/remote_runner_orchestrator.sh" "$TMP_DIR/payload.json" "$RUNNER_CONTAINER_NAME"',
  ].join('\\n');
};

const blueprintMarkdown = asString($json.blueprint_markdown);
const projectSlug = sanitizeProjectSlug($json.project_slug);
const proxmoxHost = asString($json.proxmox_host, '192.168.1.136');
const dockerTargetHost = asString($json.docker_target_host, proxmoxHost);
const dockerTargetMode = normalizeMode($json.docker_target_mode, proxmoxHost, dockerTargetHost);

const errors = [];
if (!projectSlug) errors.push('project_slug is required after sanitization.');
if (!blueprintMarkdown) errors.push('blueprint_markdown is required.');
if (!proxmoxHost) errors.push('proxmox_host is required.');
if (dockerTargetMode === 'separate-target-host' && !dockerTargetHost) {
  errors.push('docker_target_host is required for separate-target-host mode.');
}
if (dockerTargetMode === 'unknown-target') {
  errors.push('docker_target_mode is unknown-target. Configure docker_target_host and a supported mode before execution.');
}

const normalized = {
  project_slug: projectSlug,
  original_project_slug: asString($json.project_slug),
  proxmox_host: proxmoxHost,
  docker_target_host: dockerTargetHost,
  docker_target_mode: dockerTargetMode,
  runner_container_name: asString($json.runner_container_name, 'n8n-runners'),
  project_root: asString($json.project_root, '/workspace'),
  spec_kit_version: asString($json.spec_kit_version, 'v0.11.4'),
  spec_kit_plugin_module: asString($json.spec_kit_plugin_module),
  spec_kit_install_command: asString($json.spec_kit_install_command),
  prefer_spec_kit_skills: asBoolean($json.prefer_spec_kit_skills, false),
  dry_run: asBoolean($json.dry_run, false),
  live_dry_hop_only: asBoolean($json.live_dry_hop_only, false),
  allow_install_in_dry_hop: asBoolean($json.allow_install_in_dry_hop, false),
  opencode_install_command: asString($json.opencode_install_command, 'npm install -g opencode-ai'),
  model: asString($json.model),
  github_repo_url: asString($json.github_repo_url),
  enable_optional_quality_gates: asBoolean($json.enable_optional_quality_gates, true),
  enable_taskstoissues: asBoolean($json.enable_taskstoissues, true),
  enable_implement: asBoolean($json.enable_implement, false),
  enable_converge: asBoolean($json.enable_converge, true),
  constitution_prompt: asString($json.constitution_prompt),
  plan_prompt: asString($json.plan_prompt),
  checklist_prompt: asString($json.checklist_prompt),
  implement_prompt: asString($json.implement_prompt),
  converge_prompt: asString($json.converge_prompt),
  blueprint_markdown: blueprintMarkdown,
};

if (errors.length > 0) {
  return [
    {
      json: {
        should_execute_runner: false,
        final_response: {
          ok: false,
          error_code: 'VALIDATION_FAILED',
          message: 'Webhook payload validation failed.',
          errors,
          normalized_preview: {
            project_slug: normalized.project_slug,
            proxmox_host: normalized.proxmox_host,
            docker_target_host: normalized.docker_target_host,
            docker_target_mode: normalized.docker_target_mode,
          },
        },
      },
    },
  ];
}

const payloadJson = JSON.stringify(normalized);
if (containsSecretLike(payloadJson)) {
  return [
    {
      json: {
        should_execute_runner: false,
        final_response: {
          ok: false,
          error_code: 'SECRET_LIKE_PAYLOAD_BLOCKED',
          message: 'Webhook payload contains secret-like content and was blocked before SSH execution.',
        },
      },
    },
  ];
}

const payloadBytes = Buffer.byteLength(payloadJson, 'utf8');
if (payloadBytes > MAX_EMBEDDED_PAYLOAD_BYTES) {
  return [
    {
      json: {
        should_execute_runner: false,
        final_response: {
          ok: false,
          error_code: 'PAYLOAD_TOO_LARGE',
          message: 'Webhook payload is too large for SSH command embedding.',
          max_bytes: MAX_EMBEDDED_PAYLOAD_BYTES,
          actual_bytes: payloadBytes,
        },
      },
    },
  ];
}

normalized.payload_b64 = Buffer.from(payloadJson, 'utf8').toString('base64');
normalized.payload_bytes = payloadBytes;
normalized.runner_host_script_sha256 = RUNNER_HOST_SCRIPT_SHA256;
normalized.container_pipeline_sha256 = CONTAINER_PIPELINE_SHA256;
normalized.preflight_command = buildPreflightCommand(normalized);
normalized.runner_command = buildRunnerCommand(normalized);
normalized.should_execute_runner = false;

return [{ json: normalized }];`;

const preflightCode = `const safeParse = (value) => {
  try {
    return JSON.parse(String(value || '').trim());
  } catch {
    return null;
  }
};

const redactOutput = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/ghp_|github_pat_|sk-[A-Za-z0-9]{20,}|xox[baprs]-|BEGIN [A-Z ]*PRIVATE KEY|AIza[0-9A-Za-z\\-_]{20,}/.test(text)) {
    return '[redacted secret-like output]';
  }
  return text.slice(0, 2000);
};

const preflight = safeParse($json.stdout);
if (!preflight) {
  return [
    {
      json: {
        should_execute_runner: false,
        final_response: {
          ok: false,
          error_code: 'PROXMOX_PREFLIGHT_INVALID',
          message: 'Proxmox preflight did not return valid JSON.',
          raw_output: redactOutput($json.stdout),
        },
      },
    },
  ];
}

if ($json.docker_target_mode === 'direct-proxmox-docker' && preflight.tool_gap) {
  return [
    {
      json: {
        should_execute_runner: false,
        final_response: {
          ok: false,
          error_code: 'TOOL_GAP',
          message: 'TOOL_GAP: Docker target host not configured or Docker not reachable from Proxmox host.',
          proxmox_preflight: preflight,
        },
      },
    },
  ];
}

if ($json.docker_target_mode === 'unknown-target') {
  return [
    {
      json: {
        should_execute_runner: false,
        final_response: {
          ok: false,
          error_code: 'TOOL_GAP',
          message: 'TOOL_GAP: Docker target host not configured or Docker not reachable from Proxmox host.',
          proxmox_preflight: preflight,
        },
      },
    },
  ];
}

return [
  {
    json: {
      ...$json,
      proxmox_preflight: preflight,
      should_execute_runner: true,
    },
  },
];`;

const resultParserCode = `const safeParse = (value) => {
  try {
    return JSON.parse(String(value || '').trim());
  } catch {
    return null;
  }
};

const redactOutput = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/ghp_|github_pat_|sk-[A-Za-z0-9]{20,}|xox[baprs]-|BEGIN [A-Z ]*PRIVATE KEY|AIza[0-9A-Za-z\\-_]{20,}/.test(text)) {
    return '[redacted secret-like output]';
  }
  return text.slice(0, 4000);
};

if ($json.final_response) {
  return [{ json: $json.final_response }];
}

const parsed = safeParse($json.stdout);
if (!parsed) {
  return [
    {
      json: {
        ok: false,
        error_code: 'RUNNER_RESPONSE_INVALID',
        message: 'Runner host did not return valid JSON.',
        raw_output: redactOutput($json.stdout),
      },
    },
  ];
}

return [{ json: parsed }];`;

const workflow = {
  name: "Spec Kit OpenCode Proxmox Runner Orchestrator",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "spec-kit-opencode-proxmox-runner",
        responseMode: "responseNode",
        options: {},
      },
      id: "WebhookTrigger",
      name: "Webhook Trigger",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [-940, 20],
      webhookId: "spec-kit-opencode-proxmox-runner",
    },
    {
      parameters: {
        keepOnlySet: true,
        values: {
          string: [
            { name: "project_slug", value: "={{$json.body?.project_slug ?? $json.project_slug ?? ''}}" },
            { name: "proxmox_host", value: "={{$json.body?.proxmox_host ?? $json.proxmox_host ?? '192.168.1.136'}}" },
            { name: "docker_target_host", value: "={{$json.body?.docker_target_host ?? $json.docker_target_host ?? $json.body?.proxmox_host ?? $json.proxmox_host ?? '192.168.1.136'}}" },
            { name: "docker_target_mode", value: "={{$json.body?.docker_target_mode ?? $json.docker_target_mode ?? ''}}" },
            { name: "runner_container_name", value: "={{$json.body?.runner_container_name ?? $json.runner_container_name ?? 'n8n-runners'}}" },
            { name: "project_root", value: "={{$json.body?.project_root ?? $json.project_root ?? '/workspace'}}" },
            { name: "spec_kit_version", value: "={{$json.body?.spec_kit_version ?? $json.spec_kit_version ?? 'v0.11.4'}}" },
            { name: "spec_kit_plugin_module", value: "={{$json.body?.spec_kit_plugin_module ?? $json.spec_kit_plugin_module ?? ''}}" },
            { name: "spec_kit_install_command", value: "={{$json.body?.spec_kit_install_command ?? $json.spec_kit_install_command ?? ''}}" },
            { name: "opencode_install_command", value: "={{$json.body?.opencode_install_command ?? $json.opencode_install_command ?? 'npm install -g opencode-ai'}}" },
            { name: "model", value: "={{$json.body?.model ?? $json.model ?? ''}}" },
            { name: "github_repo_url", value: "={{$json.body?.github_repo_url ?? $json.github_repo_url ?? ''}}" },
            { name: "constitution_prompt", value: "={{$json.body?.constitution_prompt ?? $json.constitution_prompt ?? ''}}" },
            { name: "plan_prompt", value: "={{$json.body?.plan_prompt ?? $json.plan_prompt ?? ''}}" },
            { name: "checklist_prompt", value: "={{$json.body?.checklist_prompt ?? $json.checklist_prompt ?? ''}}" },
            { name: "implement_prompt", value: "={{$json.body?.implement_prompt ?? $json.implement_prompt ?? ''}}" },
            { name: "converge_prompt", value: "={{$json.body?.converge_prompt ?? $json.converge_prompt ?? ''}}" },
            { name: "blueprint_markdown", value: "={{$json.body?.blueprint_markdown ?? $json.blueprint_markdown ?? ''}}" },
          ],
          boolean: [
            { name: "enable_optional_quality_gates", value: "={{$json.body?.enable_optional_quality_gates ?? $json.enable_optional_quality_gates ?? true}}" },
            { name: "enable_taskstoissues", value: "={{$json.body?.enable_taskstoissues ?? $json.enable_taskstoissues ?? true}}" },
            { name: "enable_implement", value: "={{$json.body?.enable_implement ?? $json.enable_implement ?? false}}" },
            { name: "enable_converge", value: "={{$json.body?.enable_converge ?? $json.enable_converge ?? true}}" },
            { name: "prefer_spec_kit_skills", value: "={{$json.body?.prefer_spec_kit_skills ?? $json.prefer_spec_kit_skills ?? false}}" },
            { name: "dry_run", value: "={{$json.body?.dry_run ?? $json.dry_run ?? false}}" },
            { name: "live_dry_hop_only", value: "={{$json.body?.live_dry_hop_only ?? $json.live_dry_hop_only ?? false}}" },
            { name: "allow_install_in_dry_hop", value: "={{$json.body?.allow_install_in_dry_hop ?? $json.allow_install_in_dry_hop ?? false}}" },
          ],
        },
        options: {},
      },
      id: "NormalizeInput",
      name: "Normalize Input",
      type: "n8n-nodes-base.set",
      typeVersion: 3.4,
      position: [-700, 20],
    },
    {
      parameters: {
        jsCode: prepareCode,
      },
      id: "ValidatePrepare",
      name: "Validate And Prepare",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [-460, 20],
    },
    {
      parameters: {
        conditions: {
          boolean: [
            {
              value1: "={{!!$json.final_response}}",
              operation: "false",
            },
          ],
        },
      },
      id: "NeedsPreflight",
      name: "Needs Proxmox Preflight",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [-220, 20],
    },
    {
      parameters: {
        command: "={{$json.preflight_command}}",
      },
      id: "ProxmoxPreflight",
      name: "SSH Proxmox Preflight",
      type: "n8n-nodes-base.ssh",
      typeVersion: 1,
      position: [20, -80],
    },
    {
      parameters: {
        jsCode: preflightCode,
      },
      id: "EvaluatePreflight",
      name: "Evaluate Preflight",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [260, -80],
    },
    {
      parameters: {
        conditions: {
          boolean: [
            {
              value1: "={{$json.should_execute_runner}}",
              operation: "true",
            },
          ],
        },
      },
      id: "ShouldExecuteRunner",
      name: "Should Execute Runner",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [500, -80],
    },
    {
      parameters: {
        command: "={{$json.runner_command}}",
      },
      id: "RunnerExecution",
      name: "SSH Runner Execute",
      type: "n8n-nodes-base.ssh",
      typeVersion: 1,
      position: [740, -180],
    },
    {
      parameters: {
        jsCode: resultParserCode,
      },
      id: "ResultParser",
      name: "Result Parser",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [980, 20],
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "={{$json}}",
        options: {},
      },
      id: "RespondWebhook",
      name: "Respond To Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1220, 20],
    },
  ],
  connections: {
    "Webhook Trigger": {
      main: [[{ node: "Normalize Input", type: "main", index: 0 }]],
    },
    "Normalize Input": {
      main: [[{ node: "Validate And Prepare", type: "main", index: 0 }]],
    },
    "Validate And Prepare": {
      main: [[{ node: "Needs Proxmox Preflight", type: "main", index: 0 }]],
    },
    "Needs Proxmox Preflight": {
      main: [
        [{ node: "SSH Proxmox Preflight", type: "main", index: 0 }],
        [{ node: "Result Parser", type: "main", index: 0 }],
      ],
    },
    "SSH Proxmox Preflight": {
      main: [[{ node: "Evaluate Preflight", type: "main", index: 0 }]],
    },
    "Evaluate Preflight": {
      main: [[{ node: "Should Execute Runner", type: "main", index: 0 }]],
    },
    "Should Execute Runner": {
      main: [
        [{ node: "SSH Runner Execute", type: "main", index: 0 }],
        [{ node: "Result Parser", type: "main", index: 0 }],
      ],
    },
    "SSH Runner Execute": {
      main: [[{ node: "Result Parser", type: "main", index: 0 }]],
    },
    "Result Parser": {
      main: [[{ node: "Respond To Webhook", type: "main", index: 0 }]],
    },
  },
  pinData: {},
  settings: {
    executionOrder: "v1",
  },
  staticData: null,
  meta: null,
  tags: [],
};

const json = `${JSON.stringify(workflow, null, 2)}\n`;

if (process.argv.includes("--stdout")) {
  process.stdout.write(json);
} else {
  mkdirSync(path.dirname(workflowPath), { recursive: true });
  writeFileSync(workflowPath, json, "utf8");
  process.stdout.write(`${workflowPath}\n`);
}
