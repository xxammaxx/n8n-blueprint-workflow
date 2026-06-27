#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const payloadPath = process.argv[2];
const localPreviewMode = process.env.SPEC_KIT_DRY_RUN === "1";
const OFFICIAL_SPEC_KIT_REPO = "git+https://github.com/github/spec-kit.git";
const SECRET_PATTERNS = [
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{10,}/,
  /BEGIN [A-Z ]*PRIVATE KEY/,
  /AIza[0-9A-Za-z\-_]{20,}/,
];

const output = (result) => {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(0);
};

const containsSecretLike = (value) => {
  const text = String(value || "");
  return SECRET_PATTERNS.some((pattern) => pattern.test(text));
};

const redactDetail = (value) => {
  const text = String(value || "").trim();
  if (!text) return "";
  if (containsSecretLike(text)) {
    return "[redacted secret-like output]";
  }
  return text.slice(0, 4000);
};

const fail = (errorCode, message, extra = {}) => {
  const safeExtra = { ...extra };
  for (const key of ["detail", "raw_output"]) {
    if (safeExtra[key]) {
      safeExtra[key] = redactDetail(safeExtra[key]);
    }
  }
  output({
    ok: false,
    error_code: errorCode,
    message,
    ...safeExtra,
  });
};

const sanitizeProjectSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);

const asString = (value) => (value == null ? "" : String(value).trim());
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

const quoteArg = (value) => {
  const stringValue = String(value ?? "");
  if (/^[A-Za-z0-9_./:@=-]+$/.test(stringValue)) {
    return stringValue;
  }
  return `'${stringValue.replace(/'/g, `'\"'\"'`)}'`;
};

const formatCommand = (command, args) => [command, ...args.map((arg) => quoteArg(arg))].join(" ");

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: 16 * 1024 * 1024,
  });
  return {
    command,
    args,
    cwd: options.cwd || process.cwd(),
    status: typeof result.status === "number" ? result.status : 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? String(result.error.message || result.error) : "",
  };
};

const commandExists = (command, cwd) => {
  const result = run("sh", ["-lc", `command -v ${command}`], { cwd });
  return result.status === 0;
};

const ensureCommand = (command, hint, cwd) => {
  if (!commandExists(command, cwd)) {
    fail("TOOL_GAP", `Required container command is not available: ${command}.`, { hint });
  }
};

const probeTool = (name, args, cwd) => {
  if (!commandExists(name, cwd)) {
    return {
      name,
      available: false,
      status: "missing",
      error_code: "MISSING_TOOL",
      version: "",
    };
  }

  const result = run(name, args, { cwd });
  if (result.status !== 0) {
    return {
      name,
      available: true,
      status: "error",
      error_code: "TOOL_VERSION_FAILED",
      version: "",
      detail: redactDetail(`${result.stdout}\n${result.stderr}\n${result.error}`),
    };
  }

  return {
    name,
    available: true,
    status: "ok",
    error_code: "",
    version: result.stdout.trim() || result.stderr.trim(),
  };
};

const buildOfficialSpecKitInstallCommand = (version) =>
  `uv tool install specify-cli --from ${OFFICIAL_SPEC_KIT_REPO}@${version}`;

const buildPluginInstallCommand = (pluginModule, version) => {
  const hasVersionSuffix = pluginModule.includes("@", 1);
  const packageSpec = hasVersionSuffix ? pluginModule : `${pluginModule}@${version}`;
  return `opencode plugin ${packageSpec}`;
};

const buildSpecKitInstallPlan = ({ specKitInstallCommand, specKitPluginModule, specKitVersion }) => {
  if (specKitInstallCommand) {
    return {
      strategy: "custom-install-command",
      command: specKitInstallCommand,
    };
  }
  if (specKitPluginModule) {
    return {
      strategy: "opencode-plugin-override",
      command: buildPluginInstallCommand(specKitPluginModule, specKitVersion),
    };
  }
  return {
    strategy: "official-uv-default",
    command: buildOfficialSpecKitInstallCommand(specKitVersion),
  };
};

const buildOpencodeInitArgs = ({ useSkills }) => {
  const args = ["init", "--here", "--integration", "opencode", "--script", "sh", "--force"];
  if (useSkills) {
    args.push("--integration-options=--skills");
  }
  return args;
};

const writeCanaryFile = (projectRoot, runnerContainerName, proxmoxHost, dockerTargetHost) => {
  if (!existsSync(projectRoot)) {
    fail("WORKSPACE_NOT_FOUND", "Configured workspace root does not exist inside the runner container.", {
      project_root: projectRoot,
    });
  }

  const canaryDir = path.posix.join(projectRoot, "_speckit_n8n_live_dry_hop_canary");
  const runtimeDir = path.posix.join(canaryDir, ".runtime");
  const canaryFile = path.posix.join(runtimeDir, "live-dry-hop.txt");

  try {
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(
      canaryFile,
      [
        "live_dry_hop_only=true",
        `timestamp=${new Date().toISOString()}`,
        `runner_container_name=${runnerContainerName}`,
        `proxmox_host=${proxmoxHost}`,
        `docker_target_host=${dockerTargetHost}`,
        "no_build_executed=true",
        "no_taskstoissues_executed=true",
        "no_implement_executed=true",
      ].join("\n") + "\n",
      "utf8",
    );
  } catch (error) {
    fail("CANARY_WRITE_FAILED", "Failed to write the live dry-hop canary file.", {
      detail: String(error.message || error),
      canary_file: canaryFile,
    });
  }

  return {
    canary_dir: canaryDir,
    runtime_dir: runtimeDir,
    canary_file: canaryFile,
  };
};

const attemptLiveDryHopInstall = (toolName, installCommand, cwd, setupSteps) => {
  const installResult = run("sh", ["-lc", installCommand], { cwd });
  setupSteps.push({
    name: `install_${toolName}_during_live_dry_hop`,
    command: installCommand,
    status: installResult.status === 0 ? "success" : "failed",
    live_dry_hop_only: true,
  });
  return installResult;
};

if (!payloadPath || !existsSync(payloadPath)) {
  fail("INPUT_MISSING", "Runner payload file is missing inside the container.", {
    payload_path: payloadPath || "",
  });
}

let payload;
try {
  payload = JSON.parse(readFileSync(payloadPath, "utf8"));
} catch (error) {
  fail("INVALID_PAYLOAD", "Payload file is not valid JSON.", {
    detail: String(error.message || error),
  });
}

const projectSlug = sanitizeProjectSlug(payload.project_slug);
if (!projectSlug) {
  fail("VALIDATION_FAILED", "project_slug is empty after sanitization.");
}

const blueprintMarkdown = asString(payload.blueprint_markdown);
if (!blueprintMarkdown) {
  fail("VALIDATION_FAILED", "blueprint_markdown is required.");
}

const runnerContainerName = asString(payload.runner_container_name) || "n8n-runners";
const projectRoot = asString(payload.project_root) || "/workspace";
const projectDir = path.posix.join(projectRoot, projectSlug);
const inputDir = path.posix.join(projectDir, ".inputs");
const setupDir = path.posix.join(projectDir, ".setup");
const runId = new Date().toISOString().replace(/[:.]/g, "-");
const runDir = path.posix.join(projectDir, ".n8n-runs", runId);
const logsDir = path.posix.join(runDir, "logs");
const blueprintPath = path.posix.join(inputDir, "blueprint.md");
const specKitInstallMarker = path.posix.join(setupDir, "spec-kit-install.json");
const slashCommandDir = path.posix.join(projectDir, ".opencode", "commands");
const opencodeIntegrationManifest = path.posix.join(projectDir, ".specify", "integrations", "opencode.manifest.json");

const requestedEnableQualityGates = asBoolean(payload.enable_optional_quality_gates, true);
const requestedEnableTaskstoissues = asBoolean(payload.enable_taskstoissues, true);
const requestedEnableImplement = asBoolean(payload.enable_implement, false);
const requestedEnableConverge = asBoolean(payload.enable_converge, true);
const preferSpecKitSkills = asBoolean(payload.prefer_spec_kit_skills, false);
const payloadDryRun = asBoolean(payload.dry_run, false);
const liveDryHopOnly = asBoolean(payload.live_dry_hop_only, false);
const allowInstallInDryHop = asBoolean(payload.allow_install_in_dry_hop, false);
const model = asString(payload.model);
const githubRepoUrl = asString(payload.github_repo_url);
const specKitVersion = asString(payload.spec_kit_version) || "v0.11.4";
const specKitPluginModule = asString(payload.spec_kit_plugin_module);
const specKitInstallCommand = asString(payload.spec_kit_install_command);
const opencodeInstallCommand = asString(payload.opencode_install_command) || "npm install -g opencode-ai";
const proxmoxHost = asString(payload.proxmox_host) || "192.168.1.136";
const dockerTargetHost = asString(payload.docker_target_host) || proxmoxHost;
const dockerTargetMode = asString(payload.docker_target_mode) || "direct-proxmox-docker";
const specKitInstallPlan = buildSpecKitInstallPlan({
  specKitInstallCommand,
  specKitPluginModule,
  specKitVersion,
});
const defaultInitArgs = buildOpencodeInitArgs({ useSkills: false });
const skillsInitArgs = buildOpencodeInitArgs({ useSkills: true });

const liveDryHopActive = payloadDryRun || liveDryHopOnly;
const effectiveEnableQualityGates = liveDryHopActive ? false : requestedEnableQualityGates;
const effectiveEnableTaskstoissues = liveDryHopActive ? false : requestedEnableTaskstoissues;
const effectiveEnableImplement = liveDryHopActive ? false : requestedEnableImplement;
const effectiveEnableConverge = liveDryHopActive ? false : requestedEnableConverge;

const blockedActions = [];
if (liveDryHopActive && requestedEnableQualityGates) {
  blockedActions.push({
    name: "quality_gates",
    reason: "Blocked by dry-run/live-dry-hop mode.",
  });
}
if (liveDryHopActive && requestedEnableTaskstoissues) {
  blockedActions.push({
    name: "taskstoissues",
    reason: "Blocked by dry-run/live-dry-hop mode.",
  });
}
if (liveDryHopActive && requestedEnableImplement) {
  blockedActions.push({
    name: "implement",
    reason: "Blocked by dry-run/live-dry-hop mode.",
  });
}
if (liveDryHopActive && requestedEnableConverge) {
  blockedActions.push({
    name: "converge",
    reason: "Blocked by dry-run/live-dry-hop mode.",
  });
}

if (localPreviewMode) {
  output({
    ok: true,
    dry_run: true,
    live_dry_hop_only: liveDryHopOnly,
    payload_dry_run: payloadDryRun,
    phase: liveDryHopActive ? "container_pipeline_live_dry_hop_preview" : "container_pipeline_dry_run",
    project_slug: projectSlug,
    project_dir: projectDir,
    project_root: projectRoot,
    blueprint_file: blueprintPath,
    proxmox_host: proxmoxHost,
    docker_target_host: dockerTargetHost,
    docker_target_mode: dockerTargetMode,
    runner_container_name: runnerContainerName,
    spec_kit_version: specKitVersion,
    spec_kit_install_strategy: specKitInstallPlan.strategy,
    spec_kit_install_command: specKitInstallPlan.command,
    opencode_install_command: opencodeInstallCommand,
    specify_verify_commands: ["specify version", "specify integration list"],
    opencode_init_command: formatCommand("specify", defaultInitArgs),
    prefer_spec_kit_skills: preferSpecKitSkills,
    opencode_skills_probe_command: formatCommand("specify", skillsInitArgs),
    slash_command_fallback_dir: slashCommandDir,
    taskstoissues_policy: effectiveEnableTaskstoissues
      ? "would be skipped without a configured GitHub origin remote"
      : "disabled by payload flags or dry-hop mode",
    live_dry_hop_canary_dir: path.posix.join(projectRoot, "_speckit_n8n_live_dry_hop_canary"),
    live_dry_hop_canary_file: path.posix.join(projectRoot, "_speckit_n8n_live_dry_hop_canary", ".runtime", "live-dry-hop.txt"),
    live_dry_hop_missing_tool_policy:
      "Return MISSING_TOOL for absent opencode/specify unless allow_install_in_dry_hop=true. No Spec Kit commands run in live dry-hop mode.",
    allow_install_in_dry_hop: allowInstallInDryHop,
    no_spec_kit_commands_will_run: liveDryHopActive,
    no_taskstoissues_will_run: liveDryHopActive || !effectiveEnableTaskstoissues,
    no_implement_will_run: liveDryHopActive || !effectiveEnableImplement,
    blocked_actions: blockedActions,
    runner_missing_container_error_code: "RUNNER_CONTAINER_NOT_FOUND",
    docker_unreachable_error_code: "DOCKER_UNREACHABLE",
  });
}

if (liveDryHopActive) {
  const canary = writeCanaryFile(projectRoot, runnerContainerName, proxmoxHost, dockerTargetHost);
  const toolSpecs = [
    { name: "node", args: ["--version"] },
    { name: "npm", args: ["--version"] },
    { name: "git", args: ["--version"] },
    { name: "python3", args: ["--version"] },
    { name: "uv", args: ["--version"] },
    { name: "opencode", args: ["--version"], installCommand: opencodeInstallCommand },
    { name: "specify", args: ["version"], installCommand: specKitInstallPlan.command },
  ];
  const setupSteps = [];
  const tools = [];

  for (const toolSpec of toolSpecs) {
    let toolInfo = probeTool(toolSpec.name, toolSpec.args, projectRoot);

    if (
      !toolInfo.available &&
      allowInstallInDryHop &&
      toolSpec.installCommand &&
      ["opencode", "specify"].includes(toolSpec.name)
    ) {
      const installResult = attemptLiveDryHopInstall(toolSpec.name, toolSpec.installCommand, projectRoot, setupSteps);
      if (installResult.status === 0) {
        toolInfo = probeTool(toolSpec.name, toolSpec.args, projectRoot);
      } else {
        toolInfo = {
          ...toolInfo,
          status: "missing_after_install_attempt",
          detail: redactDetail(`${installResult.stdout}\n${installResult.stderr}\n${installResult.error}`),
        };
      }
    }

    tools.push(toolInfo);
  }

  const missingTools = tools.filter((tool) => !tool.available).map((tool) => tool.name);

  output({
    ok: true,
    phase: "live_dry_hop_complete",
    dry_run: payloadDryRun,
    live_dry_hop_only: liveDryHopOnly,
    no_build_executed: true,
    no_spec_kit_commands_executed: true,
    no_taskstoissues_executed: true,
    no_implement_executed: true,
    no_github_issues_created: true,
    runner_container_name: runnerContainerName,
    project_slug: projectSlug,
    project_root: projectRoot,
    proxmox_host: proxmoxHost,
    docker_target_host: dockerTargetHost,
    docker_target_mode: dockerTargetMode,
    workspace_exists: true,
    allow_install_in_dry_hop: allowInstallInDryHop,
    canary_written: true,
    canary_dir: canary.canary_dir,
    canary_file: canary.canary_file,
    blocked_actions: blockedActions,
    tools,
    missing_tools: missingTools,
    setup_steps: setupSteps,
  });
}

mkdirSync(inputDir, { recursive: true });
mkdirSync(setupDir, { recursive: true });
mkdirSync(logsDir, { recursive: true });
writeFileSync(blueprintPath, `${blueprintMarkdown}\n`, "utf8");

ensureCommand("node", "Use a Node-based runner container.", projectDir);
ensureCommand("npm", "Use a Node-based runner container that can install opencode-ai.", projectDir);
ensureCommand("git", "Provide git in the runner container to support repository-aware steps.", projectDir);
ensureCommand("sh", "A POSIX shell is required inside the runner container.", projectDir);
ensureCommand("uv", "Official Spec Kit installation uses uv.", projectDir);

const versions = {};
for (const item of [
  ["node", ["--version"]],
  ["npm", ["--version"]],
  ["git", ["--version"]],
  ["uv", ["--version"]],
]) {
  const versionResult = run(item[0], item[1], { cwd: projectDir });
  versions[item[0]] = versionResult.status === 0 ? versionResult.stdout.trim() : "";
}

const installNotes = [];
const setupSteps = [];

const opencodeCheck = run("sh", ["-lc", "command -v opencode >/dev/null 2>&1 && opencode --version"], {
  cwd: projectDir,
});
if (opencodeCheck.status !== 0) {
  const installResult = run("sh", ["-lc", opencodeInstallCommand], { cwd: projectDir });
  setupSteps.push({
    name: "install_opencode",
    command: opencodeInstallCommand,
    status: installResult.status === 0 ? "success" : "failed",
  });
  if (installResult.status !== 0) {
    fail("OPENCODE_INSTALL_FAILED", "Failed to install OpenCode inside the runner container.", {
      detail: `${installResult.stdout}\n${installResult.stderr}\n${installResult.error}`.trim(),
      setup_steps: setupSteps,
    });
  }
  installNotes.push("OpenCode was installed during this run.");
}

const opencodeVersion = run("opencode", ["--version"], { cwd: projectDir });
versions.opencode = opencodeVersion.status === 0 ? opencodeVersion.stdout.trim() : "";

let shouldInstallSpecKit = true;
if (existsSync(specKitInstallMarker)) {
  try {
    const marker = JSON.parse(readFileSync(specKitInstallMarker, "utf8"));
    shouldInstallSpecKit = marker.install_command !== specKitInstallPlan.command;
  } catch {
    shouldInstallSpecKit = true;
  }
}

if (shouldInstallSpecKit) {
  const installResult = run("sh", ["-lc", specKitInstallPlan.command], { cwd: projectDir });
  setupSteps.push({
    name: "install_spec_kit",
    command: specKitInstallPlan.command,
    strategy: specKitInstallPlan.strategy,
    status: installResult.status === 0 ? "success" : "failed",
  });
  if (installResult.status !== 0) {
    fail("SPEC_KIT_INSTALL_FAILED", "Failed to install Spec Kit for OpenCode.", {
      detail: `${installResult.stdout}\n${installResult.stderr}\n${installResult.error}`.trim(),
      setup_steps: setupSteps,
      spec_kit_install_strategy: specKitInstallPlan.strategy,
    });
  }
  writeFileSync(
    specKitInstallMarker,
    JSON.stringify(
      {
        install_command: specKitInstallPlan.command,
        install_strategy: specKitInstallPlan.strategy,
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
  installNotes.push(`Spec Kit install strategy ${specKitInstallPlan.strategy} was applied.`);
} else {
  installNotes.push("Spec Kit installation marker already matched the requested configuration.");
}

const specifyVersion = run("specify", ["version"], { cwd: projectDir });
if (specifyVersion.status !== 0) {
  fail("SPECIFY_VERIFY_FAILED", "specify version failed after installation.", {
    detail: `${specifyVersion.stdout}\n${specifyVersion.stderr}\n${specifyVersion.error}`.trim(),
    spec_kit_install_strategy: specKitInstallPlan.strategy,
  });
}
versions.specify = specifyVersion.stdout.trim();

const initHelp = run("specify", ["init", "--help"], { cwd: projectDir });
const supportsIntegrationOptions = initHelp.status === 0 && initHelp.stdout.includes("--integration-options");

let skillsApplied = false;
if (preferSpecKitSkills && supportsIntegrationOptions) {
  const skillsInitResult = run("specify", skillsInitArgs, { cwd: projectDir });
  setupSteps.push({
    name: "init_spec_kit_opencode_skills",
    command: formatCommand("specify", skillsInitArgs),
    status: skillsInitResult.status === 0 ? "success" : "failed",
  });
  if (skillsInitResult.status === 0) {
    skillsApplied = true;
    installNotes.push("Spec Kit accepted the requested skills-mode init for opencode.");
  } else {
    installNotes.push("Spec Kit opencode skills-mode init failed; falling back to slash-command integration.");
    installNotes.push(redactDetail(`${skillsInitResult.stdout}\n${skillsInitResult.stderr}\n${skillsInitResult.error}`.trim()));
  }
}

if (!skillsApplied) {
  const initResult = run("specify", defaultInitArgs, { cwd: projectDir });
  setupSteps.push({
    name: "init_spec_kit_opencode",
    command: formatCommand("specify", defaultInitArgs),
    status: initResult.status === 0 ? "success" : "failed",
  });
  if (initResult.status !== 0) {
    fail("SPEC_KIT_INIT_FAILED", "Failed to initialize Spec Kit OpenCode integration.", {
      detail: `${initResult.stdout}\n${initResult.stderr}\n${initResult.error}`.trim(),
      setup_steps: setupSteps,
    });
  }
}

const integrationList = run("specify", ["integration", "list"], { cwd: projectDir });
if (integrationList.status !== 0) {
  fail("SPEC_KIT_INTEGRATION_LIST_FAILED", "specify integration list failed after initialization.", {
    detail: `${integrationList.stdout}\n${integrationList.stderr}\n${integrationList.error}`.trim(),
  });
}

const slashCommandFiles = existsSync(slashCommandDir)
  ? readdirSync(slashCommandDir).filter((name) => name.startsWith("speckit.") && name.endsWith(".md"))
  : [];

const opencodeListedInProject =
  integrationList.stdout.toLowerCase().includes("opencode") && integrationList.stdout.toLowerCase().includes("installed");

if (!opencodeListedInProject && !existsSync(opencodeIntegrationManifest)) {
  fail("SPEC_KIT_INTEGRATION_VERIFY_FAILED", "OpenCode integration is not verified after initialization.", {
    detail: integrationList.stdout.trim(),
  });
}

let specKitIntegrationMode = "slash-commands";
if (skillsApplied && slashCommandFiles.length === 0) {
  fail("TOOL_GAP", "OpenCode skills-mode initialization succeeded, but slash-command runtime compatibility is not locally verified.", {
    detail: "No .opencode/commands directory was found after skills-mode init.",
  });
}
if (skillsApplied) {
  specKitIntegrationMode = "skills+slash-commands";
}
if (!skillsApplied && slashCommandFiles.length === 0) {
  fail("SPEC_KIT_INTEGRATION_VERIFY_FAILED", "OpenCode slash commands were not created under .opencode/commands.", {
    expected_dir: slashCommandDir,
  });
}

const gitDir = path.posix.join(projectDir, ".git");
if (githubRepoUrl && !existsSync(gitDir)) {
  const gitInit = run("git", ["init"], { cwd: projectDir });
  if (gitInit.status !== 0) {
    fail("GIT_INIT_FAILED", "Failed to initialize a git repository for the project.", {
      detail: `${gitInit.stdout}\n${gitInit.stderr}\n${gitInit.error}`.trim(),
    });
  }
}

if (githubRepoUrl) {
  const remoteUrlResult = run("git", ["remote", "get-url", "origin"], { cwd: projectDir });
  if (remoteUrlResult.status !== 0) {
    const addOrigin = run("git", ["remote", "add", "origin", githubRepoUrl], { cwd: projectDir });
    if (addOrigin.status !== 0) {
      fail("GIT_REMOTE_FAILED", "Failed to configure origin remote.", {
        detail: `${addOrigin.stdout}\n${addOrigin.stderr}\n${addOrigin.error}`.trim(),
      });
    }
  } else if (remoteUrlResult.stdout.trim() !== githubRepoUrl) {
    installNotes.push("Existing origin remote did not match github_repo_url; remote was left unchanged.");
  }
}

const remoteCheck = run("git", ["remote", "get-url", "origin"], { cwd: projectDir });
const hasGithubRemote = remoteCheck.status === 0 && remoteCheck.stdout.trim().length > 0;

const prompts = {
  constitution: asString(payload.constitution_prompt),
  specify: "",
  clarify: "",
  plan: asString(payload.plan_prompt),
  checklist: asString(payload.checklist_prompt),
  tasks: "",
  analyze: "",
  taskstoissues: "",
  implement: asString(payload.implement_prompt),
  converge: asString(payload.converge_prompt),
};

const plannedSteps = [
  { name: "constitution", slash: "/speckit.constitution", enabled: true },
  { name: "specify", slash: "/speckit.specify", enabled: true },
  { name: "clarify", slash: "/speckit.clarify", enabled: effectiveEnableQualityGates },
  { name: "plan", slash: "/speckit.plan", enabled: true },
  { name: "checklist", slash: "/speckit.checklist", enabled: effectiveEnableQualityGates },
  { name: "tasks", slash: "/speckit.tasks", enabled: true },
  { name: "analyze", slash: "/speckit.analyze", enabled: effectiveEnableQualityGates },
  { name: "taskstoissues", slash: "/speckit.taskstoissues", enabled: effectiveEnableTaskstoissues && hasGithubRemote },
  { name: "implement", slash: "/speckit.implement", enabled: effectiveEnableImplement },
  { name: "converge", slash: "/speckit.converge", enabled: effectiveEnableConverge },
];

const stepResults = [];
const skippedSteps = [...blockedActions];

if (effectiveEnableTaskstoissues && !hasGithubRemote) {
  skippedSteps.push({
    name: "taskstoissues",
    reason: "Skipped because no GitHub origin remote is configured.",
  });
}

for (const step of plannedSteps) {
  if (!step.enabled) {
    if (!skippedSteps.some((item) => item.name === step.name)) {
      skippedSteps.push({
        name: step.name,
        reason: "Skipped by payload flags.",
      });
    }
    continue;
  }

  const messageParts = [step.slash];
  if (prompts[step.name]) {
    messageParts.push(prompts[step.name]);
  }

  const args = ["run", "--dir", projectDir, "--format", "json", "--file", blueprintPath];
  if (model) {
    args.push("--model", model);
  }
  args.push(messageParts.join("\n\n"));

  const logFile = path.posix.join(logsDir, `${String(stepResults.length + 1).padStart(2, "0")}-${step.name}.log`);
  const runResult = run("opencode", args, { cwd: projectDir });
  const combinedLog = [
    `# Step: ${step.name}`,
    `# Command: ${formatCommand("opencode", args)}`,
    "",
    redactDetail(runResult.stdout.trim()),
    "",
    redactDetail(runResult.stderr.trim()),
  ]
    .filter(Boolean)
    .join("\n");
  writeFileSync(logFile, `${combinedLog}\n`, "utf8");

  stepResults.push({
    name: step.name,
    slash_command: step.slash,
    status: runResult.status === 0 ? "success" : "failed",
    exit_code: runResult.status,
    log_file: logFile,
  });

  if (runResult.status !== 0) {
    fail("OPENCODE_STEP_FAILED", `OpenCode failed during step ${step.name}.`, {
      failed_step: step.name,
      project_dir: projectDir,
      runner_container_name: runnerContainerName,
      step_results: stepResults,
      skipped_steps: skippedSteps,
      logs_dir: logsDir,
      spec_kit_integration_mode: specKitIntegrationMode,
    });
  }
}

output({
  ok: true,
  phase: "runner_pipeline_complete",
  dry_run: false,
  live_dry_hop_only: false,
  project_slug: projectSlug,
  project_dir: projectDir,
  blueprint_file: blueprintPath,
  run_id: runId,
  logs_dir: logsDir,
  proxmox_host: proxmoxHost,
  docker_target_host: dockerTargetHost,
  docker_target_mode: dockerTargetMode,
  runner_container_name: runnerContainerName,
  spec_kit_version: specKitVersion,
  spec_kit_install_strategy: specKitInstallPlan.strategy,
  spec_kit_install_command: specKitInstallPlan.command,
  spec_kit_integration_mode: specKitIntegrationMode,
  prefer_spec_kit_skills: preferSpecKitSkills,
  spec_kit_skills_applied: skillsApplied,
  specify_verify_commands: ["specify version", "specify integration list"],
  slash_command_files: slashCommandFiles,
  has_github_remote: hasGithubRemote,
  setup_steps: setupSteps,
  install_notes: installNotes,
  versions,
  steps: stepResults,
  skipped_steps: skippedSteps,
});
