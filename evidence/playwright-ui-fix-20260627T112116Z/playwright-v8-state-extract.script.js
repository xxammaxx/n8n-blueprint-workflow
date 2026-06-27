/**
 * Playwright v8: Extract workflow data from SPA's JavaScript state
 * Strategy: The SPA already loaded the workflow data - find it in memory
 * Then fix the comment and submit changes through the SPA's internal mechanisms
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const WORKFLOW_URL = 'http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D';
const NODE_NAME = 'Format Final Result';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function redact(s) {
    return (s || '').replace(/(password|secret|token|apiKey|api_key)\s*[:=]\s*["'][^"']{3,}["']/gi, '$1: "[REDACTED]"');
}

async function main() {
    let browser;
    try {
        log('Launching browser...');
        browser = await chromium.launch({
            headless: false,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
            args: ['--start-maximized'],
        });

        const context = await browser.newContext({
            storageState: STORAGE_STATE,
        });
        const page = await context.newPage();

        // Intercept network to find workflow data
        let workflowDataFromNetwork = null;
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('/workflows/') || url.includes('/workflow')) {
                try {
                    const ct = response.headers()['content-type'] || '';
                    if (ct.includes('json')) {
                        const body = await response.json();
                        if (body && (body.nodes || body.name)) {
                            workflowDataFromNetwork = body;
                            log(`Network: caught workflow data from ${url}`);
                        }
                    }
                } catch (e) {}
            }
        });

        // --- Navigate ---
        log(`Navigating to: ${WORKFLOW_URL}`);
        await page.goto(WORKFLOW_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(4000);

        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            return { login: 'required' };
        }

        // --- Step 1: Try to find workflow data in JS state ---
        log('\n=== Searching for workflow data in JS state ===');
        
        const stateSearch = await page.evaluate(() => {
            const results = {};

            // Method 1: Pinia stores
            const app = document.getElementById('app')?.__vue_app__;
            if (app) {
                const pinia = app.config?.globalProperties?.$pinia;
                if (pinia?._s) {
                    for (const [key, store] of Object.entries(pinia._s)) {
                        const state = store.$state || {};
                        // Check if this store has workflow data
                        if (state.workflow || state.workflowData || state.workflows) {
                            const wf = state.workflow || state.workflowData;
                            results.piniaStore = key;
                            if (wf) {
                                results.workflowName = wf.name;
                                results.nodeCount = wf.nodes?.length;
                                results.hasTargetNode = wf.nodes?.some(n => n.name === 'Format Final Result');
                            }
                        }
                        // Check state keys
                        const stateKeys = Object.keys(state);
                        if (stateKeys.some(k => k.toLowerCase().includes('workflow') || k.toLowerCase().includes('node'))) {
                            if (!results.piniaStore) results.piniaStore = key;
                            results.piniaStateKeys = stateKeys;
                        }
                    }
                }
            }

            // Method 2: Vue component instances
            const allElements = document.querySelectorAll('[data-v-]');
            for (const el of allElements) {
                const instance = el.__vueParentComponent;
                if (instance) {
                    const props = instance.props || {};
                    const setupState = instance.setupState || {};
                    // Look for workflow-related props/state
                    const allKeys = [...Object.keys(props), ...Object.keys(setupState)];
                    if (!results.componentWorkflowKeys && allKeys.some(k => k.toLowerCase().includes('workflow'))) {
                        results.componentProps = allKeys.filter(k => k.toLowerCase().includes('workflow') || k.toLowerCase().includes('node'));
                    }
                }
            }

            // Method 3: window variables
            if (window.workflow) results.window_workflow = typeof window.workflow;
            if (window.workflowData) results.window_workflowData = typeof window.workflowData;
            if (window.__n8n) results.window_n8n = Object.keys(window.__n8n || {});
            
            // Method 4: Look in all global objects
            const globals = Object.keys(window).filter(k => 
                k.toLowerCase().includes('workflow') || 
                k.toLowerCase().includes('n8n') ||
                k.toLowerCase().includes('store')
            );
            results.relevantGlobals = globals;

            return results;
        });
        
        log(`State search: ${JSON.stringify(stateSearch, null, 2)}`);

        // --- Step 2: Try to find workflow in Pinia stores more deeply ---
        const piniaDeep = await page.evaluate(() => {
            const app = document.getElementById('app')?.__vue_app__;
            if (!app) return { error: 'no_vue_app' };
            
            const pinia = app.config?.globalProperties?.$pinia;
            if (!pinia?._s) return { error: 'no_pinia' };
            
            const stores = {};
            for (const [key, store] of Object.entries(pinia._s)) {
                const state = {};
                // Safely extract state
                try {
                    const rawState = store.$state || {};
                    for (const [sk, sv] of Object.entries(rawState)) {
                        if (typeof sv === 'object' && sv !== null) {
                            if (Array.isArray(sv)) {
                                state[sk] = `Array(${sv.length})`;
                            } else if (sv.name && sv.nodes) {
                                state[sk] = `Workflow(name="${sv.name}", nodes=${sv.nodes?.length || 0})`;
                            } else {
                                state[sk] = `Object{${Object.keys(sv).join(',')}}`;
                            }
                        } else {
                            state[sk] = typeof sv === 'string' ? sv.slice(0, 80) : sv;
                        }
                    }
                } catch (e) {
                    state._error = e.message;
                }
                stores[key] = state;
            }
            return stores;
        });
        
        log(`Pinia stores: ${JSON.stringify(piniaDeep, null, 2)}`);

        // --- Step 3: Try network-caught data ---
        log(`\nNetwork-caught workflow: ${workflowDataFromNetwork ? workflowDataFromNetwork.name : 'none'}`);

        // --- Step 4: Search for node code in all available data ---
        let nodeCode = null;
        let codeField = null;

        if (workflowDataFromNetwork) {
            const targetNode = workflowDataFromNetwork.nodes?.find(n => n.name === NODE_NAME);
            if (targetNode) {
                log(`Found target node in network data: type=${targetNode.type}`);
                if (targetNode.parameters?.jsCode) {
                    nodeCode = targetNode.parameters.jsCode;
                    codeField = 'parameters.jsCode';
                } else if (targetNode.parameters?.code) {
                    nodeCode = targetNode.parameters.code;
                    codeField = 'parameters.code';
                }
                log(`Node code (${nodeCode?.length || 0} chars): ${(nodeCode || '').slice(0, 500)}`);
            }
        }

        // --- Step 5: If found, apply fix via direct API call ---
        if (nodeCode && nodeCode.length > 10) {
            log('\n=== Applying fix ===');
            
            // Save before
            fs.writeFileSync(path.join(EVIDENCE_DIR, 'code-before.md'), 
                `# Code Before\n\n\`\`\`javascript\n${redact(nodeCode)}\n\`\`\``);

            const lines = nodeCode.split('\n');
            let fixed = false;
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (/^=+$/.test(trimmed) && !trimmed.startsWith('//')) {
                    log(`Found uncommented separator at line ${i}: "${trimmed}"`);
                    lines[i] = lines[i].replace(/^(\s*)(=+)/, '$1// $2');
                    log(`Fixed to: "${lines[i]}"`);
                    fixed = true;
                    break;
                }
            }

            if (fixed) {
                const fixedCode = lines.join('\n');
                fs.writeFileSync(path.join(EVIDENCE_DIR, 'code-after.md'),
                    `# Code After\n\n\`\`\`javascript\n${redact(fixedCode)}\n\`\`\``);

                // Update the node in the workflow data
                const targetNode = workflowDataFromNetwork.nodes.find(n => n.name === NODE_NAME);
                const keys = codeField.split('.');
                let obj = targetNode;
                for (let i = 1; i < keys.length - 1; i++) obj = obj[keys[i]];
                obj[keys[keys.length - 1]] = fixedCode;

                // Try to save via the n8n internal API
                log('Attempting to save via internal API...');
                
                // n8n might have internal endpoints
                const saveResult = await page.evaluate(async (wf) => {
                    try {
                        // Try the rest API with credentials include
                        const resp = await fetch('/rest/workflows/Sv12QTo56NoPUu2D', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify(wf),
                        });
                        const data = await resp.text();
                        return { status: resp.status, ok: resp.ok, data: data.slice(0, 500) };
                    } catch (e) {
                        return { error: e.message };
                    }
                }, workflowDataFromNetwork);
                
                log(`Save result: ${JSON.stringify(saveResult)}`);
                
                if (saveResult.ok) {
                    log('FIX APPLIED SUCCESSFULLY via REST API!');
                } else {
                    log('REST API approach failed. Trying alternative...');
                    
                    // Try via form-encoded or internal SPA endpoint
                    const altResult = await page.evaluate(async (wf) => {
                        try {
                            // n8n SPA sometimes uses a different endpoint
                            const resp = await fetch(`/rest/workflows/${wf.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(wf),
                            });
                            return { status: resp.status, ok: resp.ok };
                        } catch (e) {
                            return { error: e.message };
                        }
                    }, workflowDataFromNetwork);
                    
                    log(`PATCH result: ${JSON.stringify(altResult)}`);
                }
            }
        } else {
            log('No node code found in network data either.');
            log('This might be a different type of node (Set node?)');
            
            if (workflowDataFromNetwork) {
                const targetNode = workflowDataFromNetwork.nodes?.find(n => n.name === NODE_NAME);
                if (targetNode) {
                    log(`Node type: ${targetNode.type}`);
                    log(`Parameters: ${JSON.stringify(targetNode.parameters, null, 2).slice(0, 1000)}`);
                }
            }
        }

        // Save evidence
        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v8-results.json'), JSON.stringify({
            timestamp: new Date().toISOString(),
            stateSearch,
            piniaDeep,
            hasNetworkData: !!workflowDataFromNetwork,
            nodeCodeFound: !!nodeCode,
            nodeCodeLength: nodeCode?.length || 0,
        }, null, 2));

        await new Promise(r => setTimeout(r, 10000));
        return { done: true };

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        return { error: error.message };
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

main().then(r => log('Done.'));
