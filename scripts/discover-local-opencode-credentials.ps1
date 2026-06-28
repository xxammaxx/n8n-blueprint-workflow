<#
.SYNOPSIS
    Discover-only script for local OpenCode credentials.
    NEVER outputs secret values - only boolean status indicators.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Test-IsPlaceholder {
    param([string]$Value)
    if (-not $Value) { return $false }
    $placeholders = @(
        "YOUR_API_KEY_HERE",
        "your-api-key",
        "placeholder",
        "change_me",
        "changeme",
        "REPLACE_ME",
        "REPLACE_WITH_YOUR",
        "PASTE_YOUR_",
        "PASTE_"
    )
    foreach ($p in $placeholders) {
        if ($Value.Contains($p)) { return $true }
    }
    # Also check for common placeholder prefixes
    if ($Value.StartsWith("sk-0000") -or $Value.StartsWith("sk-your-") -or $Value.StartsWith("sk-proj-0000") -or $Value.StartsWith("<your-")) {
        return $true
    }
    return $false
}

Write-Output "============================================================"
Write-Output "LOCAL OPENCODE CREDENTIAL DISCOVERY - DISCOVER-ONLY MODE"
Write-Output "============================================================"
Write-Output ("Timestamp (UTC): " + [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))
Write-Output ("Hostname: " + $env:COMPUTERNAME)
Write-Output ("User: " + $env:USERNAME)
Write-Output ""
Write-Output "SAFETY: No secret values will be displayed."
Write-Output "============================================================"
Write-Output ""

# ============================================================
# SECTION 1: ENVIRONMENT VARIABLES
# ============================================================
Write-Output "--- SECTION 1: ENVIRONMENT VARIABLES ---"

$envVarNames = @(
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

$foundEnvVars = @{}

foreach ($varName in $envVarNames) {
    $val = [Environment]::GetEnvironmentVariable($varName, "Process")
    if (-not $val) { $val = [Environment]::GetEnvironmentVariable($varName, "User") }
    if (-not $val) { $val = [Environment]::GetEnvironmentVariable($varName, "Machine") }

    if ($val) {
        $isPlaceholder = Test-IsPlaceholder -Value $val
        $length = $val.Length
        $firstChars = ""
        $lastChars = ""
        if ($length -ge 4) {
            $firstChars = $val.Substring(0, 4)
            $lastChars = $val.Substring($length - 4)
        } else {
            $firstChars = $val
            $lastChars = $val
        }

        Write-Output ("  ENV " + $varName + " : PRESENT")
        Write-Output ("    Length       : " + $length)
        Write-Output ("    Prefix       : " + $firstChars)
        Write-Output ("    Suffix       : " + $lastChars)
        $phMsg = if ($isPlaceholder) { "YES" } else { "no" }
        Write-Output ("    Placeholder  : " + $phMsg)
        $foundEnvVars[$varName] = @{ Length = $length; IsPlaceholder = $isPlaceholder }
    } else {
        Write-Output ("  ENV " + $varName + " : not set")
    }
}

# Summary
$realEnvKeys = @{}
foreach ($key in $foundEnvVars.Keys) {
    if (-not $foundEnvVars[$key].IsPlaceholder) {
        $realEnvKeys[$key] = $true
    }
}

$hasProvider_yn = if ($realEnvKeys.ContainsKey("OPENCODE_PROVIDER")) { "yes" } else { "no" }
$hasApiKey_yn = if ($realEnvKeys.ContainsKey("OPENCODE_API_KEY")) { "yes" } else { "no" }
$hasModel_yn = if ($realEnvKeys.ContainsKey("OPENCODE_MODEL")) { "yes" } else { "no" }

Write-Output ""
Write-Output "  Summary:"
Write-Output ("    OPENCODE_PROVIDER present  : " + $hasProvider_yn)
Write-Output ("    OPENCODE_API_KEY present   : " + $hasApiKey_yn)
Write-Output ("    OPENCODE_MODEL present     : " + $hasModel_yn)

Write-Output "    Provider-specific keys found:"

$providerMap = @{
    "OPENAI_API_KEY" = "openai"
    "ANTHROPIC_API_KEY" = "anthropic"
    "DEEPSEEK_API_KEY" = "deepseek"
    "GROQ_API_KEY" = "groq"
    "OPENROUTER_API_KEY" = "openrouter"
    "GEMINI_API_KEY" = "gemini"
}

$presentProviders = @()
foreach ($pk in $providerMap.Keys) {
    $present = $realEnvKeys.ContainsKey($pk)
    $present_yn = if ($present) { "yes" } else { "no" }
    Write-Output ("      " + $pk + " : " + $present_yn)
    if ($present) { $presentProviders += $pk }
}

$hasExplicitProvider = $realEnvKeys.ContainsKey("OPENCODE_PROVIDER")
$singleProviderDerivable = ($presentProviders.Count -eq 1)
$multipleProviders = ($presentProviders.Count -gt 1)

$derivMsg = "no"
if ($hasExplicitProvider) { $derivMsg = "yes (explicit OPENCODE_PROVIDER)" }
elseif ($singleProviderDerivable) { $derivMsg = "yes (from single provider key)" }
elseif ($multipleProviders) { $derivMsg = "MULTIPLE - ambiguous" }

Write-Output ("    Provider derivable         : " + $derivMsg)
Write-Output ""

# ============================================================
# SECTION 2: LOCAL OPENCODE CONFIGURATION PATHS
# ============================================================
Write-Output "--- SECTION 2: LOCAL OPENCODE CONFIGURATION PATHS ---"

$configPathEntries = @(
    @{Path = (Join-Path $env:USERPROFILE ".config\opencode"); Label = "USERPROFILE\.config\opencode"},
    @{Path = (Join-Path $env:APPDATA "opencode"); Label = "APPDATA\opencode"},
    @{Path = (Join-Path $env:LOCALAPPDATA "opencode"); Label = "LOCALAPPDATA\opencode"},
    @{Path = (Join-Path $env:USERPROFILE ".opencode"); Label = "USERPROFILE\.opencode"}
)

$foundConfigPaths = @()

foreach ($cp in $configPathEntries) {
    $exists = Test-Path -LiteralPath $cp.Path
    $existMsg = if ($exists) { "present" } else { "not found" }
    Write-Output ("  " + $cp.Label + " : " + $existMsg)

    if ($exists) {
        $foundConfigPaths += $cp

        $configFile = Join-Path $cp.Path "opencode.json"
        $configFileC = Join-Path $cp.Path "opencode.jsonc"
        $hasJson = Test-Path -LiteralPath $configFile
        $hasJsonC = Test-Path -LiteralPath $configFileC

        if ($hasJson -or $hasJsonC) {
            Write-Output "    opencode config file : present"
            $cfPath = if ($hasJson) { $configFile } else { $configFileC }
            try {
                $cf = Get-Content -LiteralPath $cfPath -Raw | ConvertFrom-Json
                $cfProv = $cf.provider
                $cfMod = $cf.model
                $cfProv_yn = if ($cfProv) { "yes" } else { "no" }
                $cfMod_yn = if ($cfMod) { "yes" } else { "no" }
                Write-Output ("    config.provider set  : " + $cfProv_yn)
                Write-Output ("    config.model set     : " + $cfMod_yn)
            } catch {
                Write-Output "    config parse         : could not parse (non-JSON or malformed)"
            }
        } else {
            Write-Output "    opencode config file : not found"
        }
    }
}

Write-Output ""

# ============================================================
# SECTION 3: PROJECT PATHS
# ============================================================
Write-Output "--- SECTION 3: PROJECT PATHS ---"

$projectPathEntries = @(
    @{Path = "C:\Spec-kit_n8n\.env.local"; Label = ".env.local"},
    @{Path = "C:\Spec-kit_n8n\secrets\opencode-provider.env"; Label = "secrets/opencode-provider.env"}
)

$keyPatterns = @(
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

foreach ($pp in $projectPathEntries) {
    $exists = Test-Path -LiteralPath $pp.Path
    $existMsg = if ($exists) { "present" } else { "not found" }
    Write-Output ("  " + $pp.Label + " : " + $existMsg)

    if ($exists) {
        $lines = Get-Content -LiteralPath $pp.Path
        $totalLines = $lines.Count
        $nonEmptyNonComment = 0
        foreach ($line in $lines) {
            if (($line -match '\S') -and ($line -notmatch '^\s*#')) {
                $nonEmptyNonComment++
            }
        }

        foreach ($kp in $keyPatterns) {
            $matchLine = $null
            foreach ($line in $lines) {
                if (($line -notmatch '^\s*#') -and ($line -match ($kp + "\s*="))) {
                    $matchLine = $line
                    break
                }
            }
            if ($matchLine) {
                $valuePart = $matchLine -replace "^[^=]*=\s*", ""
                $valLen = $valuePart.Trim().Length
                $isPH = Test-IsPlaceholder -Value $valuePart.Trim()
                $phStatus = if ($isPH) { "YES" } else { "no" }
                Write-Output ("    " + $kp + " : PRESENT (length=" + $valLen + ", placeholder=" + $phStatus + ")")
            } else {
                Write-Output ("    " + $kp + " : not found")
            }
        }
        Write-Output ("    Total lines           : " + $totalLines)
        Write-Output ("    Non-empty/non-comment : " + $nonEmptyNonComment)
    }
}

Write-Output ""

# ============================================================
# FINAL SUMMARY
# ============================================================
Write-Output "============================================================"
Write-Output "FINAL DISCOVERY SUMMARY"
Write-Output "============================================================"
Write-Output ("  Environment vars checked    : " + $envVarNames.Count)
Write-Output ("  Config paths checked        : " + $configPathEntries.Count)
Write-Output ("  Project paths checked       : " + $projectPathEntries.Count)
Write-Output "  Secret values output        : NEVER (enforced)"
Write-Output ""
Write-Output "  Result: Discovery completed."
Write-Output "  Run export script for normalization and safe transfer."
Write-Output "============================================================"
