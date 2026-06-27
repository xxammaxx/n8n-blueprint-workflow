<#
.SYNOPSIS
    Lädt Umgebungsvariablen aus .env.local in die aktuelle PowerShell-Session.

.DESCRIPTION
    Liest die Datei .env.local aus dem Projektroot, parst KEY=VALUE-Zeilen
    und setzt sie als $env:KEY. Gibt nur boolesche Ladebestätigungen aus,
    niemals die tatsächlichen Secret-Werte.

    Prüft, ob N8N_API_KEY gesetzt ist und nicht mehr den Platzhalter enthält.
    Falls N8N_API_KEY fehlt oder noch PASTE_YOUR_N8N_API_KEY_HERE ist,
    wird ein klarer Fehler ausgegeben und der Prozess beendet.

.EXAMPLE
    .\scripts\load-local-env.ps1
#>

$ErrorActionPreference = "Stop"

# Projektroot finden (übergeordnetes Verzeichnis von scripts/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$envFilePath = Join-Path -Path $projectRoot -ChildPath ".env.local"

# Prüfen, ob .env.local existiert
if (-not (Test-Path -LiteralPath $envFilePath -PathType Leaf)) {
    Write-Host ""
    Write-Host "FEHLER: .env.local nicht gefunden." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Erwarteter Pfad: $envFilePath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Erstelle die Datei aus der Vorlage:" -ForegroundColor Yellow
    Write-Host "    Copy-Item .env.example .env.local" -ForegroundColor Cyan
    Write-Host "  Dann trage deinen N8N_API_KEY in .env.local ein." -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=== Lade lokale Umgebungsvariablen aus .env.local ===" -ForegroundColor Cyan
Write-Host ""

$loadedCount = 0
$secretFound = $false
$placeholderFound = $false
$lines = Get-Content -LiteralPath $envFilePath

foreach ($line in $lines) {
    $trimmed = $line.Trim()

    # Leerzeilen und Kommentare ignorieren
    if ([string]::IsNullOrEmpty($trimmed) -or $trimmed.StartsWith("#")) {
        continue
    }

    # Nur KEY=VALUE-Format akzeptieren
    if ($trimmed -notmatch '^[A-Za-z_][A-Za-z0-9_]*=.*') {
        continue
    }

    $eqIndex = $trimmed.IndexOf("=")
    if ($eqIndex -le 0) { continue }

    $key = $trimmed.Substring(0, $eqIndex)
    $value = $trimmed.Substring($eqIndex + 1)

    # Wert in Anführungszeichen bereinigen
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    # Variable setzen
    Set-Item -Path "env:$key" -Value $value

    # Spezialbehandlung für N8N_API_KEY
    if ($key -eq "N8N_API_KEY") {
        if ([string]::IsNullOrEmpty($value)) {
            $secretFound = $false
            $placeholderFound = $true
        } elseif ($value -eq "PASTE_YOUR_N8N_API_KEY_HERE") {
            $secretFound = $false
            $placeholderFound = $true
        } else {
            $secretFound = $true
        }
    }

    # Nur Boolesche Ausgabe — niemals den Wert selbst!
    $displayKey = $key
    Write-Host "  $displayKey loaded: yes" -ForegroundColor Green
    $loadedCount++
}

Write-Host ""
Write-Host "  $loadedCount Variablen geladen." -ForegroundColor Gray
Write-Host ""

# Kritische Prüfung: N8N_API_KEY
if (-not $secretFound) {
    Write-Host "FEHLER: N8N_API_KEY ist nicht oder nicht korrekt gesetzt." -ForegroundColor Red
    Write-Host ""
    if ($placeholderFound) {
        Write-Host "  .env.local enthält noch den Platzhalter:" -ForegroundColor Yellow
        Write-Host "    N8N_API_KEY=PASTE_YOUR_N8N_API_KEY_HERE" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  So behebst du das:" -ForegroundColor Yellow
        Write-Host "    1. Öffne .env.local in einem Editor." -ForegroundColor Cyan
        Write-Host "    2. Ersetze PASTE_YOUR_N8N_API_KEY_HERE durch deinen echten Key." -ForegroundColor Cyan
        Write-Host "    3. Speichern und schließen." -ForegroundColor Cyan
        Write-Host "    4. Führe dieses Script erneut aus." -ForegroundColor Cyan
    } else {
        Write-Host "  .env.local enthält keinen N8N_API_KEY-Eintrag." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Füge folgende Zeile in .env.local ein:" -ForegroundColor Cyan
        Write-Host "    N8N_API_KEY=dein_echter_key" -ForegroundColor Cyan
    }
    Write-Host ""
    Write-Host "  Kein Scan ohne gültigen API-Key." -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Sicherheitsprüfung: niemals den Key ausgeben
Write-Host "  API-Key ausgegeben: nein" -ForegroundColor Green
Write-Host "  API-Key gesetzt: ja (Länge: $($env:N8N_API_KEY.Length) Zeichen)" -ForegroundColor Green
Write-Host ""

Write-Host "=== .env.local erfolgreich geladen ===" -ForegroundColor Green
Write-Host ""
