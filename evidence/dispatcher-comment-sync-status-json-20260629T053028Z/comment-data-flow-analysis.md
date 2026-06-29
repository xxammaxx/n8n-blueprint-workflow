# Comment Data Flow Analysis

## Current Flow (Broken)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PREPARE RUN_INPUT (Node 6)                        │
│                                                                      │
│  Builds: {                                                           │
│    mode: 'manual-terminal',              ← hardcoded                 │
│    agent_runtime: {                                                 │
│      opencode_provider_configured: false ← hardcoded                 │
│    },                                                                │
│    evidence_dir: '/opt/dev-fabric/.../issue-X/run-YYYYMMDD/'         │
│  }                                                                   │
│                                                                      │
│  This data is STALE — it never reflects actual runner outcome.       │
└──────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                SSH READ STATUS.JSON (Node 10)                        │
│                                                                      │
│  Executes on runner via SSH:                                         │
│    jq . /opt/dev-fabric/.../status.json                              │
│                                                                      │
│  Output (SSH node wraps in { stdout, success, exitCode }):           │
│  {                                                                   │
│    "success": true,                                                  │
│    "stdout": "{\n  \"status\": \"GREEN\",\n  \"mode\": {...}\n}",    │
│    "exitCode": 0                                                     │
│  }                                                                   │
│                                                                      │
│  ⚠️  The actual status.json content is in stdout as a STRING.        │
└──────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│           FORMAT EVIDENCE COMMENT (Node 11) — BROKEN                 │
│                                                                      │
│  Input: statusOutput = { success, stdout, exitCode }                 │
│                                                                      │
│  Path 1: typeof === 'string' → try JSON.parse                        │
│          ✗ SKIPPED (statusOutput is object, not string)              │
│                                                                      │
│  Path 2: typeof === 'object' → read .status or .error                │
│          ✗ FAILS (SSH wrapper has no .status field)                  │
│          → status stays 'UNKNOWN'                                    │
│                                                                      │
│  Fallback: prepData.mode = 'manual-terminal' (from RUN_INPUT)        │
│          → effectiveMode = 'manual-terminal'                         │
│                                                                      │
│  Result: ALL real runner values LOST                                 │
└──────────────────────────────────────────────────────────────────────┘
```

## Fixed Flow (Target)

```
┌──────────────────────────────────────────────────────────────────────┐
│                SSH READ STATUS.JSON (Node 10)                        │
│                                                                      │
│  Output (unchanged): { stdout: "{JSON}", success: true, exitCode }   │
└──────────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│           FORMAT EVIDENCE COMMENT (Node 11) — FIXED                  │
│                                                                      │
│  STEP 1: Extract stdout from SSH wrapper                             │
│    const rawStdout = statusOutput.stdout || '';                      │
│                                                                      │
│  STEP 2: Parse status.json content                                   │
│    const statusData = JSON.parse(rawStdout);                         │
│                                                                      │
│  STEP 3: Extract real values from status.json                        │
│    status = statusData.status;                                       │
│    effectiveMode = statusData.mode?.effective;                       │
│    providerConfigured = statusData.agent_runtime?                    │
│                         .opencode_provider_configured;                │
│    provider = statusData.provider;                                   │
│    model = statusData.model;                                         │
│    openCodeVersion = statusData.agent_runtime?                       │
│                      .opencode_version;                              │
│    exitCode = statusOutput.exitCode;                                 │
│                                                                      │
│  STEP 4: Label evidence source                                       │
│    evidenceSource = 'status.json';                                   │
│                                                                      │
│  STEP 5: Fallback chain                                              │
│    status.json → RUN_INPUT.json → 'UNKNOWN'                          │
└──────────────────────────────────────────────────────────────────────┘
```

## Fallback Chain

```
1. status.json (via SSH stdout → JSON.parse)
   ├── status ✅
   ├── mode.effective ✅
   ├── agent_runtime.opencode_provider_configured ✅
   ├── agent_runtime.opencode_version ✅
   ├── provider (falls vorhanden)
   ├── model (falls vorhanden)
   └── exitCode (from SSH wrapper)
   
2. Fallback: $('Prepare RUN_INPUT.json').first().json
   ├── mode: 'manual-terminal'
   └── run_id, evidence_dir, etc.
   
3. Last resort: hardcoded defaults
   ├── status: 'UNKNOWN'
   └── mode: 'manual-terminal'
```
