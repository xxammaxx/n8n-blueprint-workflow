<#
.SYNOPSIS
  Kopiert OpenCode Provider Credentials sicher vom lokalen Projekt auf den Runner.
  NIEMALS Secret-Werte ausgeben. Platzhalter werden standardmäßig blockiert.

.DESCRIPTION
  Dieses Script überträgt die lokale Credential-Datei
    C:\Spec-kit_n8n\secrets\opencode-provider.env
  über den Proxmox-Host (192.168.1.136) in den LXC-Container lxc-dev-runner (102)
  nach /opt/dev-fabric/secrets/opencode-provider.env.

  Es setzt die Rechte (600) und den Owner (runner:runner) auf dem Ziel.
  Anschließend wird der Loader aufgerufen.

  Modi:
  - VerifyOnly:  Nur prüfen, ob alles erreichbar und bereit ist. Kein Copy.
  - Normal:       Echte Credentials kopieren. Blockiert Platzhalter.
  - AllowPlaceholderCopy: Platzhalter-Kopie trotzdem erlauben (nur auf expliziten Wunsch).

.PARAMETER LocalCredentialPath
  Pfad zur lokalen Credential-Datei (Default: secrets\opencode-provider.env)

.PARAMETER ProxmoxHost
  Proxmox-Host IP/Hostname (Default: 192.168.1.136)

.PARAMETER ProxmoxUser
  Proxmox SSH User (Default: root)

.PARAMETER ProxmoxKey
  Pfad zum SSH Private Key für Proxmox (Default: ~\.ssh\proxmox_scanner)

.PARAMETER ContainerId
  LXC Container ID auf Proxmox (Default: 102)

.PARAMETER RunnerCredentialPath
  Zielpfad im Runner-Container (Default: /opt/dev-fabric/secrets/opencode-provider.env)

.PARAMETER VerifyOnly
  Nur Verifikation durchführen, keine Datei kopieren

.PARAMETER AllowPlaceholderCopy
  Platzhalter-Datei kopieren, auch wenn PASTE_* Werte enthalten sind

.EXAMPLE
  .\scripts\copy-opencode-provider-credentials.ps1 -VerifyOnly

.EXAMPLE
  .\scripts\copy-opencode-provider-credentials.ps1

.EXAMPLE
  .\scripts\copy-opencode-provider-credentials.ps1 -AllowPlaceholderCopy

.NOTES
  SICHERHEIT: Dieses Script gibt NIEMALS Secret-Werte aus.
  Bei Fehlern werden nur redigierte Fehlermeldungen angezeigt.
  Keine API-Keys, Tokens oder Passwörter in Logs oder auf der Konsole.
#>

param(
  [string]$LocalCredentialPath = "secrets\opencode-provider.env",
  [string]$ProxmoxHost = "192.168.1.136",
  [string]$ProxmoxUser = "root",
  [string]$ProxmoxKey = "$env:USERPROFILE\.ssh\proxmox_scanner",
  [string]$ContainerId = "102",
  [string]$RunnerCredentialPath = "/opt/dev-fabric/secrets/opencode-provider.env",
  [switch]$AllowPlaceholderCopy,
  [switch]$VerifyOnly
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$LocalFullPath = Join-Path $ProjectRoot $LocalCredentialPath

# ============================================================
# Hilfsfunktionen
# ============================================================

function Write-SafeInfo {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-SafeSuccess {
  param([string]$Message)
  Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-SafeWarn {
  param([string]$Message)
  Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-SafeError {
  param([string]$Message)
  Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-SafeBanner {
  param([string]$Title)
  $line = "=" * 60
  Write-Host $line -ForegroundColor DarkGray
  Write-Host "  $Title" -ForegroundColor White
  Write-Host $line -ForegroundColor DarkGray
}

# Führt SSH-Kommando auf Proxmox aus, NIEMALS stdout anzeigen das Secrets enthalten könnte
function Invoke-ProxmoxSSH {
  param(
    [string]$Command,
    [int]$TimeoutSec = 15,
    [switch]$IgnoreExitCode
  )

  $sshArgs = @(
    "-o", "ConnectTimeout=$TimeoutSec",
    "-o", "StrictHostKeyChecking=accept-new",
    "-o", "BatchMode=yes",
    "-o", "LogLevel=ERROR",
    "-i", $ProxmoxKey,
    "${ProxmoxUser}@${ProxmoxHost}",
    $Command
  )

  $result = & ssh $sshArgs 2>&1
  $exitCode = $LASTEXITCODE

  if (-not $IgnoreExitCode -and $exitCode -ne 0) {
    # Redigiere mögliche Secrets in der Fehlerausgabe
    $safeError = $result -replace '(ghp_|github_pat_|sk-|xox[baprs]-|AIza)[A-Za-z0-9_-]{10,}', '[REDACTED_CREDENTIAL]'
    $safeError = $safeError -replace '(OPENCODE_API_KEY=)[^\s]+', 'OPENCODE_API_KEY=[REDACTED]'
    throw "SSH command failed (exit=$exitCode): $safeError"
  }

  return @{
    Output = $result
    ExitCode = $exitCode
  }
}

# Führt pct exec auf dem Proxmox-Host aus (innerhalb des Containers)
function Invoke-RunnerCommand {
  param(
    [string]$Command,
    [int]$TimeoutSec = 15
  )
  $escapedCommand = $Command -replace "'", "'\''"
  return Invoke-ProxmoxSSH -Command "pct exec $ContainerId -- bash -c '$escapedCommand'" -TimeoutSec $TimeoutSec
}

# Prüft, ob ein Wert ein Platzhalter ist (PASTE_*, YOUR_*, <...>, PLACEHOLDER*)
function Test-IsPlaceholder {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return $true }
  if ($Value.StartsWith("PASTE_")) { return $true }
  if ($Value.StartsWith("PLACEHOLDER")) { return $true }
  if ($Value.StartsWith("YOUR_")) { return $true }
  if ($Value.StartsWith("<")) { return $true }
  return $false
}

# Parst die .env-Datei und gibt Hashtable zurück, NIEMALS Werte ausgeben
function Read-EnvFileSecure {
  param([string]$Path)

  $vars = @{}
  $lines = Get-Content -Path $Path -ErrorAction Stop

  foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ($trimmed -eq "" -or $trimmed.StartsWith("#")) { continue }
    if ($trimmed -match '^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$') {
      $key = $Matches[1]
      $value = $Matches[2].Trim()
      # Entferne optionale Quotes
      if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
          ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      $vars[$key] = $value
    }
  }

  return $vars
}

# ============================================================
# BANNER
# ============================================================

Write-SafeBanner "OpenCode Provider Credential Copy Tool"
Write-SafeInfo "Timestamp (UTC): $((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'))"
Write-SafeInfo "Local: $LocalFullPath"
Write-SafeInfo "Proxmox: ${ProxmoxUser}@${ProxmoxHost}"
Write-SafeInfo "Container: $ContainerId"
Write-SafeInfo "Remote: $RunnerCredentialPath"
Write-SafeInfo "VerifyOnly: $VerifyOnly"
Write-SafeInfo "AllowPlaceholderCopy: $AllowPlaceholderCopy"
Write-Host ""

# ============================================================
# SCHRITT 1: Lokale Datei prüfen
# ============================================================

Write-SafeInfo "Schritt 1/7: Lokale Credential-Datei prüfen..."

if (-not (Test-Path -LiteralPath $LocalFullPath)) {
  Write-SafeError "Lokale Datei nicht gefunden: $LocalFullPath"
  Write-SafeInfo "Bitte erstelle die Datei mit: notepad $LocalFullPath"
  Write-SafeInfo "Vorlage: OPENCODE_PROVIDER=..., OPENCODE_API_KEY=..., OPENCODE_MODEL=..."
  exit 1
}

Write-SafeSuccess "Lokale Datei gefunden."

# Lies die Variablen (Werte werden NIEMALS ausgegeben)
$envVars = Read-EnvFileSecure -Path $LocalFullPath

# Prüfe erforderliche Keys
$requiredKeys = @("OPENCODE_PROVIDER", "OPENCODE_API_KEY", "OPENCODE_MODEL", "OPENCODE_MAX_COST_USD", "OPENCODE_DRY_RUN", "OPENCODE_ALLOW_PROVIDER_CALL")
$hasAllKeys = $true
foreach ($key in $requiredKeys) {
  if (-not $envVars.ContainsKey($key)) {
    Write-SafeWarn "Key fehlt: $key"
    $hasAllKeys = $false
  }
}

if (-not $hasAllKeys) {
  Write-SafeError "Nicht alle erforderlichen Keys vorhanden. Bitte Datei vervollständigen."
  Write-SafeInfo "Erforderlich: $($requiredKeys -join ', ')"
  exit 1
}

Write-SafeSuccess "Alle erforderlichen Keys vorhanden: $($requiredKeys.Count)"

# Prüfe auf Platzhalter (Werte werden NIEMALS ausgegeben)
$placeholderKeys = @()
$realKeys = @()
foreach ($key in $requiredKeys) {
  if (Test-IsPlaceholder -Value $envVars[$key]) {
    $placeholderKeys += $key
  } else {
    $realKeys += $key
  }
}

Write-SafeInfo "Echte Werte: $($realKeys.Count) Keys ($($realKeys -join ', '))"
Write-SafeInfo "Platzhalter: $($placeholderKeys.Count) Keys ($($placeholderKeys -join ', '))"

if ($placeholderKeys.Count -gt 0) {
  if ($VerifyOnly) {
    Write-SafeWarn "Platzhalter gefunden (VerifyOnly: nur Warnung, kein Abbruch)."
    Write-SafeWarn "Betroffene Keys: $($placeholderKeys -join ', ')"
    Write-SafeInfo "Bitte echte Werte eintragen: notepad $LocalFullPath"
  } elseif ($AllowPlaceholderCopy) {
    Write-SafeWarn "ACHTUNG: Platzhalter werden trotzdem kopiert (-AllowPlaceholderCopy gesetzt)."
    Write-SafeWarn "Betroffene Keys: $($placeholderKeys -join ', ')"
  } else {
    Write-SafeError "Datei enthält Platzhalter. Copy abgebrochen."
    Write-SafeInfo "Betroffene Keys: $($placeholderKeys -join ', ')"
    Write-SafeInfo "Bitte echte Werte eintragen: notepad $LocalFullPath"
    Write-SafeInfo "Oder erzwingen mit: -AllowPlaceholderCopy"
    exit 2
  }
} else {
  Write-SafeSuccess "Keine Platzhalter gefunden. Echte Credentials erkannt."
}

Write-Host ""

# ============================================================
# SCHRITT 2: Proxmox-Verbindung prüfen
# ============================================================

Write-SafeInfo "Schritt 2/7: Proxmox-Verbindung prüfen..."

try {
  $proxmoxCheck = Invoke-ProxmoxSSH -Command "echo PROXMOX_OK" -TimeoutSec 10
  Write-SafeSuccess "Proxmox-Host $ProxmoxHost erreichbar (SSH)."
} catch {
  Write-SafeError "Proxmox-Host nicht erreichbar: $_"
  exit 3
}

Write-Host ""

# ============================================================
# SCHRITT 3: Container-Status prüfen
# ============================================================

Write-SafeInfo "Schritt 3/7: Container-Status prüfen..."

try {
  $containerStatus = Invoke-ProxmoxSSH -Command "pct status $ContainerId 2>&1" -TimeoutSec 10
  Write-SafeSuccess "Container $ContainerId Status: $($containerStatus.Output.Trim())"
} catch {
  Write-SafeError "Container-Status nicht abrufbar: $_"
  exit 4
}

# Prüfe, ob Container läuft
if ($containerStatus.Output -notmatch "running") {
  Write-SafeError "Container $ContainerId läuft nicht. Status: $($containerStatus.Output.Trim())"
  exit 4
}

# Stelle sicher, dass RootFS gemountet ist
try {
  $null = Invoke-ProxmoxSSH -Command "pct mount $ContainerId 2>&1" -TimeoutSec 10 -IgnoreExitCode
} catch {
  # Mount kann fehlschlagen wenn bereits gemountet, ignorieren
}

# Prüfe RootFS-Zugriff
try {
  $rootfsCheck = Invoke-ProxmoxSSH -Command "test -d /var/lib/lxc/${ContainerId}/rootfs && echo ROOTFS_OK || echo ROOTFS_MISSING" -TimeoutSec 10
  if ($rootfsCheck.Output -match "ROOTFS_MISSING") {
    Write-SafeError "Container RootFS nicht zugreifbar unter /var/lib/lxc/${ContainerId}/rootfs"
    exit 4
  }
  Write-SafeSuccess "Container RootFS zugreifbar."
} catch {
  Write-SafeError "RootFS-Prüfung fehlgeschlagen: $_"
  exit 4
}

Write-Host ""

# ============================================================
# SCHRITT 4: Zielverzeichnis im Container prüfen
# ============================================================

Write-SafeInfo "Schritt 4/7: Zielverzeichnis im Container prüfen..."

$remoteDir = Split-Path $RunnerCredentialPath -Parent
try {
  $dirCheck = Invoke-ProxmoxSSH -Command "test -d /var/lib/lxc/${ContainerId}/rootfs${remoteDir} && echo DIR_OK || echo DIR_MISSING" -TimeoutSec 10
  if ($dirCheck.Output -match "DIR_MISSING") {
    Write-SafeWarn "Zielverzeichnis $remoteDir existiert nicht. Erstelle..."
    Invoke-ProxmoxSSH -Command "mkdir -p /var/lib/lxc/${ContainerId}/rootfs${remoteDir}" -TimeoutSec 10
    Write-SafeSuccess "Zielverzeichnis erstellt."
  } else {
    Write-SafeSuccess "Zielverzeichnis $remoteDir vorhanden."
  }
} catch {
  Write-SafeError "Zielverzeichnis-Prüfung fehlgeschlagen: $_"
  exit 5
}

Write-Host ""

# ============================================================
# SCHRITT 5: Verify-Only Modus (hier stoppen)
# ============================================================

if ($VerifyOnly) {
  Write-SafeBanner "VERIFY-ONLY ABGESCHLOSSEN"
  Write-SafeSuccess "Alle Checks bestanden. Keine Daten kopiert."
  Write-SafeInfo "Bereit für echten Copy: .\scripts\copy-opencode-provider-credentials.ps1"
  exit 0
}

# ============================================================
# SCHRITT 6: Sichere Dateiübertragung
# ============================================================

Write-SafeInfo "Schritt 5/7: Datei sicher auf Runner kopieren..."

# Temporärer Pfad auf Proxmox-Host
$tempRemoteFile = "/tmp/opencode-provider-copy-$(Get-Date -Format 'yyyyMMddHHmmss').env"

try {
  # Schritt 6a: scp zum Proxmox-Host
  Write-SafeInfo "  Übertrage Datei zum Proxmox-Host..."
  $scpResult = & scp -o StrictHostKeyChecking=accept-new -o BatchMode=yes -o LogLevel=ERROR -i $ProxmoxKey $LocalFullPath "${ProxmoxUser}@${ProxmoxHost}:${tempRemoteFile}" 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-SafeError "SCP zum Proxmox-Host fehlgeschlagen."
    # Keine Datei-Inhalte ausgeben!
    exit 6
  }
  Write-SafeSuccess "  Datei zum Proxmox-Host übertragen ($tempRemoteFile)."
} catch {
  Write-SafeError "SCP-Fehler (redigiert): Übertragung zum Proxmox-Host fehlgeschlagen."
  exit 6
}

try {
  # Schritt 6b: Von Proxmox in Container-RootFS kopieren (als Datei, nicht als echo/cat!)
  $rootfsTarget = "/var/lib/lxc/${ContainerId}/rootfs${RunnerCredentialPath}"
  Write-SafeInfo "  Kopiere in Container-RootFS..."

  Invoke-ProxmoxSSH -Command "cp '$tempRemoteFile' '$rootfsTarget'" -TimeoutSec 10
  Write-SafeSuccess "  Datei in Container-RootFS kopiert."

  # Schritt 6c: Temporäre Datei auf Proxmox löschen
  Invoke-ProxmoxSSH -Command "rm -f '$tempRemoteFile'" -TimeoutSec 10 -IgnoreExitCode
  Write-SafeSuccess "  Temporäre Datei auf Proxmox bereinigt."
} catch {
  # Bereinige Temp-Datei im Fehlerfall
  try { Invoke-ProxmoxSSH -Command "rm -f '$tempRemoteFile'" -TimeoutSec 5 -IgnoreExitCode } catch {}
  Write-SafeError "Container-Kopie fehlgeschlagen: $_"
  exit 6
}

Write-SafeSuccess "Datei sicher auf Runner kopiert (Inhalt wurde NICHT ausgegeben)."

Write-Host ""

# ============================================================
# SCHRITT 7: Rechte und Owner im Container setzen
# ============================================================

Write-SafeInfo "Schritt 6/7: Rechte und Owner setzen..."

try {
  # In unprivilegierten Containern muss chown/chmod INNERHALB des Containers erfolgen
  # wegen UID-Mapping. pct exec ist der sicherste Weg.
  $escapedPath = $RunnerCredentialPath -replace "'", "'\''"

  $chownResult = Invoke-RunnerCommand -Command "chown runner:runner '$escapedPath' 2>&1" -TimeoutSec 10
  Write-SafeSuccess "Owner gesetzt: runner:runner"

  $chmodResult = Invoke-RunnerCommand -Command "chmod 600 '$escapedPath' 2>&1" -TimeoutSec 10
  Write-SafeSuccess "Rechte gesetzt: 600"
} catch {
  Write-SafeError "Rechte/Owner setzen fehlgeschlagen: $_"
  exit 7
}

Write-Host ""

# ============================================================
# SCHRITT 8: Verify und Loader ausführen
# ============================================================

Write-SafeInfo "Schritt 7/7: Remote-Datei verifizieren und Loader ausführen..."

# Prüfe Datei-Existenz und -Attribute (nur Metadaten, kein Inhalt!)
try {
  $statCheck = Invoke-RunnerCommand -Command "stat --format='EXISTS:yes SIZE:%s PERMS:%a OWNER:%U GROUP:%G' '$RunnerCredentialPath' 2>&1" -TimeoutSec 10
  Write-SafeSuccess "Remote-Datei: $($statCheck.Output.Trim())"
} catch {
  Write-SafeError "Remote-Datei-Stat fehlgeschlagen: $_"
  exit 8
}

# Führe Loader aus (Ausgabe ist sicher — enthält keine Secret-Werte)
Write-SafeInfo "Führe Loader aus..."
try {
  $loaderResult = Invoke-RunnerCommand -Command "/opt/dev-fabric/bin/load-opencode-provider-env.sh 2>&1; echo 'LOADER_EXIT:'\$?" -TimeoutSec 15
  Write-Host ""
  Write-SafeInfo "--- Loader Output ---"
  # Loader-Ausgabe ist sicher (zeigt nur "loaded", "placeholder", etc.)
  foreach ($line in ($loaderResult.Output -split "`n")) {
    if ($line -match 'SECRET_STATUS') {
      Write-Host "  $line" -ForegroundColor DarkGray
    } elseif ($line -match 'loaded') {
      Write-Host "  $line" -ForegroundColor Green
    } elseif ($line -match 'placeholder') {
      Write-Host "  $line" -ForegroundColor Yellow
    } elseif ($line -match 'not set') {
      Write-Host "  $line" -ForegroundColor Red
    } elseif ($line -match 'LOADER_EXIT:') {
      $exitVal = $line -replace 'LOADER_EXIT:', ''
      if ($exitVal.Trim() -eq "0") {
        Write-SafeSuccess "Loader Exit Code: 0 (ALL_LOADED)"
      } elseif ($exitVal.Trim() -eq "2") {
        Write-SafeWarn "Loader Exit Code: 2 (PLACEHOLDER_DETECTED)"
      } else {
        Write-SafeWarn "Loader Exit Code: $($exitVal.Trim())"
      }
    } else {
      Write-Host "  $line"
    }
  }
  Write-Host ""
} catch {
  Write-SafeError "Loader-Ausführung fehlgeschlagen: $_"
  exit 8
}

# ============================================================
# ABSCHLUSS
# ============================================================

Write-SafeBanner "COPY ABGESCHLOSSEN"
Write-SafeSuccess "Credential-Datei wurde sicher auf den Runner kopiert."
Write-SafeInfo "Rechte: 600, Owner: runner:runner"
Write-SafeInfo "Keine Secret-Werte wurden ausgegeben."
Write-Host ""
Write-SafeInfo "Nächste optionale Schritte:"
Write-SafeInfo "  1. Provider Smoke Test (nur mit OPENCODE_ALLOW_PROVIDER_CALL=true):"
Write-SafeInfo "     /opt/dev-fabric/bin/opencode-provider-smoke-test.sh"
Write-SafeInfo "  2. OpenCode Version prüfen:"
Write-SafeInfo "     /opt/dev-fabric/opencode/opencode --version"
Write-Host ""

exit 0
