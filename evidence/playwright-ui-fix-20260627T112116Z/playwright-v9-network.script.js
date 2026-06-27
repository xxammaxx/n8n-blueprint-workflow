/**
 * Playwright v9: Comprehensive network monitoring + XHR interception
 * Strategy: Find exactly how n8n SPA loads workflow data, then intercept it
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const WORKFLOW_URL = 'http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function main() {
    let browser;
    try {
        log('Launching...');
        browser = await chromium.launch({
            headless: false,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
            args: ['--start-maximized'],
        });

        const context = await browser.newContext({ storageState: STORAGE_STATE });
        const page = await context.newPage();

        // --- Monitor ALL network requests ---
        const allRequests = [];
        page.on('request', req => {
            const url = req.url();
            if (url.includes('192.168.1.52') && !url.includes('.png') && !url.includes('.woff') && !url.includes('.css') && !url.includes('.js.map')) {
                allRequests.push({ 
                    type: 'request', 
                    url: url.replace('http://192.168.1.52:5678', ''), 
                    method: req.method(),
                    resourceType: req.resourceType(),
                });
            }
        });
        
        page.on('response', async resp => {
            const url = resp.url();
            if (url.includes('192.168.1.52') && !url.includes('.png') && !url.includes('.woff') && !url.includes('.css')) {
                try {
                    const ct = resp.headers()['content-type'] || '';
                    let body = null;
                    if (ct.includes('json')) {
                        body = await resp.json().catch(() => null);
                    } else if (url.includes('/rest/') || url.includes('/api/')) {
                        body = await resp.text().catch(() => null);
                        if (body && body.length > 500) body = body.slice(0, 500) + '...(truncated)';
                    }
                    
                    const entry = {
                        type: 'response',
                        url: url.replace('http://192.168.1.52:5678', ''),
                        status: resp.status(),
                        contentType: ct.slice(0, 100),
                    };
                    
                    if (body && typeof body === 'object' && (body.nodes || body.name)) {
                        entry.hasWorkflowData = true;
                        entry.workflowName = body.name;
                        entry.nodeCount = body.nodes?.length;
                    }
                    
                    allRequests.push(entry);
                } catch (e) {}
            }
        });

        // --- Navigate ---
        log('Navigating...');
        await page.goto(WORKFLOW_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);

        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            return { login: 'required' };
        }

        // --- Dump all captured requests ---
        log(`\n=== Network requests (${allRequests.length} total) ===`);
        allRequests.forEach((r, i) => {
            if (r.type === 'request') {
                log(`  REQ[${i}] ${r.method} ${r.url} (${r.resourceType})`);
            } else {
                log(`  RES[${i}] ${r.status} ${r.url} [${r.contentType}] ${r.hasWorkflowData ? '*** HAS WORKFLOW DATA ***' : ''}`);
            }
        });

        // --- Try XMLHttpRequest approach ---
        log('\n=== Trying XMLHttpRequest ===');
        const xhrResult = await page.evaluate(async () => {
            return new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', '/rest/workflows/Sv12QTo56NoPUu2D', true);
                xhr.withCredentials = true;
                xhr.onload = () => {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve({ status: xhr.status, name: data.name, nodeCount: data.nodes?.length });
                    } catch (e) {
                        resolve({ status: xhr.status, text: xhr.responseText.slice(0, 200) });
                    }
                };
                xhr.onerror = () => resolve({ error: 'network_error' });
                xhr.send();
            });
        });
        log(`XHR result: ${JSON.stringify(xhrResult)}`);

        // --- Try fetch with all credentials ---
        log('\n=== Trying fetch with different options ===');
        const fetchResults = await page.evaluate(async () => {
            const results = {};
            const url = '/rest/workflows/Sv12QTo56NoPUu2D';
            
            // Option 1: credentials include
            try {
                const r1 = await fetch(url, { credentials: 'include' });
                results.include = { status: r1.status, ok: r1.ok };
            } catch (e) { results.include = { error: e.message }; }
            
            // Option 2: credentials same-origin
            try {
                const r2 = await fetch(url, { credentials: 'same-origin' });
                results.sameOrigin = { status: r2.status, ok: r2.ok };
            } catch (e) { results.sameOrigin = { error: e.message }; }
            
            // Option 3: no credentials
            try {
                const r3 = await fetch(url);
                results.default_ = { status: r3.status, ok: r3.ok };
            } catch (e) { results.default_ = { error: e.message }; }
            
            return results;
        });
        log(`Fetch results: ${JSON.stringify(fetchResults)}`);

        // --- Try to find workflow data in page HTML ---
        log('\n=== Checking page HTML for embedded data ===');
        const htmlData = await page.evaluate(() => {
            // Check for __NEXT_DATA__ or similar
            const scripts = document.querySelectorAll('script[type="application/json"], script[id*="data"], script[id*="props"]');
            const results = [];
            scripts.forEach(s => {
                results.push({ id: s.id, type: s.type, text: s.textContent?.slice(0, 500) });
            });
            
            // Check all script tags
            const allScripts = document.querySelectorAll('script:not([src])');
            allScripts.forEach(s => {
                const text = s.textContent || '';
                if (text.includes('workflow') || text.includes('"name"') || text.includes('Sv12QTo56NoPUu2D')) {
                    results.push({ type: 'inline-script', hasWorkflowRef: true, preview: text.slice(0, 300) });
                }
            });
            
            return results;
        });
        log(`HTML scripts with data: ${JSON.stringify(htmlData, null, 2)}`);

        // --- Final: extract node names from DOM to confirm data IS loaded ---
        const nodeNames = await page.evaluate(() => {
            const nodes = document.querySelectorAll('.vue-flow__node');
            return Array.from(nodes).map(n => {
                const label = n.querySelector('._label_9txz0_177, .node-label')?.textContent?.trim();
                const dataId = n.getAttribute('data-id');
                return { dataId: dataId?.slice(0, 8), label };
            }).filter(x => x.label);
        });
        log(`\nCanvas nodes found: ${nodeNames.length}`);
        nodeNames.forEach(n => log(`  ${n.dataId}: ${n.label}`));

        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v9-network-dump.json'), JSON.stringify({
            allRequests,
            xhrResult,
            fetchResults,
            htmlData,
            nodeNames,
        }, null, 2));

        await new Promise(r => setTimeout(r, 5000));
        return { done: true, requestCount: allRequests.length };

    } catch (error) {
        log(`FATAL: ${error.message}`);
        return { error: error.message };
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

main().then(r => log('Done.'));
