#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { diagnoseN8nHttp } from "./diagnose-n8n-http.mjs";
import { scanN8nLiveReadiness } from "./scan-n8n-live-readiness.mjs";
import { runTrustedReadinessScan } from "./run-trusted-readiness-scan.mjs";

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
const comparisonJsonPath = path.join(evidenceDir, "scanner-entrypoint-comparison.json");
const comparisonMdPath = path.join(evidenceDir, "scanner-entrypoint-comparison.md");
const diagnosisJsonPath = path.join(evidenceDir, "n8n-http-diagnosis.json");
const scanJsonPath = path.join(evidenceDir, "n8n-live-readiness-scan.json");
const trustedReadinessJsonPath = path.join(evidenceDir, "trusted-readiness-scan.json");
const trustedDiagnosisJsonPath = path.join(evidenceDir, "n8n-http-diagnosis-trusted.json");
const trustedScanJsonPath = path.join(evidenceDir, "n8n-live-readiness-scan-trusted.json");

const summarizeText = (value, maxLength = 500) =>
  String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);

const safeReadJson = (targetPath) => {
  try {
    const raw = readFileSync(targetPath, "utf8").replace(/^\uFEFF/, "");
    return {
      ok: true,
      value: JSON.parse(raw),
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      error: summarizeText(error.message || String(error), 300),
    };
  }
};

const runNodeCommand = (relativePath) => {
  const result = spawnSync("node", [relativePath], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

  return {
    command: `node ${relativePath.replaceAll("\\", "/")}`,
    exit_code: typeof result.status === "number" ? result.status : 1,
    ok: result.status === 0,
    stdout: summarizeText(result.stdout, 2000),
    stderr: summarizeText(result.stderr, 2000),
  };
};

const compareFields = (left, right, fields) =>
  fields.map((field) => ({
    field,
    left: left?.[field],
    right: right?.[field],
    match: left?.[field] === right?.[field],
  }));

const renderMarkdown = (comparison) => {
  const lines = [];
  lines.push("# Scanner Entrypoint Comparison");
  lines.push("");
  lines.push(`Date: \`${comparison.generated_at}\``);
  lines.push(`Status: \`${comparison.status}\``);
  lines.push(`Direct CLI status: \`${comparison.direct_cli_status}\``);
  lines.push(`Trusted import status: \`${comparison.trusted_import_status}\``);
  lines.push(`Entrypoint tool gap accepted: \`${comparison.entrypoint_tool_gap_accepted}\``);
  lines.push("");
  lines.push("## Diagnose");
  lines.push("");
  lines.push(`- Direct CLI exit: \`${comparison.diagnose.direct_cli.exit_code}\``);
  lines.push(`- Imported function available: \`${comparison.diagnose.imported.available}\``);
  lines.push(`- Direct CLI decision: \`${comparison.diagnose.direct_cli.decision}\``);
  lines.push(`- Imported decision: \`${comparison.diagnose.imported.decision}\``);
  lines.push("");
  lines.push("## Scan");
  lines.push("");
  lines.push(`- Direct CLI exit: \`${comparison.scan.direct_cli.exit_code}\``);
  lines.push(`- Imported function available: \`${comparison.scan.imported.available}\``);
  lines.push(`- Direct base status: \`${comparison.scan.direct_cli.base_status}\``);
  lines.push(`- Imported base status: \`${comparison.scan.imported.base_status}\``);
  lines.push(`- Trusted diagnosis decision: \`${comparison.scan.imported.diagnosis_decision}\``);
  lines.push(`- Direct API status: \`${comparison.scan.direct_cli.api_status}\``);
  lines.push(`- Imported API status: \`${comparison.scan.imported.api_status}\``);
  lines.push(`- Direct decision: \`${comparison.scan.direct_cli.decision}\``);
  lines.push(`- Imported decision: \`${comparison.scan.imported.decision}\``);
  lines.push(`- Direct allowed_next_action: \`${comparison.scan.direct_cli.allowed_next_action}\``);
  lines.push(`- Imported allowed_next_action: \`${comparison.scan.imported.allowed_next_action}\``);
  lines.push("");
  lines.push("## Field Comparison");
  lines.push("");
  for (const item of comparison.scan.field_comparison) {
    lines.push(`- ${item.field}: match=\`${item.match}\``);
  }
  lines.push("");
  lines.push("## Reasons");
  lines.push("");
  if (!comparison.reasons.length) lines.push("- none");
  for (const reason of comparison.reasons) lines.push(`- ${reason}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
};

const main = async () => {
  mkdirSync(evidenceDir, { recursive: true });
  const entrypointToolGapAccepted =
    String(process.env.SPEC_KIT_ACCEPT_ENTRYPOINT_TOOL_GAP || "").trim().toLowerCase() === "true";

  const diagnoseCli = runNodeCommand("scripts/diagnose-n8n-http.mjs");
  const diagnoseCliJson = diagnoseCli.ok ? safeReadJson(diagnosisJsonPath) : { ok: false, value: null, error: diagnoseCli.stderr };

  const importedDiagnosis = {
    available: typeof diagnoseN8nHttp === "function",
    decision: "",
    error: "",
  };

  let importedDiagnosisValue = null;
  if (importedDiagnosis.available) {
    try {
      importedDiagnosisValue = await diagnoseN8nHttp();
      importedDiagnosis.decision = importedDiagnosisValue.decision || "";
    } catch (error) {
      importedDiagnosis.error = summarizeText(error.message || String(error), 300);
    }
  }

  const scanCli = runNodeCommand("scripts/scan-n8n-live-readiness.mjs");
  const scanCliJson = scanCli.ok ? safeReadJson(scanJsonPath) : { ok: false, value: null, error: scanCli.stderr };

  const importedScan = {
    available: typeof runTrustedReadinessScan === "function" && typeof scanN8nLiveReadiness === "function",
    base_status: "",
    api_status: "",
    decision: "",
    allowed_next_action: "",
    diagnosis_decision: "",
    error: "",
    source: "trusted_runner_import",
  };

  let importedScanValue = null;
  if (importedScan.available) {
    try {
      importedScanValue = await runTrustedReadinessScan({ writeEvidence: true });
      importedScan.base_status = importedScanValue?.scan?.base_status || "";
      importedScan.api_status = importedScanValue?.scan?.api_status || "";
      importedScan.decision = importedScanValue?.scan?.decision || "";
      importedScan.allowed_next_action = importedScanValue?.scan?.allowed_next_action || "";
      importedScan.diagnosis_decision = importedScanValue?.diagnosis?.decision || "";
    } catch (error) {
      importedScan.error = summarizeText(error.message || String(error), 300);
    }
  }

  const directScanCore = {
    base_status: scanCliJson.value?.n8n?.base_status || "",
    api_status: scanCliJson.value?.n8n?.api_status || "",
    decision: scanCliJson.value?.decision || "",
    allowed_next_action: scanCliJson.value?.allowed_next_action || "",
  };

  const trustedReadiness = safeReadJson(trustedReadinessJsonPath);
  const trustedDiagnosis = safeReadJson(trustedDiagnosisJsonPath);
  const trustedScan = safeReadJson(trustedScanJsonPath);

  const comparisonTarget = trustedReadiness.ok
    ? {
        diagnosis_decision: trustedReadiness.value?.diagnosis?.decision || "",
        base_status: trustedReadiness.value?.scan?.base_status || "",
        api_status: trustedReadiness.value?.scan?.api_status || "",
        decision: trustedReadiness.value?.scan?.decision || "",
        allowed_next_action: trustedReadiness.value?.scan?.allowed_next_action || "",
      }
    : importedScan;

  if (trustedReadiness.ok) {
    importedScan.source = "trusted_runner_file";
    importedScan.base_status = comparisonTarget.base_status;
    importedScan.api_status = comparisonTarget.api_status;
    importedScan.decision = comparisonTarget.decision;
    importedScan.allowed_next_action = comparisonTarget.allowed_next_action;
    importedScan.diagnosis_decision = comparisonTarget.diagnosis_decision;
  }

  if (trustedDiagnosis.ok) {
    importedDiagnosis.decision = trustedDiagnosis.value?.decision || importedDiagnosis.decision;
  }

  const fieldComparison = compareFields(directScanCore, comparisonTarget, [
    "base_status",
    "api_status",
    "decision",
    "allowed_next_action",
  ]);

  const reasons = [];
  let status = "ENTRYPOINTS_CONSISTENT";
  const directCliStatus = diagnoseCli.ok && diagnoseCliJson.ok && scanCli.ok && scanCliJson.ok ? "DIRECT_CLI_OK" : "DIRECT_CLI_BAD";
  const trustedImportStatus =
    importedDiagnosis.available &&
    importedScan.available &&
    !importedDiagnosis.error &&
    !importedScan.error &&
    importedScan.diagnosis_decision === importedScan.base_status &&
    importedScan.diagnosis_decision === "N8N_BASE_REACHABLE"
      ? "TRUSTED_IMPORT_OK"
      : "TRUSTED_IMPORT_BAD";

  if (!importedDiagnosis.available || !importedScan.available || !trustedReadiness.ok || !trustedScan.ok) {
    status = "ENTRYPOINT_TEST_TOOL_GAP";
    reasons.push("The trusted runner or one of its exported functions is not available with evidence output.");
  } else if (importedDiagnosis.error || importedScan.error) {
    status = "ENTRYPOINTS_INCONSISTENT_TRUSTED_BAD";
    if (importedDiagnosis.error) reasons.push(`Imported diagnose function failed: ${importedDiagnosis.error}`);
    if (importedScan.error) reasons.push(`Trusted runner failed: ${importedScan.error}`);
  } else {
    const diagnoseTargetDecision = comparisonTarget.diagnosis_decision || trustedDiagnosis.value?.decision || importedDiagnosisValue?.decision;
    const diagnoseMatches = diagnoseCliJson.ok && diagnoseTargetDecision
      ? diagnoseCliJson.value?.decision === diagnoseTargetDecision
      : false;
    const fieldMismatch = fieldComparison.some((item) => !item.match);
    const trustedOk = trustedImportStatus === "TRUSTED_IMPORT_OK";

    if (trustedReadiness.ok) {
      reasons.push("Trusted runner evidence was used as the authoritative baseline for live readiness decisions.");
    }

    if (directCliStatus !== "DIRECT_CLI_OK") {
      reasons.push("At least one direct CLI entrypoint returned a non-zero exit code or invalid evidence.");
    }

    if (!diagnoseMatches) {
      reasons.push("Diagnose decision differs between direct CLI and trusted runner.");
    }

    if (fieldMismatch) {
      reasons.push("Scan core fields differ between direct CLI and trusted runner.");
    }

    if (directCliStatus === "DIRECT_CLI_OK" && diagnoseMatches && !fieldMismatch) {
      status = "ENTRYPOINTS_CONSISTENT";
    } else if (trustedOk) {
      status = "ENTRYPOINTS_INCONSISTENT_BUT_TRUSTED_OK";
      if (entrypointToolGapAccepted) {
        reasons.push("SPEC_KIT_ACCEPT_ENTRYPOINT_TOOL_GAP=true is set, so the direct CLI gap is explicitly accepted for trusted-runner-only live gating.");
      }
    } else {
      status = "ENTRYPOINTS_INCONSISTENT_TRUSTED_BAD";
      reasons.push("Trusted runner is not consistently green, so the direct CLI gap cannot be accepted.");
    }
  }

  const comparison = {
    generated_at: new Date().toISOString(),
    status,
    direct_cli_status: directCliStatus,
    trusted_import_status: trustedImportStatus,
    entrypoint_tool_gap_accepted: entrypointToolGapAccepted,
    diagnose: {
      direct_cli: {
        ...diagnoseCli,
        decision: diagnoseCliJson.value?.decision || "",
        error: diagnoseCliJson.ok ? "" : diagnoseCliJson.error,
      },
      imported: importedDiagnosis,
      trusted_baseline_available: trustedDiagnosis.ok,
    },
    scan: {
      direct_cli: {
        ...scanCli,
        ...directScanCore,
        error: scanCliJson.ok ? "" : scanCliJson.error,
      },
      imported: importedScan,
      trusted_baseline_available: trustedReadiness.ok && trustedScan.ok,
      field_comparison: fieldComparison,
    },
    reasons,
  };

  writeFileSync(comparisonJsonPath, `${JSON.stringify(comparison, null, 2)}\n`, "utf8");
  writeFileSync(comparisonMdPath, renderMarkdown(comparison), "utf8");
  process.stdout.write(`${comparisonJsonPath}\n${comparisonMdPath}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message || String(error)}\n`);
  process.exit(1);
});
