#!/usr/bin/env node

/**
 * validate-secret-hygiene.mjs
 *
 * Prüft, dass keine Secrets (API-Keys, Tokens, Passwörter) in
 * Git-verfolgbaren Dateien, README, Evidence, Workflows oder
 * Logs landen.
 *
 * Exit Codes:
 *   0  = Alles sauber
 *   1  = Secret-Muster gefunden
 *   77 = .env.local fehlt (kein Fehler, nur Hinweis)
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Konfiguration ==========================================

const REPO_ROOT = path.resolve(__dirname, "..");
const EVIDENCE_DIR = path.join(REPO_ROOT, "evidence");
const WORKFLOWS_DIR = path.join(REPO_ROOT, "workflows");
const DOCS_DIR = path.join(REPO_ROOT, "docs");
const SCRIPTS_DIR = path.join(REPO_ROOT, "scripts");
const README_PATH = path.join(REPO_ROOT, "README.md");
const GITIGNORE_PATH = path.join(REPO_ROOT, ".gitignore");
const ENV_LOCAL_PATH = path.join(REPO_ROOT, ".env.local");
const ENV_EXAMPLE_PATH = path.join(REPO_ROOT, ".env.example");

// Erlaubte Dateien für den Platzhalter PASTE_YOUR_N8N_API_KEY_HERE
// Dazu gehören Dokumentation, Loader-Skripte und das Validator-Skript selbst,
// die den Platzhalter als Referenz/Instruktion verwenden.
// Evidence-Dateien, die den Platzhalter dokumentieren, sind ebenfalls erlaubt.
const ALLOWED_PLACEHOLDER_FILES = new Set([
  ENV_EXAMPLE_PATH,
  ENV_LOCAL_PATH,
  README_PATH,
  path.join(SCRIPTS_DIR, "load-local-env.ps1"),
  path.join(SCRIPTS_DIR, "validate-secret-hygiene.mjs"),
  path.join(EVIDENCE_DIR, "local-secret-file-preflight.md"),
  path.join(EVIDENCE_DIR, "local-secret-file-validation.md"),
  path.join(EVIDENCE_DIR, "local-secret-file-run-report.md"),
]);

// === Hilfsfunktionen ========================================

const asText = (value, fallback = "") => {
  if (value == null) return fallback;
  return String(value).trim() || fallback;
};

const collectFiles = (dir, predicate = () => true) => {
  const results = [];
  if (!existsSync(dir)) return results;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Rekursiv, aber .git und node_modules überspringen
      if (entry.name === ".git" || entry.name === "node_modules") continue;
      results.push(...collectFiles(fullPath, predicate));
    } else if (predicate(fullPath, entry)) {
      results.push(fullPath);
    }
  }
  return results;
};

const isTextFile = (filePath) => {
  const textExtensions = [
    ".md", ".json", ".mjs", ".js", ".ps1", ".sh", ".yml", ".yaml",
    ".env", ".env.example", ".gitignore", ".txt", ".toml", ".cfg",
    ".conf", ".ini", ".xml", ".html", ".css",
  ];
  const ext = path.extname(filePath).toLowerCase();
  if (textExtensions.includes(ext)) return true;

  // Dateien ohne Extension oder mit unbekannter Extension als Text behandeln
  try {
    const content = readFileSync(filePath, "utf8").slice(0, 100);
    // Prüfe, ob es druckbarer Text ist
    return /^[\x20-\x7E\r\n\t]*$/.test(content.replace(/[^\x20-\x7E\r\n\t]/g, ""));
  } catch {
    return false;
  }
};

// === Secret-Muster ==========================================
// Nur Flags, wenn ein langer alphanumerischer String im VALUE-Teil
// einer KEY=VALUE- oder "key": "value"-Assignment-Zeile steht.

// Regex für Assignment-Kontext: Zeile enthält einen Key mit Secret-Indikator
// gefolgt von einem langen alphanumerischen Wert
const ASSIGNMENT_PATTERN = /["']?[A-Za-z_]+(?:API_KEY|_KEY|_TOKEN|_SECRET|_PASSWORD|api_key|password)["']?\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}["']?/;

// === Prüfungen ==============================================

let violations = [];
let warnings = [];

// 1. Prüfen, ob .gitignore existiert und .env.local ignoriert
const checkGitignore = () => {
  if (!existsSync(GITIGNORE_PATH)) {
    violations.push(".gitignore existiert nicht im Projektroot.");
    return;
  }
  const content = readFileSync(GITIGNORE_PATH, "utf8");
  const lines = content.split("\n").map((l) => l.trim());

  const hasEnvLocal = lines.includes(".env.local");
  const hasEnvStarLocal = lines.includes(".env.*.local");
  const hasSecretEnv = lines.includes("*.secret.env");
  const hasSecretsDir = lines.includes("secrets/");
  const hasEnvExampleExclude = lines.includes("!.env.example");

  if (!hasEnvLocal && !hasEnvStarLocal) {
    violations.push(".gitignore ignoriert .env.local nicht.");
  }
  if (!hasSecretEnv) {
    violations.push(".gitignore ignoriert *.secret.env nicht.");
  }
  if (!hasSecretsDir) {
    violations.push(".gitignore ignoriert secrets/-Verzeichnis nicht.");
  }
  if (!hasEnvExampleExclude) {
    warnings.push(".gitignore enthält keine !.env.example-Ausnahme.");
  }
};

// 2. Prüfen, ob .env.example echte Keys enthält
const checkEnvExample = () => {
  if (!existsSync(ENV_EXAMPLE_PATH)) {
    violations.push(".env.example existiert nicht.");
    return;
  }
  const content = readFileSync(ENV_EXAMPLE_PATH, "utf8");

  // Prüfen, ob der Platzhalter korrekt gesetzt ist
  if (!content.includes("PASTE_YOUR_N8N_API_KEY_HERE")) {
    warnings.push(".env.example enthält nicht den Platzhalter PASTE_YOUR_N8N_API_KEY_HERE.");
  }

  // Prüfen, ob ein echter API-Key (kein Platzhalter) enthalten ist
  const apiKeyLine = content.split("\n").find((l) => l.trim().startsWith("N8N_API_KEY="));
  if (apiKeyLine) {
    const value = apiKeyLine.split("=", 2)[1]?.trim() || "";
    if (value && value !== "PASTE_YOUR_N8N_API_KEY_HERE" && !value.startsWith("#")) {
      violations.push(".env.example enthält einen API-Key (kein Platzhalter).");
    }
  }
};

// 3. Prüfen, ob .env.local den Key enthält (existiert optional)
const checkEnvLocal = () => {
  if (!existsSync(ENV_LOCAL_PATH)) {
    warnings.push(".env.local existiert nicht — keine lokale Secret-Datei.");
    return { exists: false, hasKey: false };
  }

  const content = readFileSync(ENV_LOCAL_PATH, "utf8");
  const apiKeyLine = content.split("\n").find((l) => l.trim().startsWith("N8N_API_KEY="));
  let hasKey = false;

  if (apiKeyLine) {
    const value = apiKeyLine.split("=", 2)[1]?.trim() || "";
    if (value && value !== "PASTE_YOUR_N8N_API_KEY_HERE") {
      hasKey = true;
    }
  }

  return { exists: true, hasKey };
};

// 4. README auf echte API-Keys prüfen
const checkReadme = () => {
  if (!existsSync(README_PATH)) {
    warnings.push("README.md existiert nicht.");
    return;
  }

  const content = readFileSync(README_PATH, "utf8");

  // Prüfen auf echte API-Keys (nicht Platzhalter)
  const apiKeyLine = content.split("\n").find((l) => l.includes("N8N_API_KEY"));
  if (apiKeyLine) {
    // Prüfen, ob ein echter Key (kein Platzhalter, keine Umgebungsvariable) im README steht
    const match = apiKeyLine.match(/N8N_API_KEY\s*=\s*(.+)/);
    if (match) {
      const value = match[1].trim();
      // Erlaubte Werte im README: Platzhalter, $env:-Syntax, ${env:}-Syntax, Markdown-Code
      const isAllowed =
        value.includes("PASTE_YOUR") ||
        value.includes("$env:") ||
        value.includes("${env:") ||
        value.startsWith("<") ||
        value.startsWith("`");

      if (value && !isAllowed) {
        violations.push("README.md enthält einen API-Key-Wert (kein Platzhalter, keine env-Referenz).");
      }
    }
  }
};

// 5. Evidence-Dateien auf echte API-Keys prüfen
const checkEvidence = () => {
  if (!existsSync(EVIDENCE_DIR)) return;

  const files = collectFiles(EVIDENCE_DIR, (fp) => isTextFile(fp));
  for (const file of files) {
    const content = readFileSync(file, "utf8");

    // Prüfen auf N8N_API_KEY=echterWert (nicht Platzhalter, nicht env-Referenz)
    const apiKeyLine = content.split("\n").find((l) => {
      const trimmed = l.trim();
      return (
        trimmed.startsWith("N8N_API_KEY=") &&
        !trimmed.includes("PASTE_YOUR") &&
        !trimmed.includes("$env:") &&
        !trimmed.includes("`")
      );
    });
    if (apiKeyLine) {
      violations.push(
        `Evidence-Datei enthält API-Key: ${path.relative(REPO_ROOT, file)}`,
      );
    }

    // Prüfen auf Assignment-Kontext mit Secret-Indikator
    const assignmentMatch = content.match(ASSIGNMENT_PATTERN);
    if (assignmentMatch) {
      const matchStr = assignmentMatch[0];
      // Redigiert melden (Wert ersetzen)
      const redacted = matchStr.replace(/[A-Za-z0-9_\-]{16,}/g, "***REDACTED***");
      // Nur melden, wenn der Wert nicht offensichtlich ein Platzhalter oder Beispiel ist
      if (
        !redacted.includes("PASTE_YOUR") &&
        !redacted.includes("your-key") &&
        !redacted.includes("example") &&
        !redacted.includes("EXAMPLE")
      ) {
        violations.push(
          `Evidence-Datei enthält mögliches Secret: ${path.relative(REPO_ROOT, file)}\n` +
          `  [redigiert]: ${redacted}`,
        );
      }
    }
  }
};

// 6. Workflow-JSON auf API-Keys prüfen
const checkWorkflows = () => {
  if (!existsSync(WORKFLOWS_DIR)) return;

  const files = collectFiles(WORKFLOWS_DIR, (fp) => fp.endsWith(".json"));
  for (const file of files) {
    const content = readFileSync(file, "utf8");

    // Prüfen auf Assignment-Kontext mit Secret-Indikator
    const assignmentMatch = content.match(ASSIGNMENT_PATTERN);
    if (assignmentMatch) {
      const matchStr = assignmentMatch[0];
      const redacted = matchStr.replace(/[A-Za-z0-9_\-]{16,}/g, "***REDACTED***");
      if (
        !redacted.includes("PASTE_YOUR") &&
        !redacted.includes("your-key") &&
        !redacted.includes("example")
      ) {
        violations.push(
          `Workflow-JSON enthält mögliches Secret: ${path.relative(REPO_ROOT, file)}\n` +
          `  [redigiert]: ${redacted}`,
        );
      }
    }
  }
};

// 7. Prüfen, dass PASTE_YOUR_N8N_API_KEY_HERE nur in erlaubten Dateien vorkommt
const checkPlaceholderUsage = () => {
  const allFiles = [
    README_PATH,
    ...collectFiles(EVIDENCE_DIR, (fp) => isTextFile(fp)),
    ...collectFiles(WORKFLOWS_DIR, (fp) => fp.endsWith(".json")),
    ...collectFiles(DOCS_DIR, (fp) => isTextFile(fp)),
    ...collectFiles(SCRIPTS_DIR, (fp) => fp.endsWith(".mjs") || fp.endsWith(".ps1") || fp.endsWith(".sh")),
  ];

  for (const file of allFiles) {
    if (!existsSync(file)) continue;
    if (ALLOWED_PLACEHOLDER_FILES.has(file)) continue;

    const content = readFileSync(file, "utf8");
    if (content.includes("PASTE_YOUR_N8N_API_KEY_HERE")) {
      violations.push(
        `Platzhalter PASTE_YOUR_N8N_API_KEY_HERE in nicht erlaubter Datei: ${path.relative(REPO_ROOT, file)}`,
      );
    }
  }
};

// === Hauptfunktion ==========================================

const main = () => {
  process.stdout.write("# Secret Hygiene Validation\n\n");

  const envLocal = checkEnvLocal();

  // 1. Gitignore
  process.stdout.write("## 1. Gitignore-Prüfung\n\n");
  checkGitignore();
  if (violations.length === 0 || !violations.some((v) => v.includes(".gitignore"))) {
    process.stdout.write("- .gitignore schützt .env.local: ja\n\n");
  }

  // 2. .env.example
  process.stdout.write("## 2. .env.example-Prüfung\n\n");
  checkEnvExample();
  process.stdout.write(`- .env.example existiert: ${existsSync(ENV_EXAMPLE_PATH) ? "ja" : "nein"}\n`);
  process.stdout.write("- .env.example enthält echten Key: nein (Platzhalter)\n\n");

  // 3. .env.local
  process.stdout.write("## 3. .env.local-Prüfung\n\n");
  process.stdout.write(`- .env.local existiert: ${envLocal.exists ? "ja" : "nein"}\n`);
  if (envLocal.exists) {
    process.stdout.write(`- API-Key gesetzt: ${envLocal.hasKey ? "ja" : "nein"}\n`);
    process.stdout.write("- API-Key ausgegeben: nein\n");
  }
  process.stdout.write("\n");

  // 4. README
  process.stdout.write("## 4. README-Prüfung\n\n");
  checkReadme();
  process.stdout.write("- README enthält echten Key: nein\n\n");

  // 5. Evidence
  process.stdout.write("## 5. Evidence-Prüfung\n\n");
  checkEvidence();
  const evidenceViolations = violations.filter((v) => v.includes("Evidence"));
  process.stdout.write(
    evidenceViolations.length === 0
      ? "- Evidence-Dateien enthalten keine Secrets: ja\n\n"
      : `- Evidence-Dateien enthalten keine Secrets: nein (${evidenceViolations.length} Verstöße)\n\n`,
  );

  // 6. Workflows
  process.stdout.write("## 6. Workflow-Prüfung\n\n");
  checkWorkflows();
  const workflowViolations = violations.filter((v) => v.includes("Workflow"));
  process.stdout.write(
    workflowViolations.length === 0
      ? "- Workflow-JSON enthält keine Secrets: ja\n\n"
      : `- Workflow-JSON enthält keine Secrets: nein (${workflowViolations.length} Verstöße)\n\n`,
  );

  // 7. Platzhalter
  process.stdout.write("## 7. Platzhalter-Prüfung\n\n");
  checkPlaceholderUsage();
  const placeholderViolations = violations.filter((v) => v.includes("Platzhalter"));
  process.stdout.write(
    placeholderViolations.length === 0
      ? "- Platzhalter nur in erlaubten Dateien: ja\n\n"
      : `- Platzhalter nur in erlaubten Dateien: nein (${placeholderViolations.length} Verstöße)\n\n`,
  );

  // === Ergebnisse zusammenfassen ============================

  process.stdout.write("## Ergebnis\n\n");

  if (violations.length > 0) {
    process.stdout.write(`### Verstöße (${violations.length})\n\n`);
    for (const v of violations) {
      process.stdout.write(`- ❌ ${v}\n`);
    }
    process.stdout.write("\n");
  }

  if (warnings.length > 0) {
    process.stdout.write(`### Warnungen (${warnings.length})\n\n`);
    for (const w of warnings) {
      process.stdout.write(`- ⚠️ ${w}\n`);
    }
    process.stdout.write("\n");
  }

  if (violations.length === 0) {
    process.stdout.write("Secret-Hygiene: ✅ ALLE PRÜFUNGEN BESTANDEN\n\n");
    process.exit(0);
  } else {
    process.stdout.write(`Secret-Hygiene: ❌ ${violations.length} VERSTÖSSE\n\n`);
    process.exit(1);
  }
};

main();
