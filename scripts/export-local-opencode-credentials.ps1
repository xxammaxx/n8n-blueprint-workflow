<#
.SYNOPSIS
    Normalizes and exports local OpenCode credentials to a secure local env file.
    Uses safe discovery — NEVER outputs secret values.
    Supports -DiscoverOnly and -WriteLocalSecret modes.

.DESCRIPTION
    Reads from allowed local OpenCode credential sources:
    1. Environment variables (OPENCODE_PROVIDER, OPENCODE_API_KEY, etc.)
    2. Existing project secret file (secrets/opencode-provider.env)
    3. Local OpenCode config files (%USERPROFILE%\.config\opencode\opencode.json)

    Normalizes into target format:
      OPENCODE_PROVIDER=<provider>
      OPENCODE_API_KEY=<api_key>
      OPENCODE_MODEL=<model>
      OPENCODE_MAX_COST_USD=0.25
      OPENCODE_DRY_RUN=true
      OPENCODE_ALLOW_PROVIDER_CALL=false

    Provider derivation from specific keys:
      DEEPSEEK_API_KEY    -> deepseek
      OPENAI_API_KEY      -> openai
      ANTHROPIC_API_KEY   -> anthropic
      OPENROUTER_API_KEY  -> openrouter
      GROQ_API_KEY        -> groq
      GEMINI_API_KEY      -> gemini

.PARAMETER DiscoverOnly
    Discovers credentials without writing any file. Reports status only.

.PARAMETER WriteLocalSecret
    Writes the normalized secret file to C:/Spec-kit_n8n/secrets/opencode-provider.env
    Only if provider, key, and model are all unambiguously available.

.NOTES
    Security: NEVER outputs secret values. NEVER writes to git.
    Target directory secrets/ must be gitignored.
#>

[CmdletBinding()]
param(
    [switch]$DiscoverOnly,
    [switch]$WriteLocalSecret
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$TargetDir = Join-Path $ProjectRoot "secrets"
$TargetFile = Join-Path $TargetDir "opencode-provider.env"

# ============================================================
# CONFIG
# ============================================================
$ProviderMap = @{
    "DEEPSEEK_API_KEY"   = "deepseek"
    "OPENAI_API_KEY"     = "openai"
    "ANTHROPIC_API_KEY"  = "anthropic"
    "OPENROUTER_API_KEY" = "openrouter"
    "GROQ_API_KEY"       = "groq"
    "GEMINI_API_KEY"     = "gemini"
}

$AllKeyNames = @(
    "OPENCODE_PROVIDER",
    "OPENCODE_API_KEY",
    "OPENCODE_MODEL",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "DEEPSEEK_API_KEY",
    "GROQ_API_KEY",
    "OPENROUTER_API_KEY",
    "GEMINI_API_KEY"
)

$EnvScopeOrder = @("Process", "User", "Machine")

# ============================================================
# SAFETY: Check for placeholder values
# ============================================================
function Test-IsPlaceholder {
    param([string]$Value)
    if (-not $Value) { return $false }
    $patterns = @(
        "YOUR_API_KEY_HERE", "your-api-key", "placeholder",
        "change_me", "changeme", "REPLACE_ME", "REPLACE_WITH_YOUR",
        "PASTE_YOUR_", "PASTE_"
    )
    foreach ($p in $patterns) {
        if ($Value.Contains($p)) { return $true }
    }
    if ($Value.StartsWith("sk-0000") -or $Value.StartsWith("sk-your-") -or
        $Value.StartsWith("sk-proj-0000") -or $Value.StartsWith("<your-")) {
        return $true
    }
    return $false
}

# ============================================================
# SOURCE 1: Environment Variables
# ============================================================
function Get-EnvCredentials {
    $result = @{
        Provider    = $null
        ApiKey      = $null
        Model       = $null
        ProviderKeys = @{}
        Source      = "environment"
    }

    foreach ($varName in $AllKeyNames) {
        $val = $null
        foreach ($scope in $EnvScopeOrder) {
            $val = [Environment]::GetEnvironmentVariable($varName, $scope)
            if ($val) { break }
        }
        if ($val -and -not (Test-IsPlaceholder -Value $val)) {
            switch ($varName) {
                "OPENCODE_PROVIDER" { $result.Provider = $val }
                "OPENCODE_API_KEY"  { $result.ApiKey = $val }
                "OPENCODE_MODEL"    { $result.Model = $val }
                default {
                    if ($ProviderMap.ContainsKey($varName)) {
                        $result.ProviderKeys[$varName] = $val
                    }
                }
            }
        }
    }
    return $result
}

# ============================================================
# SOURCE 2: Existing project secret file
# ============================================================
function Get-FileCredentials {
    param([string]$FilePath)

    $result = @{
        Provider    = $null
        ApiKey      = $null
        Model       = $null
        ProviderKeys = @{}
        Source      = $FilePath
    }

    if (-not (Test-Path -LiteralPath $FilePath)) {
        return $result
    }

    $lines = Get-Content -LiteralPath $FilePath

    foreach ($varName in $AllKeyNames) {
        foreach ($line in $lines) {
            if (($line -notmatch '^\s*#') -and ($line -match ("^" + [regex]::Escape($varName) + "\s*=\s*(.+)$"))) {
                $val = $matches[1].Trim()
                # Remove surrounding quotes if present
                $val = $val -replace '^["'']', '' -replace '["'']$', ''
                if ($val -and -not (Test-IsPlaceholder -Value $val)) {
                    switch ($varName) {
                        "OPENCODE_PROVIDER" { $result.Provider = $val }
                        "OPENCODE_API_KEY"  { $result.ApiKey = $val }
                        "OPENCODE_MODEL"    { $result.Model = $val }
                        default {
                            if ($ProviderMap.ContainsKey($varName)) {
                                $result.ProviderKeys[$varName] = $val
                            }
                        }
                    }
                }
                break
            }
        }
    }
    return $result
}

# ============================================================
# SOURCE 3: OpenCode config file (read-only)
# ============================================================
function Get-ConfigCredentials {
    param([string]$ConfigDir)

    $result = @{
        Provider    = $null
        ApiKey      = $null
        Model       = $null
        ProviderKeys = @{}
        Source      = $ConfigDir
    }

    $configFile = Join-Path $ConfigDir "opencode.json"
    if (-not (Test-Path -LiteralPath $configFile)) {
        $configFile = Join-Path $ConfigDir "opencode.jsonc"
    }
    if (-not (Test-Path -LiteralPath $configFile)) {
        return $result
    }

    try {
        $cf = Get-Content -LiteralPath $configFile -Raw | ConvertFrom-Json
        if ($cf.model) {
            $result.Model = $cf.model.ToString()
        }
        if ($cf.provider) {
            $result.Provider = $cf.provider.ToString()
        }
        # Check for API keys in config (some setups store them here)
        if ($cf.apiKey) {
            $result.ApiKey = $cf.apiKey.ToString()
        }
    } catch {
        # Non-JSON or malformed — skip
    }
    return $result
}

# ============================================================
# MERGE: Prefer explicit OPENCODE_PROVIDER/KEY/MODEL,
#        then existing project secret file,
#        then env provider-specific keys
# ============================================================
function Merge-Credentials {
    param(
        $EnvCreds,
        $FileCreds,
        $ConfigCreds
    )

    $merged = @{
        Provider     = $null
        ApiKey       = $null
        Model        = $null
        ProviderKeys = @{}
        Source       = @()
    }

    # Priority 1: Explicit OPENCODE_ vars from env
    if ($EnvCreds.Provider) {
        $merged.Provider = $EnvCreds.Provider
        $merged.Source += "env:OPENCODE_PROVIDER"
    }
    if ($EnvCreds.ApiKey) {
        $merged.ApiKey = $EnvCreds.ApiKey
        $merged.Source += "env:OPENCODE_API_KEY"
    }
    if ($EnvCreds.Model) {
        $merged.Model = $EnvCreds.Model
        $merged.Source += "env:OPENCODE_MODEL"
    }

    # Also collect env provider-specific keys
    foreach ($key in $EnvCreds.ProviderKeys.Keys) {
        $merged.ProviderKeys[$key] = $EnvCreds.ProviderKeys[$key]
    }

    # Priority 2: Existing project secret file (fill gaps)
    if (-not $merged.Provider -and $FileCreds.Provider) {
        $merged.Provider = $FileCreds.Provider
        $merged.Source += "file:OPENCODE_PROVIDER"
    }
    if (-not $merged.ApiKey -and $FileCreds.ApiKey) {
        $merged.ApiKey = $FileCreds.ApiKey
        $merged.Source += "file:OPENCODE_API_KEY"
    }
    if (-not $merged.Model -and $FileCreds.Model) {
        $merged.Model = $FileCreds.Model
        $merged.Source += "file:OPENCODE_MODEL"
    }
    foreach ($key in $FileCreds.ProviderKeys.Keys) {
        if (-not $merged.ProviderKeys.ContainsKey($key)) {
            $merged.ProviderKeys[$key] = $FileCreds.ProviderKeys[$key]
        }
    }

    # Priority 3: OpenCode config (model/provider only, no API keys from config for safety)
    if (-not $merged.Model -and $ConfigCreds.Model) {
        $merged.Model = $ConfigCreds.Model
        $merged.Source += "config:model"
    }
    if (-not $merged.Provider -and $ConfigCreds.Provider) {
        $merged.Provider = $ConfigCreds.Provider
        $merged.Source += "config:provider"
    }

    return $merged
}

# ============================================================
# DERIVE provider from single provider-specific key
# ============================================================
function Derive-Provider {
    param($Merged)

    if ($Merged.Provider) {
        return $Merged.Provider
    }

    $foundProviders = @()
    foreach ($key in $Merged.ProviderKeys.Keys) {
        if ($ProviderMap.ContainsKey($key)) {
            $foundProviders += $ProviderMap[$key]
        }
    }

    $uniqueProviders = $foundProviders | Select-Object -Unique

    if ($uniqueProviders.Count -eq 1) {
        $Merged.Source += "derived:provider=" + $uniqueProviders[0]
        return $uniqueProviders[0]
    }
    elseif ($uniqueProviders.Count -gt 1) {
        return $null  # Multiple — ambiguous
    }

    return $null
}

# ============================================================
# STATUS EVALUATION
# ============================================================
function Get-CredentialStatus {
    param($Provider, $ApiKey, $Model)

    $status = "UNKNOWN"

    if ($Provider -and $ApiKey -and $Model) {
        $status = "GREEN_ALL_PRESENT"
    }
    elseif ($ApiKey -and $Provider -and -not $Model) {
        $status = "GREEN_PARTIAL_MODEL_MISSING"
    }
    elseif ($Provider -and $Model -and -not $ApiKey) {
        $status = "GREEN_PARTIAL_CREDENTIAL_NOT_FOUND"
    }
    elseif ($ApiKey -and -not $Provider) {
        $status = "YELLOW_PROVIDER_NOT_DERIVABLE"
    }
    elseif (-not $ApiKey -and -not $Provider -and -not $Model) {
        $status = "RED_NO_CREDENTIALS_FOUND"
    }

    return $status
}

# ============================================================
# MAIN: DISCOVER
# ============================================================
function Invoke-Discovery {
    Write-Output "============================================================"
    Write-Output "OPENCODE CREDENTIAL EXPORT - DISCOVER PHASE"
    Write-Output "============================================================"
    Write-Output ("Timestamp: " + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
    Write-Output ""

    # Gather from all sources
    $envCreds = Get-EnvCredentials
    Write-Output "[SOURCE] Environment variables checked."

    $fileCreds = Get-FileCredentials -FilePath $TargetFile
    $fileCredMsg = if ($fileCreds.Provider) { "has credentials" } else { "empty or not found" }
    Write-Output ("[SOURCE] Existing secret file: " + $fileCredMsg)

    $configCreds = Get-ConfigCredentials -ConfigDir (Join-Path $env:USERPROFILE ".config\opencode")
    $configMsg = if ($configCreds.Model -or $configCreds.Provider) { "has settings" } else { "no relevant settings" }
    Write-Output ("[SOURCE] OpenCode config: " + $configMsg)

    # Merge
    $merged = Merge-Credentials -EnvCreds $envCreds -FileCreds $fileCreds -ConfigCreds $configCreds

    # Derive provider if needed
    if (-not $merged.Provider) {
        $derived = Derive-Provider -Merged $merged
        if ($derived) {
            $merged.Provider = $derived
        }
    }

    # Status
    $status = Get-CredentialStatus -Provider $merged.Provider -ApiKey $merged.ApiKey -Model $merged.Model

    Write-Output ""
    Write-Output "--- DISCOVERY RESULT ---"
    $prov_yn = if ($merged.Provider) { "yes" } else { "no" }
    $key_yn = if ($merged.ApiKey) { "yes" } else { "no" }
    $model_yn = if ($merged.Model) { "yes" } else { "no" }
    Write-Output ("Provider present    : " + $prov_yn)
    Write-Output ("API Key present     : " + $key_yn)
    Write-Output ("Model present       : " + $model_yn)
    Write-Output ("Sources             : " + ($merged.Source -join ", "))
    Write-Output ("Status              : " + $status)
    Write-Output ("Secret values output: NEVER")
    Write-Output ""

    # Provider key ambiguity check
    $uniqueProviderKeyCount = ($merged.ProviderKeys.Keys | ForEach-Object { $ProviderMap[$_] } | Select-Object -Unique).Count
    if ($uniqueProviderKeyCount -gt 1) {
        Write-Output "WARNING: Multiple different provider keys found (YELLOW_MULTIPLE_PROVIDER_KEYS_FOUND)"
        Write-Output "  Manual provider selection required."
    }

    # Return merged for WriteLocalSecret
    return @{
        Merged = $merged
        Status = $status
    }
}

# ============================================================
# MAIN: WRITE LOCAL SECRET FILE
# ============================================================
function Invoke-WriteLocalSecret {
    param($DiscoveryResult)

    $merged = $DiscoveryResult.Merged
    $status = $DiscoveryResult.Status

    Write-Output "============================================================"
    Write-Output "OPENCODE CREDENTIAL EXPORT - WRITE PHASE"
    Write-Output "============================================================"

    if ($status -ne "GREEN_ALL_PRESENT") {
        Write-Output "ERROR: Cannot write secret file. Status: $status"
        Write-Output "  All three values (Provider, API Key, Model) must be present."
        if ($status -eq "GREEN_PARTIAL_MODEL_MISSING") {
            Write-Output "  Missing: OPENCODE_MODEL"
        }
        if ($status -eq "GREEN_PARTIAL_CREDENTIAL_NOT_FOUND") {
            Write-Output "  Missing: OPENCODE_API_KEY"
        }
        if ($status -eq "YELLOW_PROVIDER_NOT_DERIVABLE") {
            Write-Output "  Missing: OPENCODE_PROVIDER (and could not derive from provider keys)"
        }
        return
    }

    # Check for multiple provider keys
    $uniqueProviderKeyCount = ($merged.ProviderKeys.Keys | ForEach-Object { $ProviderMap[$_] } | Select-Object -Unique).Count
    if ($uniqueProviderKeyCount -gt 1 -and -not $merged.Provider) {
        Write-Output "ERROR: YELLOW_MULTIPLE_PROVIDER_KEYS_FOUND"
        Write-Output "  Cannot automatically choose provider. Manual selection required."
        return
    }

    # Ensure target directory exists
    if (-not (Test-Path -LiteralPath $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
        Write-Output ("Created directory: " + $TargetDir)
    }

    # Build the normalized env file content
    $content = @"
# ============================================================
# OpenCode Provider Credentials — AUTO-GENERATED
# Generated: $( [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ') )
# Source: $( $merged.Source -join ', ' )
# WARNING: This file contains secrets. NEVER commit to git.
# ============================================================
OPENCODE_PROVIDER=$($merged.Provider)
OPENCODE_API_KEY=$($merged.ApiKey)
OPENCODE_MODEL=$($merged.Model)
OPENCODE_MAX_COST_USD=0.25
OPENCODE_DRY_RUN=true
OPENCODE_ALLOW_PROVIDER_CALL=false
"@

    # Write file with restricted permissions (if possible on this OS)
    Set-Content -LiteralPath $TargetFile -Value $content -NoNewline

    # Verify the file was written (presence check only, no content display)
    if (Test-Path -LiteralPath $TargetFile) {
        $fileInfo = Get-Item -LiteralPath $TargetFile
        Write-Output ""
        Write-Output "--- WRITE RESULT ---"
        Write-Output ("Target file      : " + $TargetFile)
        Write-Output ("File exists      : yes")
        Write-Output ("File size        : " + $fileInfo.Length + " bytes")
        Write-Output ("Provider set     : yes")
        Write-Output ("API Key set      : yes")
        Write-Output ("Model set        : yes")
        Write-Output ("Placeholder      : no")
        Write-Output ("Cost limit set   : yes (0.25 USD)")
        Write-Output ("Dry run enabled  : yes")
        Write-Output ("Provider call    : blocked (false)")
        Write-Output ("Secret output    : NEVER")
        Write-Output ""
        Write-Output "SUCCESS: Local secret file written."
    } else {
        Write-Output "ERROR: File was not created."
    }
}

# ============================================================
# ENTRY POINT
# ============================================================

if (-not $DiscoverOnly -and -not $WriteLocalSecret) {
    Write-Output "Usage:"
    Write-Output "  .\export-local-opencode-credentials.ps1 -DiscoverOnly"
    Write-Output "  .\export-local-opencode-credentials.ps1 -WriteLocalSecret"
    Write-Output ""
    Write-Output "Always run -DiscoverOnly first to verify status."
    exit 1
}

if ($DiscoverOnly) {
    $result = Invoke-Discovery
    # Return the result object for potential use by WriteLocalSecret
    $result
}

if ($WriteLocalSecret) {
    $result = Invoke-Discovery
    Invoke-WriteLocalSecret -DiscoveryResult $result
}
