/**
 * Playwright v10: Intercept SPA's workflow fetch and replicate auth
 * Strategy: Capture the SPA's request headers, then replicate them
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const BASE_URL = 'http://192.168.1.52:5678';
const WORKFLOW_URL = `${BASE_URL}/workflow/Sv12QTo56NoPUu2D`;
const WORKFLOW_ID = 'Sv12QTo56NoPUu2D';
const NODE_NAME = 'Format Final Result';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function redact(s) {
    return (s || '').replace(/(password|secret|token|apiKey|api_key)\s*[:=]\s*["'][^"']{3,}["']/gi, '$1: "[REDACTED]"');
}

async function main() {
    let browser;
    const evidence = { timestamp: new Date().toISOString(), steps: [] };

    try {
        log('Launching browser...');
        browser = await chromium.launch({
            headless: false,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
            args: ['--start-maximized'],
        });

        const context = await browser.newContext({ storageState: STORAGE_STATE });
        const page = await context.newPage();

        // --- Intercept ALL workflow requests to capture headers and responses ---
        let capturedHeaders = null;
        let capturedWorkflow = null;
        let capturedCookies = null;

        page.on('request', req => {
            if (req.url().includes(`/rest/workflows/${WORKFLOW_ID}`)) {
                const headers = req.headers();
                log(`=== CAPTURED REQUEST HEADERS for workflow GET ===`);
                log(`URL: ${req.url()}`);
                log(`Method: ${req.method()}`);
                for (const [k, v] of Object.entries(headers)) {
                    if (k.toLowerCase().includes('cookie') || k.toLowerCase().includes('auth') || k.toLowerCase().includes('token') || k.toLowerCase().includes('key')) {
                        log(`  ${k}: [REDACTED - ${v.length} chars]`);
                    } else {
                        log(`  ${k}: ${v}`);
                    }
                }
                capturedHeaders = { method: req.method(), url: req.url(), headers };
            }
        });

        page.on('response', async (resp) => {
            // Only capture the EXACT workflow GET, not sub-paths
            const url = resp.url();
            const exactUrl = `${BASE_URL}/rest/workflows/${WORKFLOW_ID}`;
            const isExactMatch = url === exactUrl || url === exactUrl + '/';
            
            if (isExactMatch && resp.status() === 200 && !capturedWorkflow) {
                log(`=== CAPTURED WORKFLOW RESPONSE (exact) ===`);
                log(`URL: ${url}`);
                log(`Status: ${resp.status()}`);
                try {
                    const text = await resp.text();
                    log(`Response text length: ${text.length}`);
                    log(`First 200 chars: ${text.slice(0, 200)}`);
                    
                    const body = JSON.parse(text);
                    // n8n wraps responses in {data: {...}}
                    capturedWorkflow = body.data || body;
                    log(`Response has data wrapper: ${!!body.data}`);
                    log(`Workflow name: ${capturedWorkflow.name}`);
                    log(`Node count: ${capturedWorkflow.nodes?.length}`);
                    
                    // Find our target node
                    const node = capturedWorkflow.nodes?.find(n => n.name === NODE_NAME);
                    if (node) {
                        log(`Target node found: type=${node.type}`);
                        log(`Parameters keys: ${Object.keys(node.parameters || {}).join(', ')}`);
                        
                        if (node.parameters?.jsCode) {
                            log(`jsCode (${node.parameters.jsCode.length} chars):`);
                            log(node.parameters.jsCode.slice(0, 800));
                        }
                    }
                } catch (e) {
                    log(`Error parsing workflow response: ${e.message}`);
                }
            }
        });

        // Also capture cookies
        page.on('request', req => {
            if (req.url().includes('/rest/') && !capturedCookies) {
                // Get cookies via CDP
            }
        });

        // --- Navigate to the workflow page ---
        log('\n=== Navigating to workflow page ===');
        await page.goto(WORKFLOW_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000);

        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            return { login: 'required' };
        }

        // --- Now try to replicate the SPA's request ---
        log('\n=== Trying to replicate SPA request ===');
        
        if (!capturedWorkflow) {
            log('Workflow data not captured from SPA request. Trying to use captured headers...');
        }

        // Get cookies
        const cookies = await context.cookies();
        log(`Browser cookies: ${cookies.length}`);
        const n8nCookies = cookies.filter(c => c.domain.includes('192.168.1.52'));
        log(`n8n cookies: ${n8nCookies.length}`);
        n8nCookies.forEach(c => log(`  ${c.name}=[REDACTED] (domain: ${c.domain}, path: ${c.path})`));

        // Try the fetch with the SPA-like headers
        // The SPA might be using a session cookie that's different from what we have
        // Or it might use a push connection / WebSocket auth
        
        // Get CSRF token from the page
        const csrfToken = await page.evaluate(() => {
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta) return meta.getAttribute('content');
            // Check for n8n CSRF
            const n8nMeta = document.querySelector('meta[name="_csrf"]');
            if (n8nMeta) return n8nMeta.getAttribute('content');
            return null;
        });
        log(`CSRF token: ${csrfToken || 'not found'}`);

        // --- If we have the workflow data from network interception ---
        if (capturedWorkflow) {
            log('\n=== WORKFLOW DATA CAPTURED SUCCESSFULLY ===');
            
            const targetNode = capturedWorkflow.nodes?.find(n => n.name === NODE_NAME);
            if (!targetNode) {
                log(`Node "${NODE_NAME}" not found!`);
                evidence.steps.push({ step: 'find_node', result: 'not_found' });
            } else {
                // Extract code
                let codeField = null;
                let codeContent = '';
                
                if (targetNode.parameters?.jsCode !== undefined) {
                    codeField = 'parameters.jsCode';
                    codeContent = targetNode.parameters.jsCode;
                } else if (targetNode.parameters?.code !== undefined) {
                    codeField = 'parameters.code';
                    codeContent = targetNode.parameters.code;
                }
                
                if (codeContent && codeContent.length > 10) {
                    log(`\n=== CODE CONTENT (${codeContent.length} chars) ===`);
                    
                    // Save before
                    fs.writeFileSync(path.join(EVIDENCE_DIR, 'code-before.md'),
                        `# Code Before\n\n\`\`\`javascript\n${redact(codeContent)}\n\`\`\``);
                    evidence.code_before = redact(codeContent).slice(0, 2000);
                    
                    // Apply fix
                    const lines = codeContent.split('\n');
                    let fixed = false;
                    for (let i = 0; i < lines.length; i++) {
                        const trimmed = lines[i].trim();
                        if (/^=+$/.test(trimmed) && !trimmed.startsWith('//')) {
                            log(`Found uncommented at line ${i}: "${trimmed}"`);
                            lines[i] = lines[i].replace(/^(\s*)(=+)/, '$1// $2');
                            log(`Fixed to: "${lines[i]}"`);
                            fixed = true;
                            break;
                        }
                    }
                    
                    if (!fixed) {
                        // Check variant patterns
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].trim().startsWith('=') && !lines[i].trim().startsWith('//') && lines[i].trim().length > 3) {
                                log(`Found variant at line ${i}: "${lines[i]}"`);
                                lines[i] = '// ' + lines[i].trimStart();
                                fixed = true;
                                break;
                            }
                        }
                    }
                    
                    if (fixed) {
                        const fixedCode = lines.join('\n');
                        fs.writeFileSync(path.join(EVIDENCE_DIR, 'code-after.md'),
                            `# Code After\n\n\`\`\`javascript\n${redact(fixedCode)}\n\`\`\``);
                        
                        // Update the node in the captured workflow
                        const keys = codeField.split('.');
                        let obj = targetNode;
                        for (let i = 1; i < keys.length - 1; i++) obj = obj[keys[i]];
                        obj[keys[keys.length - 1]] = fixedCode;
                        
                        evidence.fix_applied = true;
                        log('Fix applied to captured workflow data.');
                        
                        // Now try to PUT the workflow back - wrap in {data:...} like n8n expects
                        log('\n=== Attempting to save via PUT ===');
                        
                        // n8n API expects {data: workflow} or just the workflow
                        // Try both formats
                        const putPayloads = [
                            { data: capturedWorkflow },  // wrapped format
                            capturedWorkflow,             // unwrapped format
                        ];
                        
                        let saveSuccess = false;
                        for (const payload of putPayloads) {
                            const saveResult = await page.evaluate(async (p) => {
                                try {
                                    const resp = await fetch(`/rest/workflows/${p.data ? p.data.id : p.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(p),
                                    });
                                    const text = await resp.text();
                                    let data;
                                    try { data = JSON.parse(text); } catch { data = text; }
                                    return { status: resp.status, ok: resp.ok, data };
                                } catch (e) {
                                    return { error: e.message };
                                }
                            }, payload);
                            
                            log(`PUT save (${payload.data ? 'wrapped' : 'unwrapped'}): status=${saveResult.status} ok=${saveResult.ok}`);
                            if (saveResult.ok) {
                                saveSuccess = true;
                                evidence.save_result = 'success';
                                evidence.save_format = payload.data ? 'wrapped' : 'unwrapped';
                                break;
                            }
                        }
                        
                        if (saveSuccess) {
                            log('*** FIX SAVED SUCCESSFULLY via PUT ***');
                        } else {
                            log('PUT failed. Trying PATCH...');
                            const patchResult = await page.evaluate(async (wf) => {
                                try {
                                    const resp = await fetch(`/rest/workflows/${wf.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ data: wf }),
                                    });
                                    return { status: resp.status, ok: resp.ok };
                                } catch (e) {
                                    return { error: e.message };
                                }
                            }, capturedWorkflow);
                            log(`PATCH: ${JSON.stringify(patchResult)}`);
                            if (patchResult.ok) {
                                saveSuccess = true;
                                evidence.save_result = 'success_patch';
                            }
                        }
                        
                        if (!saveSuccess) {
                            evidence.save_result = 'failed';
                        }
                    } else {
                        log('No fix needed - code already has proper comments.');
                        evidence.fix_needed = false;
                    }
                } else {
                    log('No code content found in node parameters.');
                    log(`All parameters: ${JSON.stringify(targetNode.parameters, null, 2)}`);
                }
            }
        } else {
            log('Workflow data not captured from network interception.');
            evidence.steps.push({ step: 'capture', result: 'no_data' });
        }

        // Save evidence
        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v10-results.json'), JSON.stringify(evidence, null, 2));
        log('Script complete.');
        
        await new Promise(r => setTimeout(r, 10000));
        return evidence;

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        return { error: error.message };
    }
}

main().then(r => log('Done.'));
