#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const OFFICIAL_SPEC_KIT_REPO = "git+https://github.com/github/spec-kit.git";

const asString = (value, fallback = "") => {
  if (value == null) return fallback;
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : fallback;
};

const asBoolean = (value, fallback) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(lowered)) return true;
    if (["false", "0", "no", "off"].includes(lowered)) return false;
  }
  return fallback;
};

const sanitizeProjectSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);

const normalizeMode = (value, proxmoxHost, dockerTargetHost) => {
  const raw = asString(value, dockerTargetHost === proxmoxHost ? "direct-proxmox-docker" : "separate-target-host");
  if (["direct-proxmox-docker", "separate-target-host", "unknown-target"].includes(raw)) {
    return raw;
  }
  return "unknown-target";
};

const buildOfficialSpecKitInstallCommand = (version) =>
  `uv tool install specify-cli --from ${OFFICIAL_SPEC_KIT_REPO}@${version}`;

const normalizePayload = (payload) => {
  const proxmoxHost = asString(payload.proxmox_host, "192.168.1.136");
  const dockerTargetHost = asString(payload.docker_target_host, proxmoxHost);
  const normalized = {
    project_slug: sanitizeProjectSlug(payload.project_slug),
    proxmox_host: proxmoxHost,
    docker_target_host: dockerTargetHost,
    docker_target_mode: normalizeMode(payload.docker_target_mode, proxmoxHost, dockerTargetHost),
    runner_container_name: asString(payload.runner_container_name, "n8n-runners"),
    project_root: asString(payload.project_root, "/workspace"),
    spec_kit_version: asString(payload.spec_kit_version, "v0.11.4"),
    spec_kit_plugin_module: asString(payload.spec_kit_plugin_module),
    spec_kit_install_command: asString(payload.spec_kit_install_command),
    opencode_install_command: asString(payload.opencode_install_command, "npm install -g opencode-ai"),
    prefer_spec_kit_skills: asBoolean(payload.prefer_spec_kit_skills, false),
    enable_taskstoissues: asBoolean(payload.enable_taskstoissues, true),
    enable_implement: asBoolean(payload.enable_implement, false),
    dry_run: asBoolean(payload.dry_run, false),
    live_dry_hop_only: asBoolean(payload.live_dry_hop_only, false),
    allow_install_in_dry_hop: asBoolean(payload.allow_install_in_dry_hop, false),
    github_repo_url: asString(payload.github_repo_url),
    blueprint_markdown: asString(payload.blueprint_markdown),
  };

  const errors = [];
  if (!normalized.project_slug) errors.push("project_slug is required after sanitization.");
  if (!normalized.blueprint_markdown) errors.push("blueprint_markdown is required.");
  if (normalized.docker_target_mode === "separate-target-host" && !normalized.docker_target_host) {
    errors.push("docker_target_host is required for separate-target-host mode.");
  }
  if (normalized.docker_target_mode === "unknown-target") {
    errors.push("docker_target_mode is unknown-target. Configure docker_target_host and a supported mode before execution.");
  }

  return { normalized, errors };
};

const repoFile = (relativePath) => path.join(repoRoot, relativePath);
const previewPayload = (payload, filename) => {
  const temporaryDir = repoFile(".tmp");
  mkdirSync(temporaryDir, { recursive: true });
  const payloadPath = path.join(temporaryDir, filename);
  writeFileSync(payloadPath, JSON.stringify(payload, null, 2), "utf8");

  const result = spawnSync("node", [repoFile("scripts/container_pipeline.mjs"), payloadPath], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...process.env, SPEC_KIT_DRY_RUN: "1" },
  });

  if (result.status !== 0) {
    throw new Error(`Dry-run preview failed for ${filename}:\n${result.stdout}\n${result.stderr}`);
  }

  return JSON.parse(result.stdout);
};

const containerPipeline = readFileSync(repoFile("scripts/container_pipeline.mjs"), "utf8");
const hostScript = readFileSync(repoFile("scripts/remote_runner_orchestrator.sh"), "utf8");
const workflow = JSON.parse(readFileSync(repoFile("workflows/spec-kit-opencode-proxmox-runner-orchestrator.json"), "utf8"));
const payloadExample = JSON.parse(readFileSync(repoFile("examples/payload.example.json"), "utf8"));
const liveDryHopPayload = JSON.parse(readFileSync(repoFile("examples/live-dry-hop-payload.example.json"), "utf8"));

const regularPreview = previewPayload(payloadExample, "dry-run-payload.json");
const liveDryHopPreview = previewPayload(liveDryHopPayload, "live-dry-hop-preview-payload.json");
const blockedImplementPreview = previewPayload(
  {
    ...liveDryHopPayload,
    enable_implement: true,
  },
  "live-dry-hop-blocked-implement.json",
);

const happyPath = normalizePayload(payloadExample);
const dangerousSlug = normalizePayload({
  ...payloadExample,
  project_slug: "../Acme__Project!! ../../etc/passwd",
});
const missingBlueprint = normalizePayload({
  ...payloadExample,
  blueprint_markdown: "",
});
const noPluginOverride = normalizePayload({
  ...payloadExample,
  spec_kit_plugin_module: "",
  spec_kit_install_command: "",
});

const expectedDefaultInstallCommand = buildOfficialSpecKitInstallCommand(noPluginOverride.normalized.spec_kit_version);
const workflowText = JSON.stringify(workflow);

const checks = [
  {
    name: "payload_defaults",
    ok:
      happyPath.errors.length === 0 &&
      happyPath.normalized.proxmox_host === "192.168.1.136" &&
      happyPath.normalized.docker_target_host === "192.168.1.136" &&
      happyPath.normalized.runner_container_name === "n8n-runners",
    detail: happyPath.normalized,
  },
  {
    name: "dangerous_project_slug_sanitized",
    ok: dangerousSlug.normalized.project_slug === "acme-project-etc-passwd",
    detail: dangerousSlug.normalized.project_slug,
  },
  {
    name: "missing_blueprint_returns_controlled_error",
    ok: missingBlueprint.errors.includes("blueprint_markdown is required."),
    detail: missingBlueprint.errors,
  },
  {
    name: "official_spec_kit_default_rendered",
    ok:
      regularPreview.spec_kit_install_strategy === "official-uv-default" &&
      regularPreview.spec_kit_install_command === expectedDefaultInstallCommand,
    detail: {
      strategy: regularPreview.spec_kit_install_strategy,
      command: regularPreview.spec_kit_install_command,
    },
  },
  {
    name: "opencode_integration_rendered",
    ok:
      String(regularPreview.opencode_init_command).includes("--integration opencode") &&
      String(regularPreview.opencode_init_command).includes("--script sh") &&
      regularPreview.slash_command_fallback_dir === "/workspace/acme-project/.opencode/commands",
    detail: {
      opencode_init_command: regularPreview.opencode_init_command,
      slash_command_fallback_dir: regularPreview.slash_command_fallback_dir,
    },
  },
  {
    name: "taskstoissues_skips_without_remote",
    ok: String(regularPreview.taskstoissues_policy).includes("would be skipped"),
    detail: regularPreview.taskstoissues_policy,
  },
  {
    name: "runner_missing_container_error_path_present",
    ok:
      hostScript.includes("RUNNER_CONTAINER_NOT_FOUND") &&
      hostScript.includes("RUNNER_CONTAINER_NOT_RUNNING") &&
      regularPreview.runner_missing_container_error_code === "RUNNER_CONTAINER_NOT_FOUND",
    detail: regularPreview.runner_missing_container_error_code,
  },
  {
    name: "docker_unreachable_error_path_present",
    ok:
      hostScript.includes("DOCKER_UNREACHABLE") &&
      regularPreview.docker_unreachable_error_code === "DOCKER_UNREACHABLE",
    detail: regularPreview.docker_unreachable_error_code,
  },
  {
    name: "spec_kit_plugin_module_not_required",
    ok:
      !containerPipeline.includes("Spec Kit installation target is not configured.") &&
      !containerPipeline.includes("Set spec_kit_plugin_module or spec_kit_install_command") &&
      noPluginOverride.normalized.spec_kit_plugin_module === "" &&
      noPluginOverride.normalized.spec_kit_install_command === "",
    detail: "Official default is active without plugin override.",
  },
  {
    name: "live_dry_hop_preview_rendered",
    ok:
      liveDryHopPreview.phase === "container_pipeline_live_dry_hop_preview" &&
      liveDryHopPreview.live_dry_hop_only === true &&
      liveDryHopPreview.payload_dry_run === true &&
      liveDryHopPreview.live_dry_hop_canary_dir === "/workspace/_speckit_n8n_live_dry_hop_canary" &&
      liveDryHopPreview.live_dry_hop_canary_file ===
        "/workspace/_speckit_n8n_live_dry_hop_canary/.runtime/live-dry-hop.txt",
    detail: {
      phase: liveDryHopPreview.phase,
      canary_dir: liveDryHopPreview.live_dry_hop_canary_dir,
      canary_file: liveDryHopPreview.live_dry_hop_canary_file,
    },
  },
  {
    name: "dry_run_blocks_implement",
    ok:
      blockedImplementPreview.no_spec_kit_commands_will_run === true &&
      blockedImplementPreview.no_implement_will_run === true &&
      Array.isArray(blockedImplementPreview.blocked_actions) &&
      blockedImplementPreview.blocked_actions.some((item) => item.name === "implement"),
    detail: blockedImplementPreview.blocked_actions,
  },
  {
    name: "live_dry_hop_only_blocks_spec_kit_commands",
    ok:
      liveDryHopPreview.no_spec_kit_commands_will_run === true &&
      liveDryHopPreview.no_taskstoissues_will_run === true &&
      liveDryHopPreview.no_implement_will_run === true,
    detail: {
      no_spec_kit_commands_will_run: liveDryHopPreview.no_spec_kit_commands_will_run,
      no_taskstoissues_will_run: liveDryHopPreview.no_taskstoissues_will_run,
      no_implement_will_run: liveDryHopPreview.no_implement_will_run,
    },
  },
  {
    name: "missing_specify_policy_documented",
    ok:
      String(liveDryHopPreview.live_dry_hop_missing_tool_policy).includes("MISSING_TOOL") &&
      String(liveDryHopPreview.live_dry_hop_missing_tool_policy).includes("allow_install_in_dry_hop=true"),
    detail: liveDryHopPreview.live_dry_hop_missing_tool_policy,
  },
  {
    name: "workflow_contains_required_hosts_and_defaults",
    ok:
      workflowText.includes("192.168.1.136") &&
      workflowText.includes("n8n-runners") &&
      workflowText.includes("/workspace") &&
      workflowText.includes("live_dry_hop_only") &&
      workflowText.includes("allow_install_in_dry_hop"),
    detail: "Workflow embeds Proxmox, runner, workspace, and live-dry-hop defaults.",
  },
  {
    name: "no_secrets_in_dry_run_output",
    ok:
      !/ghp_|github_pat_|sk-[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY|xox[baprs]-/i.test(
        JSON.stringify({ regularPreview, liveDryHopPreview, blockedImplementPreview }),
      ),
    detail: "Dry-run output does not expose secret-like values.",
  },
];

const failedChecks = checks.filter((check) => !check.ok);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: failedChecks.length === 0,
      phase: "dry_run_local",
      checks,
    },
    null,
    2,
  )}\n`,
);

process.exit(failedChecks.length === 0 ? 0 : 1);
