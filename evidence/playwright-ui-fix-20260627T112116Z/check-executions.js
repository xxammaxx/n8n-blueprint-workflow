/**
 * Quick Playwright script: Check n8n execution history for schedule trigger
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const BASE_URL = 'http://192.168.1.52:5678';
const WORKFLOW_ID = 'Sv12QTo56NoPUu2D';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function main() {
    let browser;
    try {
        browser = await chromium.launch({
            headless: true,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
        });
        const context = await browser.newContext({ storageState: STORAGE_STATE });
        const page = await context.newPage();

        // Navigate to establish session
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));

        // Get recent executions for the workflow
        const execResult = await page.evaluate(async (wfId) => {
            try {
                const resp = await fetch(`/rest/executions?workflowId=${wfId}&limit=5`);
                const text = await resp.text();
                return JSON.parse(text);
            } catch (e) {
                return { error: e.message };
            }
        }, WORKFLOW_ID);

        log(`Executions response: ${JSON.stringify(execResult, null, 2).slice(0, 5000)}`);

        // If data wrapper
        const executions = execResult.data || execResult;
        if (Array.isArray(executions)) {
            log(`\nFound ${executions.length} recent executions:`);
            executions.forEach((exec, i) => {
                log(`\nExecution #${i}:`);
                log(`  ID: ${exec.id}`);
                log(`  Status: ${exec.status}`);
                log(`  Mode: ${exec.mode}`);
                log(`  Started: ${exec.startedAt}`);
                log(`  Stopped: ${exec.stoppedAt}`);
                log(`  WaitTill: ${exec.waitTill}`);
            });
        } else if (executions?.results) {
            log(`\nFound ${executions.results.length} executions:`);
            executions.results.forEach((exec, i) => {
                log(`\nExecution #${i}:`);
                log(`  ID: ${exec.id}`);
                log(`  Status: ${exec.status}`);
                log(`  Mode: ${exec.mode}`);
                log(`  Started: ${exec.startedAt}`);
                log(`  Stopped: ${exec.stoppedAt}`);
            });
        }

        await browser.close();
        return executions;
    } catch (e) {
        log(`Error: ${e.message}`);
        if (browser) await browser.close().catch(() => {});
    }
}

main().then(() => process.exit(0));
