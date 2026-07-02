// Phase 3: Manual Login Gate – Smart polling version
// Detects login success by watching URL/DOM changes
import pw from '/home/xxammaxx/.nvm/versions/node/v22.22.0/lib/node_modules/playwright-cli/node_modules/playwright/index.js';
const { chromium } = pw;
import { writeFileSync } from 'fs';

const OUTPUT = '/home/xxammaxx/Spec-kit_n8n/evidence/dispatcher-ui-smoke-after-login-20260702T213341Z/manual-login-gate-result.json';
const MAX_WAIT_MS = 300_000; // 5 minutes

console.log('=== Phase 3: Manual Login Gate (Smart Polling) ===');
console.log('Starting Chromium in headful mode...');

const browser = await chromium.launch({ 
  headless: false,
  executablePath: '/usr/bin/google-chrome'
});
const context = await browser.newContext();
const page = await context.newPage();

await page.goto('http://192.168.1.52:5678', {
  waitUntil: 'domcontentloaded',
  timeout: 30000
});

console.log('');
console.log('========================================');
console.log('Browser geöffnet. Bitte manuell in n8n einloggen.');
console.log('Das Skript erkennt den Login automatisch.');
console.log('Warte maximal 5 Minuten...');
console.log('========================================');
console.log('');

const startTime = Date.now();
let loggedIn = false;
let pollCount = 0;

while (!loggedIn && (Date.now() - startTime) < MAX_WAIT_MS) {
  await new Promise(r => setTimeout(r, 2000)); // poll every 2 seconds
  pollCount++;

  try {
    const url = page.url();
    const title = await page.title().catch(() => '');
    const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');

    const hasLogin = /sign in|login|email|password|anmelden/i.test(bodyText);
    const hasDashboard = /workflow|executions|credentials|templates|ausführungen/i.test(bodyText);

    // Login detected if we're no longer on a login page AND see dashboard content
    loggedIn = !hasLogin && hasDashboard && bodyText.length > 100;

    if (pollCount <= 3 || loggedIn || pollCount % 15 === 0) {
      console.log(`Poll #${pollCount}: url=${url.substring(0, 80)}, hasLogin=${hasLogin}, hasDashboard=${hasDashboard}, loggedIn=${loggedIn}`);
    }
  } catch (e) {
    console.log(`Poll #${pollCount}: error=${e.message}`);
  }
}

const title = await page.title().catch(() => 'ERROR');
const url = page.url();
const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => 'TIMEOUT');

const hasLoginText = /sign in|login|email|password|anmelden/i.test(bodyText);
const hasDashboardText = /workflow|executions|credentials|templates|ausführungen/i.test(bodyText);
const hasWorkflowText = /workflow/i.test(bodyText);

const result = {
  timestamp: new Date().toISOString(),
  phase: 'manual-login-gate',
  loggedIn,
  pollCount,
  waitSeconds: Math.round((Date.now() - startTime) / 1000),
  title,
  url,
  hasLoginText,
  hasDashboardText,
  hasWorkflowText
};

console.log('');
console.log('=== RESULT ===');
console.log(JSON.stringify(result, null, 2));

writeFileSync(OUTPUT, JSON.stringify(result, null, 2));
console.log(`Result saved to: ${OUTPUT}`);

await browser.close();
console.log('Browser geschlossen.');
