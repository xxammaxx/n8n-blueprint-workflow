<#
.SYNOPSIS
    Führt den Trusted Readiness Scan mit lokal geladenem API-Key aus.

.DESCRIPTION
    1. Lädt Umgebungsvariablen aus .env.local (via load-local-env.ps1)
    2. Führt node scripts/run-trusted-readiness-scan.mjs aus
    3. Fasst das Ergebnis zusammen
    4. Gibt niemals den API-Key aus

    Diese Datei ist der empfohlene Einstiegspunkt für alle lokalen
    Readiness-Scans, wenn der N8N_API_KEY in .env.local hinterlegt ist.

.EXAMPLE
    cd C:\Spec-kit_n8n
    .\scripts\run-trusted-readiness-with-local-env.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Trusted Readiness Scan mit lokalem API-Key" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: Lokale Umgebungsvariablen laden
$loaderPath = Join-Path -Path $PSScriptRoot -ChildPath "load-local-env.ps1"
Write-Host "[1/3] Lade .env.local ..." -ForegroundColor Yellow
& $loaderPath
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "FEHLER: .env.local konnte nicht geladen werden." -ForegroundColor Red
    Write-Host "Kein Scan ohne gültigen API-Key." -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Schritt 2: Trusted Readiness Scan ausführen
Write-Host "[2/3] Führe Trusted Readiness Scan aus ..." -ForegroundColor Yellow
Write-Host ""

$scanResult = & node (Join-Path -Path $PSScriptRoot -ChildPath "run-trusted-readiness-scan.mjs") 2>&1
$scanExitCode = $LASTEXITCODE

Write-Host ""

# Schritt 3: Ergebnis zusammenfassen (ohne Secrets)
Write-Host "[3/3] Ergebnis:" -ForegroundColor Yellow
Write-Host ""

# Evidence-Dateien aus der Ausgabe extrahieren
$evidenceFiles = @()
foreach ($line in $scanResult) {
    $lineStr = "$line"
    if ($lineStr -match '^[A-Z]:\\.+\.(json|md)$') {
        $evidenceFiles += $lineStr
    }
}

if ($scanExitCode -eq 0) {
    # Versuche, den Scan-Exit-Code aus der JSON-Evidence zu lesen
    $jsonPath = Join-Path -Path (Split-Path -Parent $PSScriptRoot) -ChildPath "evidence/trusted-readiness-scan.json"
    if (Test-Path -LiteralPath $jsonPath -PathType Leaf) {
        try {
            $scanData = Get-Content -LiteralPath $jsonPath -Raw | ConvertFrom-Json
            $decision = $scanData.scan.decision
            $nextAction = $scanData.scan.allowed_next_action
            $apiStatus = $scanData.scan.api_status
            $workflowStatus = $scanData.scan.workflow_status

            Write-Host "  Scan-Entscheidung : $decision" -ForegroundColor Green
            Write-Host "  Nächster Schritt  : $nextAction" -ForegroundColor Cyan
            Write-Host "  API-Status       : $apiStatus" -ForegroundColor Yellow
            Write-Host "  Workflow-Status   : $workflowStatus" -ForegroundColor Yellow
            Write-Host "  API-Key ausgegeben: nein" -ForegroundColor Green
            Write-Host ""
            Write-Host "  Evidence-Dateien:" -ForegroundColor Gray
            foreach ($ef in $evidenceFiles) {
                Write-Host "    - $ef" -ForegroundColor Gray
            }

            if ($decision -eq "READY_FOR_LIVE_POST") {
                Write-Host ""
                Write-Host "  !!! READY_FOR_LIVE_POST !!!" -ForegroundColor Green
                if ($nextAction -eq "POST_LIVE_DRY_HOP") {
                    Write-Host "  Nächster Schritt: POST_LIVE_DRY_HOP" -ForegroundColor Green
                    Write-Host "  Du kannst jetzt den Live-Dry-Hop-POST senden." -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "  Scan abgeschlossen (Exit Code: $scanExitCode)" -ForegroundColor Green
        }
    } else {
        Write-Host "  Scan abgeschlossen (Exit Code: $scanExitCode)" -ForegroundColor Green
    }
} else {
    Write-Host "  Scan fehlgeschlagen (Exit Code: $scanExitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Ausgabe:" -ForegroundColor Yellow
    foreach ($line in $scanResult) {
        $lineStr = "$line"
        # Niemals API-Key ausgeben
        if ($lineStr -match '(?i)n8n.?api.?key|api_key|N8N_API_KEY') {
            Write-Host "    [Zeile mit API-Key redigiert]" -ForegroundColor DarkGray
        } else {
            Write-Host "    $lineStr" -ForegroundColor DarkGray
        }
    }
}

Write-Host ""
Write-Host "  API-Key ausgegeben: nein" -ForegroundColor Green
Write-Host "  Exit Code: $scanExitCode" -ForegroundColor @{ $true = "Green"; $false = "Red" }[$scanExitCode -eq 0]

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Scan abgeschlossen." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

exit $scanExitCode
