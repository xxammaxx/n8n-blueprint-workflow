# n8n Health and Version Check

## Health Endpoint
- **URL:** http://192.168.1.52:5678/healthz
- **Response:** `{"status":"ok"}`
- **Health OK:** yes

## UI Accessibility
- **URL:** http://192.168.1.52:5678
- **HTTP Status:** 200 OK
- **Content-Type:** text/html; charset=utf-8
- **Content-Length:** 18893 bytes
- **UI reachable:** yes

## Version
- **n8n Version:** 2.26.8

## CT 101 Process Status
- **n8n Process:** PID 7035, running since Jun29 (Ssl)
  - Command: `node /usr/bin/n8n start`
  - Memory: ~238MB RSS
- **Task Runner:** PID 7048, running since Jun29 (Sl)
  - Command: `node ... @n8n/task-runner/dist/start.js`
  - Memory: ~62MB RSS

## Status
- **N8N_HEALTH_GREEN**
- **N8N_UI_REACHABLE**
- **No secrets output**
