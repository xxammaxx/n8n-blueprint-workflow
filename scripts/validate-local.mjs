#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const repoFile = (relativePath) => path.join(repoRoot, relativePath);

const requiredFiles = [
  "README.md",
  "docs/proxmox-docker-runbook.md",
  "examples/payload.example.json",
  "examples/live-dry-hop-payload.example.json",
  "scripts/build-workflow.mjs",
  "scripts/remote_runner_orchestrator.sh",
  "scripts/container_pipeline.mjs",
  "scripts/dry-run-local.mjs",
  "workflows/spec-kit-opencode-proxmox-runner-orchestrator.json",
];

for (const relativePath of requiredFiles) {
  try {
    readFileSync(repoFile(relativePath), "utf8");
  } catch (error) {
    throw new Error(`Missing required file: ${relativePath} (${error.message})`);
  }
}

const workflowPath = repoFile("workflows/spec-kit-opencode-proxmox-runner-orchestrator.json");
const workflowRaw = readFileSync(workflowPath, "utf8");
const workflow = JSON.parse(workflowRaw);
const containerPipeline = readFileSync(repoFile("scripts/container_pipeline.mjs"), "utf8");
const hostScript = readFileSync(repoFile("scripts/remote_runner_orchestrator.sh"), "utf8");
const buildWorkflowScript = readFileSync(repoFile("scripts/build-workflow.mjs"), "utf8");
const readme = readFileSync(repoFile("README.md"), "utf8");
const runbook = readFileSync(repoFile("docs/proxmox-docker-runbook.md"), "utf8");
const payloadExample = JSON.parse(readFileSync(repoFile("examples/payload.example.json"), "utf8"));
const liveDryHopPayload = JSON.parse(readFileSync(repoFile("examples/live-dry-hop-payload.example.json"), "utf8"));

const workflowBuild = spawnSync("node", [repoFile("scripts/build-workflow.mjs"), "--stdout"], {
  cwd: repoRoot,
  encoding: "utf8",
});

if (workflowBuild.status !== 0) {
  throw new Error(`Workflow build failed during validation:\n${workflowBuild.stdout}\n${workflowBuild.stderr}`);
}

if (workflowBuild.stdout !== workflowRaw) {
  throw new Error("Generated workflow JSON does not match the committed workflow file. Re-run scripts/build-workflow.mjs.");
}

const dryRunValidation = spawnSync("node", [repoFile("scripts/dry-run-local.mjs")], {
  cwd: repoRoot,
  encoding: "utf8",
});

if (dryRunValidation.status !== 0) {
  throw new Error(`Dry-run validation failed:\n${dryRunValidation.stdout}\n${dryRunValidation.stderr}`);
}

const nodeNames = workflow.nodes.map((node) => node.name);
for (const requiredNode of [
  "Webhook Trigger",
  "Normalize Input",
  "SSH Proxmox Preflight",
  "SSH Runner Execute",
  "Result Parser",
  "Respond To Webhook",
]) {
  if (!nodeNames.includes(requiredNode)) {
    throw new Error(`Workflow is missing required node: ${requiredNode}`);
  }
}

const prepareNode = workflow.nodes.find((node) => node.name === "Validate And Prepare");
if (!prepareNode?.parameters?.jsCode?.includes("RUNNER_HOST_SCRIPT_SHA256")) {
  throw new Error("Validate And Prepare node does not embed the runner script hash.");
}
for (const snippet of ["prefer_spec_kit_skills", "dry_run", "live_dry_hop_only", "allow_install_in_dry_hop", "SECRET_LIKE_PAYLOAD_BLOCKED"]) {
  if (!prepareNode.parameters.jsCode.includes(snippet)) {
    throw new Error(`Validate And Prepare node is missing expected normalization or guard: ${snippet}`);
  }
}

const resultNode = workflow.nodes.find((node) => node.name === "Result Parser");
for (const snippet of ["RUNNER_RESPONSE_INVALID", "[redacted secret-like output]"]) {
  if (!resultNode?.parameters?.jsCode?.includes(snippet)) {
    throw new Error(`Result Parser node is missing expected snippet: ${snippet}`);
  }
}

if (payloadExample.proxmox_host !== "192.168.1.136") {
  throw new Error("Payload example does not document the expected Proxmox host.");
}
if (payloadExample.runner_container_name !== "n8n-runners") {
  throw new Error("Payload example does not keep the default runner container name.");
}
if (payloadExample.project_root !== "/workspace") {
  throw new Error("Payload example does not keep the default workspace.");
}
if (!payloadExample.project_slug || !payloadExample.blueprint_markdown) {
  throw new Error("Payload example is missing required fields.");
}
if (payloadExample.spec_kit_plugin_module !== "") {
  throw new Error("Payload example should not require a spec_kit_plugin_module override.");
}
if (payloadExample.spec_kit_install_command !== "") {
  throw new Error("Payload example should default to the official Spec Kit install path.");
}
if (payloadExample.prefer_spec_kit_skills !== false) {
  throw new Error("Payload example should keep prefer_spec_kit_skills disabled by default.");
}

if (liveDryHopPayload.proxmox_host !== "192.168.1.136") {
  throw new Error("Live dry-hop payload does not document the expected Proxmox host.");
}
if (liveDryHopPayload.runner_container_name !== "n8n-runners") {
  throw new Error("Live dry-hop payload does not keep the default runner container name.");
}
if (liveDryHopPayload.project_root !== "/workspace") {
  throw new Error("Live dry-hop payload does not keep the default workspace.");
}
if (liveDryHopPayload.dry_run !== true || liveDryHopPayload.live_dry_hop_only !== true) {
  throw new Error("Live dry-hop payload must set dry_run=true and live_dry_hop_only=true.");
}
if (liveDryHopPayload.enable_implement !== false || liveDryHopPayload.enable_taskstoissues !== false) {
  throw new Error("Live dry-hop payload must keep implement and taskstoissues disabled.");
}

for (const snippet of [
  "192.168.1.136",
  "REAL_E2E_READY_PREPARED",
  "uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@${SPEC_KIT_VERSION}",
  "specify init --here --integration opencode --script sh --force",
  "specify version",
  "specify integration list",
  ".opencode/commands",
  "Kontrollierter Live-Dry-Hop",
  "n8n-runners",
  "/workspace",
  "dry_run",
  "live_dry_hop_only",
  "scripts/dry-run-local.mjs",
]) {
  if (!readme.includes(snippet)) {
    throw new Error(`README is missing expected documentation snippet: ${snippet}`);
  }
}

if (readme.includes("Im Payload entweder `spec_kit_plugin_module` oder `spec_kit_install_command` setzen")) {
  throw new Error("README still describes spec_kit_plugin_module/spec_kit_install_command as required.");
}

for (const snippet of [
  "Variante A",
  "Variante B",
  "Variante C",
  "Live E2E Run nach Human Approval",
  "Kontrollierter Live-Dry-Hop",
  "specify init --here --integration opencode --script sh --force",
  "Unknown integration option '--skills'.",
  "DOCKER_UNREACHABLE",
  "MISSING_TOOL",
]) {
  if (!runbook.includes(snippet)) {
    throw new Error(`Runbook is missing expected snippet: ${snippet}`);
  }
}

for (const snippet of [
  'OFFICIAL_SPEC_KIT_REPO = "git+https://github.com/github/spec-kit.git"',
  "uv tool install specify-cli --from ${OFFICIAL_SPEC_KIT_REPO}@${version}",
  'phase: "live_dry_hop_complete"',
  "MISSING_TOOL",
  "allow_install_in_dry_hop",
  "no_spec_kit_commands_executed: true",
  ".opencode/commands",
]) {
  if (!containerPipeline.includes(snippet)) {
    throw new Error(`Container pipeline is missing expected live-dry-hop or Spec Kit snippet: ${snippet}`);
  }
}

for (const snippet of ['"--integration"', '"opencode"', '"--script"', '"sh"', '"--force"']) {
  if (!containerPipeline.includes(snippet)) {
    throw new Error(`Container pipeline is missing expected opencode init token: ${snippet}`);
  }
}

for (const snippet of ["DOCKER_UNREACHABLE", "RUNNER_CONTAINER_NOT_FOUND", "RUNNER_CONTAINER_NOT_RUNNING", "[redacted secret-like output]"]) {
  if (!hostScript.includes(snippet)) {
    throw new Error(`Host orchestrator script is missing expected guardrail: ${snippet}`);
  }
}

const runtimeFiles = [workflowRaw, containerPipeline, hostScript, buildWorkflowScript];

const secretPatterns = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /AIza[0-9A-Za-z\-_]{20,}/,
];

for (const [index, fileContent] of runtimeFiles.entries()) {
  for (const pattern of secretPatterns) {
    if (pattern.test(fileContent)) {
      throw new Error(`Secret-like runtime content detected in runtime file index ${index}: ${pattern}`);
    }
  }
}

const bannedRuntimePatterns = [
  /\bqm destroy\b/,
  /\bpct destroy\b/,
  /\bdocker rm\b/,
  /\bdocker volume rm\b/,
  /\bdocker system prune\b/,
  /\brm -rf \/\b/,
  /\bgit reset --hard\b/,
  /--yolo/,
];

for (const [index, fileContent] of runtimeFiles.entries()) {
  for (const pattern of bannedRuntimePatterns) {
    if (pattern.test(fileContent)) {
      throw new Error(`Banned destructive runtime command detected in runtime file index ${index}: ${pattern}`);
    }
  }
}

process.stdout.write("Local validation passed.\n");
