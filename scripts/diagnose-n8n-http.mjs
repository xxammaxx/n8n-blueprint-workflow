#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

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

const DEFAULT_BASE_URL = "http://192.168.1.52:5678";
const DEFAULT_TIMEOUT_MS = 8000;

const sanitize = (value, maxLength = 300) => {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.slice(0, maxLength);
};

const safeError = (error) => ({
  error_name: sanitize(error?.name || "Error", 80),
  error_code: sanitize(error?.code || "", 80),
  error_message_sanitized: sanitize(error?.message || String(error), 240),
});

const truncateBody = (value, maxLength = 400) => sanitize(value, maxLength);

export const runFetchCheck = async (url, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await response.text();
    return {
      status: "ok",
      http_status: response.status,
      ok: response.ok,
      content_type: response.headers.get("content-type") || "",
      body_preview: truncateBody(body),
      error_name: "",
      error_code: "",
      error_message_sanitized: "",
    };
  } catch (error) {
    const details = safeError(error);
    return {
      status: details.error_name === "TimeoutError" ? "timeout" : "failed",
      http_status: 0,
      ok: false,
      content_type: "",
      body_preview: "",
      ...details,
    };
  }
};

export const runHttpRequestCheck = (url, timeoutMs = DEFAULT_TIMEOUT_MS) =>
  new Promise((resolve) => {
    let settled = false;

    const finish = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    try {
      const parsed = new URL(url);
      const transport = parsed.protocol === "https:" ? https : http;

      const request = transport.request(
        {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
          path: `${parsed.pathname}${parsed.search}`,
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
        (response) => {
          const chunks = [];
          response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
          response.on("end", () => {
            const body = Buffer.concat(chunks).toString("utf8");
            finish({
              status: "ok",
              http_status: response.statusCode || 0,
              ok: (response.statusCode || 0) >= 200 && (response.statusCode || 0) < 300,
              content_type: String(response.headers["content-type"] || ""),
              body_preview: truncateBody(body),
              error_name: "",
              error_code: "",
              error_message_sanitized: "",
            });
          });
        },
      );

      request.setTimeout(timeoutMs, () => {
        request.destroy(Object.assign(new Error(`Request timed out after ${timeoutMs}ms`), { code: "ETIMEDOUT" }));
      });

      request.on("error", (error) => {
        const details = safeError(error);
        finish({
          status: details.error_code === "ETIMEDOUT" ? "timeout" : "failed",
          http_status: 0,
          ok: false,
          content_type: "",
          body_preview: "",
          ...details,
        });
      });

      request.end();
    } catch (error) {
      const details = safeError(error);
      finish({
        status: "failed",
        http_status: 0,
        ok: false,
        content_type: "",
        body_preview: "",
        ...details,
      });
    }
  });

export const runPowerShellCheck = (url, timeoutSec = 8) => {
  if (process.platform !== "win32") {
    return {
      status: "skipped",
      http_status: 0,
      ok: false,
      content_type: "",
      body_preview: "",
      error_name: "",
      error_code: "",
      error_message_sanitized: "PowerShell comparison is only available on Windows.",
    };
  }

  const safeUrl = String(url).replace(/'/g, "''");
  const command = [
    "$ErrorActionPreference='Stop'",
    `$uri='${safeUrl}'`,
    "try {",
    `  $resp = Invoke-WebRequest -UseBasicParsing -Uri $uri -Headers @{ Accept = 'application/json' } -TimeoutSec ${timeoutSec}`,
    "  [pscustomobject]@{ ok=$true; status=[int]$resp.StatusCode; body=[string]$resp.Content; error='' } | ConvertTo-Json -Compress",
    "} catch {",
    "  $status = 0",
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
    maxBuffer: 8 * 1024 * 1024,
  });

  if (result.status !== 0 && !String(result.stdout || "").trim()) {
    return {
      status: "failed",
      http_status: 0,
      ok: false,
      content_type: "",
      body_preview: "",
      error_name: "PowerShellProbeError",
      error_code: "",
      error_message_sanitized: sanitize(result.stderr || result.error || "PowerShell probe failed", 240),
    };
  }

  try {
    const parsed = JSON.parse(String(result.stdout || "").trim());
    return {
      status: parsed.ok === true ? "ok" : "failed",
      http_status: Number(parsed.status) || 0,
      ok: parsed.ok === true,
      content_type: "",
      body_preview: truncateBody(parsed.body || ""),
      error_name: parsed.ok === true ? "" : "PowerShellHttpError",
      error_code: "",
      error_message_sanitized: parsed.ok === true ? "" : sanitize(parsed.error || "", 240),
    };
  } catch (error) {
    const details = safeError(error);
    return {
      status: "failed",
      http_status: 0,
      ok: false,
      content_type: "",
      body_preview: "",
      ...details,
    };
  }
};

export const runCurlCheck = (url, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  if (process.platform !== "win32") {
    return {
      status: "skipped",
      http_status: 0,
      ok: false,
      content_type: "",
      body_preview: "",
      error_name: "",
      error_code: "",
      error_message_sanitized: "curl.exe fallback is only enabled on Windows in this project.",
    };
  }

  const result = spawnSync(
    "curl.exe",
    [
      "-sS",
      "--max-time",
      String(Math.max(1, Math.ceil(timeoutMs / 1000))),
      "-H",
      "Accept: application/json",
      "-o",
      "-",
      "-w",
      "\nCURL_HTTP_STATUS:%{http_code}\nCURL_CONTENT_TYPE:%{content_type}",
      url,
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    },
  );

  const output = String(result.stdout || "");
  const statusMatch = output.match(/CURL_HTTP_STATUS:(\d{3})/);
  const contentTypeMatch = output.match(/CURL_CONTENT_TYPE:(.*)$/m);
  const body = output
    .replace(/\nCURL_HTTP_STATUS:\d{3}[\s\S]*$/m, "")
    .trim();
  const httpStatus = Number(statusMatch?.[1] || 0);

  if (result.status !== 0 && httpStatus === 0) {
    return {
      status: "failed",
      http_status: 0,
      ok: false,
      content_type: "",
      body_preview: "",
      error_name: "CurlCheckError",
      error_code: String(result.status),
      error_message_sanitized: sanitize(result.stderr || "curl.exe probe failed", 240),
    };
  }

  return {
    status: httpStatus > 0 ? "ok" : "failed",
    http_status: httpStatus,
    ok: httpStatus >= 200 && httpStatus < 300,
    content_type: sanitize(contentTypeMatch?.[1] || "", 160),
    body_preview: truncateBody(body),
    error_name: "",
    error_code: "",
    error_message_sanitized: "",
  };
};

export const diagnoseN8nHttp = async (baseUrl = process.env.N8N_BASE_URL || DEFAULT_BASE_URL) => {
  const parsedUrl = new URL(baseUrl);
  const healthzUrl = new URL("/healthz", parsedUrl).toString();
  const settingsUrl = new URL("/rest/settings", parsedUrl).toString();

  const checks = {
    node_fetch_healthz: await runFetchCheck(healthzUrl),
    node_fetch_rest_settings: await runFetchCheck(settingsUrl),
    node_http_request_healthz: await runHttpRequestCheck(healthzUrl),
    powershell_invoke_webrequest_healthz: runPowerShellCheck(healthzUrl),
    curl_cli_healthz: runCurlCheck(healthzUrl),
  };

  const statuses = Object.values(checks).map((check) => check.status);
  const okCount = Object.values(checks).filter((check) => check.status === "ok" && check.http_status >= 200).length;
  const failureCount = Object.values(checks).filter((check) => check.status === "failed").length;
  const timeoutCount = Object.values(checks).filter((check) => check.status === "timeout").length;
  const healthzTransportOkCount = [
    checks.node_fetch_healthz,
    checks.node_http_request_healthz,
    checks.powershell_invoke_webrequest_healthz,
    checks.curl_cli_healthz,
  ].filter((check) => check.status === "ok" && check.http_status >= 200).length;
  const restSettingsReachable = checks.node_fetch_rest_settings.status === "ok" && checks.node_fetch_rest_settings.http_status >= 200;

  let decision = "N8N_BASE_UNKNOWN";
  if (okCount >= 3 && healthzTransportOkCount >= 2 && restSettingsReachable) {
    decision = "N8N_BASE_REACHABLE";
  } else if (okCount > 0 && (failureCount > 0 || timeoutCount > 0)) {
    decision = "N8N_BASE_INCONSISTENT";
  } else if (okCount > 0) {
    decision = "N8N_BASE_REACHABLE";
  } else if (timeoutCount > 0 && okCount === 0) {
    decision = "N8N_BASE_UNREACHABLE";
  } else if (failureCount > 0 && okCount === 0) {
    decision = "N8N_BASE_UNREACHABLE";
  }

  return {
    generated_at: new Date().toISOString(),
    n8n_base_url: parsedUrl.toString().replace(/\/$/, ""),
    url_parse: {
      protocol: parsedUrl.protocol,
      host: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? "443" : "80"),
      pathname: parsedUrl.pathname,
      valid: true,
    },
    timeout_ms: DEFAULT_TIMEOUT_MS,
    checks,
    summary: {
      ok_count: okCount,
      failure_count: failureCount,
      timeout_count: timeoutCount,
    },
    decision,
  };
};

export const diagnoseN8nHttpViaInlineNode = (baseUrl = process.env.N8N_BASE_URL || DEFAULT_BASE_URL) => {
  const moduleUrl = pathToFileURL(__filename).href;
  const code = [
    `import { diagnoseN8nHttp } from ${JSON.stringify(moduleUrl)};`,
    `const result = await diagnoseN8nHttp(${JSON.stringify(baseUrl)});`,
    "console.log(JSON.stringify(result));",
  ].join("\n");
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
            maxBuffer: 8 * 1024 * 1024,
          },
        )
      : spawnSync("node", ["--input-type=module", "-"], {
          cwd: repoRoot,
          encoding: "utf8",
          input: code,
          maxBuffer: 8 * 1024 * 1024,
        });

  if (result.status !== 0) {
    throw new Error(sanitize(result.stderr || result.error || "Inline node diagnosis failed", 240));
  }

  return JSON.parse(String(result.stdout || "").trim());
};

export const runStableDiagnosis = async (baseUrl = process.env.N8N_BASE_URL || DEFAULT_BASE_URL) =>
  process.platform === "win32"
    ? diagnoseN8nHttpViaInlineNode(baseUrl)
    : diagnoseN8nHttp(baseUrl);

const renderMarkdown = (diagnosis) => {
  const lines = [];
  lines.push("# n8n HTTP Diagnosis");
  lines.push("");
  lines.push(`Date: \`${diagnosis.generated_at}\``);
  lines.push(`Base URL: \`${diagnosis.n8n_base_url}\``);
  lines.push(`Decision: \`${diagnosis.decision}\``);
  lines.push("");
  lines.push("## URL Parse");
  lines.push("");
  lines.push(`- Protocol: \`${diagnosis.url_parse.protocol}\``);
  lines.push(`- Host: \`${diagnosis.url_parse.host}\``);
  lines.push(`- Port: \`${diagnosis.url_parse.port}\``);
  lines.push(`- Pathname: \`${diagnosis.url_parse.pathname}\``);
  lines.push("");
  lines.push("## Checks");
  lines.push("");

  for (const [name, check] of Object.entries(diagnosis.checks)) {
    lines.push(`- ${name}: status=\`${check.status}\`, http_status=\`${check.http_status}\`, error_code=\`${check.error_code || ""}\``);
    if (check.error_message_sanitized) {
      lines.push(`  note: ${check.error_message_sanitized}`);
    }
  }

  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- ok_count: \`${diagnosis.summary.ok_count}\``);
  lines.push(`- failure_count: \`${diagnosis.summary.failure_count}\``);
  lines.push(`- timeout_count: \`${diagnosis.summary.timeout_count}\``);
  lines.push("");
  return `${lines.join("\n")}\n`;
};

export const writeDiagnosisEvidence = async (baseUrl = process.env.N8N_BASE_URL || DEFAULT_BASE_URL) => {
  mkdirSync(evidenceDir, { recursive: true });
  const diagnosis = await runStableDiagnosis(baseUrl);
  const jsonPath = path.join(evidenceDir, "n8n-http-diagnosis.json");
  const mdPath = path.join(evidenceDir, "n8n-http-diagnosis.md");
  writeFileSync(jsonPath, `${JSON.stringify(diagnosis, null, 2)}\n`, "utf8");
  writeFileSync(mdPath, renderMarkdown(diagnosis), "utf8");
  process.stdout.write(`${jsonPath}\n${mdPath}\n`);
  return {
    diagnosis,
    jsonPath,
    mdPath,
  };
};

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  writeDiagnosisEvidence().catch((error) => {
    process.stderr.write(`${error.stack || error.message || String(error)}\n`);
    process.exit(1);
  });
}
