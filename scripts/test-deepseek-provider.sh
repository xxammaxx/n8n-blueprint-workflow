#!/usr/bin/env bash
set -euo pipefail

# Source the secret file
source /opt/dev-fabric/secrets/opencode-provider.env 2>/dev/null

# Export DEEPSEEK_API_KEY for built-in provider
export DEEPSEEK_API_KEY="${OPENCODE_API_KEY}"

echo "=== Testing DeepSeek Built-in Provider ==="
echo "DEEPSEEK_API_KEY present: $(if [[ -n "${DEEPSEEK_API_KEY:-}" ]]; then echo yes; else echo no; fi)"
echo ""

# Test model list
echo "--- opencode models deepseek ---"
/opt/dev-fabric/opencode/opencode models deepseek 2>&1 || true
echo ""

# Test with run
echo "--- opencode run --model deepseek/deepseek-v4-pro ---"
echo "Hello" | timeout 30 /opt/dev-fabric/opencode/opencode run \
  --model deepseek/deepseek-v4-pro \
  --dangerously-skip-permissions \
  "Say only the word OK and nothing else." 2>&1 || true
echo ""
echo "=== Test Complete ==="
