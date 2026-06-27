# n8n HTTP Diagnosis

Date: `2026-06-26T08:00:59.403Z`
Base URL: `http://192.168.1.52:5678`
Decision: `N8N_BASE_REACHABLE`

## URL Parse

- Protocol: `http:`
- Host: `192.168.1.52`
- Port: `5678`
- Pathname: `/`

## Checks

- node_fetch_healthz: status=`ok`, http_status=`200`, error_code=``
- node_fetch_rest_settings: status=`ok`, http_status=`200`, error_code=``
- node_http_request_healthz: status=`ok`, http_status=`200`, error_code=``
- powershell_invoke_webrequest_healthz: status=`ok`, http_status=`200`, error_code=``
- curl_cli_healthz: status=`ok`, http_status=`200`, error_code=``

## Summary

- ok_count: `5`
- failure_count: `0`
- timeout_count: `0`

