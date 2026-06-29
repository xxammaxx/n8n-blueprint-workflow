# n8n Read-Only Connectivity Check

**Date/Time (UTC):** 2026-06-29T12:35:58Z

## Target

| Property | Value |
|----------|-------|
| Host | 192.168.1.52 |
| Port | 5678 |
| Protocol | HTTP |
| Workflow ID | Sv12QTo56NoPUu2D |

## Health Check

| Endpoint | Method | Response | Status |
|----------|--------|----------|--------|
| /healthz | GET | `{"status":"ok"}` | REACHABLE |
| / (UI) | HEAD | HTTP/1.1 200 OK | SERVING |

## UI Access

| Property | Value |
|----------|-------|
| URL | http://192.168.1.52:5678 |
| Browser needed | YES |
| Login required | YES (n8n authentication) |

## Constraints Enforced

| Check | Status |
|-------|--------|
| Read-only operations only | YES |
| No passwords read | YES |
| No tokens read | YES |
| No workflow modifications | YES |
| No credential reads | YES |

## Status

**GREEN** — n8n instance is reachable and responding. UI requires browser + login. No secrets accessed.
