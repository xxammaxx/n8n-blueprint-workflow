// Phase 4: Dispatcher Workflow UI Smoke (read-only)
// After login, navigate to workflow and inspect it visually
import pw from '/home/xxammaxx/.nvm/versions/node/v22.22.0/lib/node_modules/playwright-cli/node_modules/playwright/index.js';
const { chromium } = pw;
import { writeFileSync } from 'fs';

const OUTPUT = '/home/xxammaxx/Spec-kit_n8n/evidence/dispatcher-ui-smoke-after-login-20260702T213341Z/dispatcher-workflow-ui-smoke.json';
const WORKFLOW_ID = 'Sv12QTo56NoPUu2D';
const MAX_WAIT_MS = 300_000; // 5 minutes

console.log('=== Phase 4: Dispatcher Workflow UI Smoke ===');
console.log('Starting Chromium in headful mode...');

const browser = await chromium.launch({ 
  headless: false,
  executablePath: '/usr/bin/google-chrome'
});
const context = await browser.newContext();
const page = await context.newPage();

// Step 1: Go to n8n
await page.goto('http://192.168.1.52:5678', {
  waitUntil: 'domcontentloaded',
  timeout: 30000
});

console.log('');
console.log('Browser geöffnet. Prüfe Login-Status...');

// Step 2: Check if already logged in or need login
let loggedIn = false;
const startTime = Date.now();
let pollCount = 0;
let needsReLogin = false;

while (!loggedIn && (Date.now() - startTime) < MAX_WAIT_MS) {
  await new Promise(r => setTimeout(r, 2000));
  pollCount++;

  try {
    const url = page.url();
    const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');

    const hasLogin = /sign in|login|email|password|anmelden/i.test(bodyText);
    const hasDashboard = /workflow|executions|credentials|templates|ausführungen/i.test(bodyText);

    loggedIn = !hasLogin && hasDashboard && bodyText.length > 100;

    if (pollCount === 1) {
      needsReLogin = hasLogin;
      if (!hasLogin && hasDashboard) {
        console.log('Bereits eingeloggt!');
      } else {
        console.log('Login erforderlich. Bitte manuell einloggen...');
      }
    }

    if (pollCount <= 3 || loggedIn || pollCount % 15 === 0) {
      console.log(`Poll #${pollCount}: url=${url.substring(0, 80)}, hasLogin=${hasLogin}, hasDashboard=${hasDashboard}, loggedIn=${loggedIn}`);
    }
  } catch (e) {
    console.log(`Poll #${pollCount}: error=${e.message}`);
  }
}

if (!loggedIn) {
  console.log('TIMEOUT: Login nicht erkannt innerhalb von 5 Minuten.');
  const result = {
    timestamp: new Date().toISOString(),
    phase: 'dispatcher-workflow-ui-smoke',
    status: 'N8N_UI_LOGIN_REQUIRED',
    loginDetected: false,
    pollCount
  };
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
  await browser.close();
  process.exit(0);
}

console.log('');
console.log('Login bestätigt. Navigiere zum Dispatcher Workflow...');

// Step 3: Navigate to dispatcher workflow
await page.goto(`http://192.168.1.52:5678/workflow/${WORKFLOW_ID}`, {
  waitUntil: 'domcontentloaded',
  timeout: 15000
});

// Wait for workflow canvas to load
await page.waitForTimeout(3000);

const wfTitle = await page.title().catch(() => 'ERROR');
const wfUrl = page.url();

console.log(`Workflow URL: ${wfUrl}`);
console.log(`Page Title: ${wfTitle}`);

// Step 4: Read-only inspection
const findings = {};

// Check page body text for workflow indicators
const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'TIMEOUT');
findings.bodyTextLength = bodyText.length;
findings.bodyTextPreview = bodyText ? bodyText.substring(0, 800) : 'EMPTY';

// Check for active/published
const activeKeywords = /active|aktiv|published|veröffentlicht|produktion/i;
findings.hasActiveText = activeKeywords.test(bodyText);

// Check for unsaved/dirty state
const dirtyKeywords = /unsaved|ungespeichert|changes not saved|änderungen/i;
findings.hasDirtyState = dirtyKeywords.test(bodyText);

// Check for error banners
const errorKeywords = /error|fehler|warning|warnung|danger|kritisch|failed|fehlgeschlagen/i;
findings.hasErrorText = errorKeywords.test(bodyText);

// Check for workflow name "Dispatcher"
findings.hasDispatcherName = /dispatcher|dispatch/i.test(bodyText);

// Try to count nodes via CSS selectors (n8n uses various node selectors)
try {
  const nodeCount = await page.locator('.vue-flow__node, [data-test-id="canvas-node"], .node-wrapper, [class*="node"]').count();
  findings.nodeCount = nodeCount;
} catch (e) {
  findings.nodeCount = 'ERROR: ' + e.message;
}

// Check for schedule trigger indicators
findings.hasScheduleTrigger = /schedule|zeitplan|timer|cron|interval/i.test(bodyText);

// Check for manual trigger
findings.hasManualTrigger = /manual|manuell|trigger|webhook/i.test(bodyText);

// Check for canvas visibility
try {
  const canvasVisible = await page.locator('.vue-flow, [data-test-id="canvas"], .workflow-canvas, svg').count();
  findings.canvasElementsCount = canvasVisible;
} catch (e) {
  findings.canvasElementsCount = 'ERROR: ' + e.message;
}

// Check for the workflow ID in the URL
findings.urlContainsWorkflowId = wfUrl.includes(WORKFLOW_ID);

// Determine status
let status;
if (!findings.urlContainsWorkflowId) {
  status = 'DISPATCHER_WORKFLOW_NOT_FOUND_IN_UI';
} else if (findings.hasErrorText && !findings.hasActiveText && !findings.hasDispatcherName) {
  status = 'DISPATCHER_WORKFLOW_NOT_FOUND_IN_UI';
} else if (findings.hasDirtyState) {
  status = 'DISPATCHER_UI_SMOKE_GREEN'; // green but with note
} else {
  status = 'DISPATCHER_UI_SMOKE_GREEN';
}

const result = {
  timestamp: new Date().toISOString(),
  phase: 'dispatcher-workflow-ui-smoke',
  status,
  loginDetected: true,
  workflowId: WORKFLOW_ID,
  wfTitle,
  wfUrl,
  needsReLogin,
  findings
};

console.log('');
console.log('=== RESULT ===');
console.log(JSON.stringify(result, null, 2));

writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
console.log(`Result saved to: ${OUTPUT}`);

// Keep browser open briefly for user to see
console.log('Browser bleibt 3 Sekunden offen zur visuellen Bestätigung...');
await page.waitForTimeout(3000);

await browser.close();
console.log('Browser geschlossen.');
