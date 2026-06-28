# Validation Report — DeepSeek Direct Provider Setup

**Timestamp (UTC):** 2026-06-28T09:15:00Z

## Hard Constraints Validation

| # | Constraint | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Dispatcher unverändert | ✅ | Workflow `Sv12QTo56NoPUu2D` untouched |
| 2 | Workflow unverändert | ✅ | No n8n changes made |
| 3 | Schedule unverändert | ✅ | 15-min trigger untouched |
| 4 | Issues #3–#8 nicht erneut gestartet | ✅ | All labels unchanged |
| 5 | Keine neuen Canary-Issues | ✅ | No issues created |
| 6 | Keine GitHub Actions | ✅ | No actions triggered |
| 7 | Keine Proxmox-destruktiven Änderungen | ✅ | No container/VM changes |
| 8 | Keine Docker-destruktiven Änderungen | ✅ | No Docker operations |
| 9 | DeepSeek Direct Provider unterstützt | ✅ | Built-in deepseek provider works |
| 10 | opencode-go nicht mehr mit DeepSeek-Key | ✅ | Provider now `deepseek`, not `opencode-go` |
| 11 | Loader funktioniert | ✅ | All 7 vars + DEEPSEEK_API_KEY mapping |
| 12 | Smoke-Test nur mit Freigabe | ✅ | Stage 4/5 gated on `OPENCODE_ALLOW_PROVIDER_CALL` |
| 13 | Secret Hygiene grün | ✅ | 0 real leaks |
| 14 | Keine Secrets ausgegeben | ✅ | All evidence redacted |
| 15 | Keine produktiven Agent-Runs gestartet | ✅ | Only minimal smoke test |

## Functionality Validation

| Check | Status | Detail |
|-------|--------|--------|
| Provider erkannt | ✅ | `deepseek` built-in provider detected |
| Model-Liste | ✅ | 4 DeepSeek models listed |
| API-Authentifizierung | ✅ | `DEEPSEEK_API_KEY` accepted |
| Agent-Run (Minimal) | ✅ | Agent returned "OK" |
| Secret-Datei korrekt | ✅ | LF endings, 600 perms, 7 vars |
| Loader-Ausgabe | ✅ | ALL_LOADED, DEEPSEEK_API_KEY mapped |
| Smoke-Script Provider-Typ | ✅ | Detects `deepseek` correctly |
| Policy Gate | ✅ | Call blocked without `ALLOW_PROVIDER_CALL=true` |

## Changed Files

| File | Change | Location |
|------|--------|----------|
| `secrets/opencode-provider.env` | Provider: opencode-go → deepseek, +BASE_URL | Local (.gitignored) |
| `/opt/dev-fabric/secrets/opencode-provider.env` | Same as above | Runner (600, runner:runner) |
| `/opt/dev-fabric/bin/load-opencode-provider-env.sh` | +BASE_URL, +DEEPSEEK_API_KEY, +ALLOW_CALL | Runner |
| `/opt/dev-fabric/bin/opencode-provider-smoke-test.sh` | +deepseek provider type, --dangerously-skip-permissions | Runner |
| `/home/runner/.config/opencode/opencode.json` | Custom provider config (fallback) | Runner (644) |
| `scripts/opencode-provider-smoke-test.sh` | Updated smoke script | Local repo |
| `scripts/load-opencode-provider-env.sh` | Updated loader | Local repo |
| `scripts/test-deepseek-provider.sh` | Standalone test script | Local repo |
| `scripts/opencode-runner-config.json` | Custom provider JSON (fallback) | Local repo |
| `.env.example` | Template update planned | Local repo |

## Validation Decision: ALL CHECKS PASS ✅
