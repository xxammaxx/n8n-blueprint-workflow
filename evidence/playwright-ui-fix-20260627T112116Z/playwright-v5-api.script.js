/**
 * Playwright Script v5: n8n REST API approach via authenticated browser
 * Strategy: Use the browser's auth cookies to call n8n REST API
 * GET workflow -> fix node code -> PUT workflow back
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const BASE_URL = 'http://192.168.1.52:5678';
const WORKFLOW_ID = 'Sv12QTo56NoPUu2D';
const NODE_NAME = 'Format Final Result';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function apiCall(page, method, endpoint, body = null) {
    const result = await page.evaluate(async ({ method, endpoint, body }) => {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            };
            if (body) options.body = JSON.stringify(body);
            
            const response = await fetch(endpoint, options);
            const text = await response.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }
            
            return {
                status: response.status,
                ok: response.ok,
                data,
            };
        } catch (err) {
            return { status: 0, ok: false, error: err.message };
        }
    }, { method, endpoint, body });
    
    return result;
}

function redactSecrets(code) {
    return code
        .replace(/("(password|secret|token|key|api_key|apiKey)"\s*:\s*)"[^"]*"/gi, '$1"[REDACTED]"')
        .replace(/('(password|secret|token|key|api_key|apiKey)'\s*:\s*)'[^']*'/gi, '$1\'[REDACTED]\'')
        .replace(/(password|secret|token|api_key|apikey)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED]"')
        .replace(/Bearer\s+[A-Za-z0-9._\-]+/g, 'Bearer [REDACTED]');
}

async function main() {
    let browser;
    const evidence = {
        timestamp: new Date().toISOString(),
        approach: 'playwright-authenticated-rest-api',
        steps: [],
    };

    try {
        log('Launching browser...');
        browser = await chromium.launch({
            headless: true, // Can be headless for API calls
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
        });

        const context = await browser.newContext({
            storageState: STORAGE_STATE,
        });
        const page = await context.newPage();

        // --- Step 1: Navigate to n8n to establish session ---
        log('Opening n8n to establish auth session...');
        await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        if (page.url().includes('/signin')) {
            log('SESSION EXPIRED - login required');
            evidence.steps.push({ step: 'auth', result: 'session_expired' });
            fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
            return evidence;
        }
        
        log(`Session established. Current URL: ${page.url()}`);
        evidence.steps.push({ step: 'auth', result: 'success', url: page.url() });

        // --- Step 2: GET the workflow ---
        log(`Fetching workflow: GET /rest/workflows/${WORKFLOW_ID}`);
        const getResult = await apiCall(page, 'GET', `${BASE_URL}/rest/workflows/${WORKFLOW_ID}`);
        log(`GET status: ${getResult.status} ${getResult.ok ? 'OK' : 'FAILED'}`);

        if (!getResult.ok) {
            log(`GET failed: ${JSON.stringify(getResult.data).slice(0, 500)}`);
            evidence.steps.push({ step: 'get_workflow', result: 'failed', status: getResult.status, error: String(getResult.data).slice(0, 200) });
            
            // Try the full URL from settings
            const settingsResult = await apiCall(page, 'GET', `${BASE_URL}/rest/settings`);
            log(`Settings: ${settingsResult.status}`);
            
            // Try alternate endpoint
            const altResult = await apiCall(page, 'GET', `${BASE_URL}/rest/workflows?filter={"id":"${WORKFLOW_ID}"}`);
            log(`Alt GET: ${altResult.status}`);
            if (altResult.ok) {
                evidence.steps.push({ step: 'get_workflow_alt', result: 'success' });
                // Continue with alt result...
            }
            
            fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
            return evidence;
        }

        const workflow = getResult.data;
        evidence.steps.push({ 
            step: 'get_workflow', 
            result: 'success', 
            workflowName: workflow.name,
            nodeCount: workflow.nodes?.length || 0,
        });
        log(`Workflow: "${workflow.name}" with ${workflow.nodes?.length || 0} nodes`);

        // --- Step 3: Find the "Format Final Result" node ---
        const targetNode = workflow.nodes?.find(n => n.name === NODE_NAME);
        
        if (!targetNode) {
            log(`Node "${NODE_NAME}" not found! Available nodes:`);
            if (workflow.nodes) {
                workflow.nodes.forEach(n => log(`  - ${n.name} (${n.type})`));
            }
            evidence.steps.push({ step: 'find_node', result: 'not_found' });
            fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
            return evidence;
        }

        log(`Found node: "${targetNode.name}" (type: ${targetNode.type}, id: ${targetNode.id})`);
        evidence.steps.push({ step: 'find_node', result: 'found', nodeType: targetNode.type, nodeId: targetNode.id });

        // --- Step 4: Extract the code ---
        // n8n Code node: code is in parameters.jsCode
        // n8n Set node: values are in parameters.values
        let codeField = null;
        let codeContent = '';

        if (targetNode.parameters?.jsCode !== undefined) {
            codeField = 'parameters.jsCode';
            codeContent = targetNode.parameters.jsCode;
        } else if (targetNode.parameters?.code !== undefined) {
            codeField = 'parameters.code';
            codeContent = targetNode.parameters.code;
        } else if (targetNode.type === 'n8n-nodes-base.set' || targetNode.type === 'n8n-nodes-base.function') {
            // Set node uses values, function node uses jsCode
            log(`Node type: ${targetNode.type}, parameters: ${Object.keys(targetNode.parameters || {}).join(', ')}`);
        }

        // Try to find code in any parameter
        if (!codeField) {
            for (const [key, value] of Object.entries(targetNode.parameters || {})) {
                if (typeof value === 'string' && value.length > 50) {
                    codeField = `parameters.${key}`;
                    codeContent = value;
                    log(`Found code-like field: ${key} (${value.length} chars)`);
                    break;
                }
            }
        }

        if (!codeContent || codeContent.length < 10) {
            log(`No code content found. Dumping node parameters:`);
            log(JSON.stringify(targetNode.parameters, null, 2).slice(0, 2000));
            evidence.steps.push({ step: 'extract_code', result: 'no_code_found' });
            fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
            return evidence;
        }

        log(`Code field: ${codeField}, content length: ${codeContent.length}`);
        log(`Code preview:\n${codeContent.slice(0, 1500)}`);

        // Save BEFORE state (redacted)
        const codeBeforeRedacted = redactSecrets(codeContent);
        fs.writeFileSync(
            path.join(EVIDENCE_DIR, 'code-before.md'),
            `# Code Before Fix (via REST API)\n\nNode: ${NODE_NAME}\nNode Type: ${targetNode.type}\nField: ${codeField}\n\n\`\`\`javascript\n${codeBeforeRedacted}\n\`\`\`\n`
        );

        evidence.code_before = codeBeforeRedacted.slice(0, 3000);

        // --- Step 5: Apply the fix ---
        const lines = codeContent.split('\n');
        let fixed = false;
        
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (/^=+$/.test(trimmed) && !trimmed.startsWith('//')) {
                log(`LINE ${i}: Found uncommented separator: "${trimmed}"`);
                lines[i] = lines[i].replace(/^(\s*)(=+)/, '$1// $2');
                log(`LINE ${i}: Fixed to: "${lines[i]}"`);
                fixed = true;
                break;
            }
        }

        if (!fixed) {
            // Check more patterns
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (trimmed.startsWith('=') && trimmed.length > 2 && !trimmed.startsWith('//')) {
                    log(`LINE ${i}: Found variant: "${trimmed}"`);
                    lines[i] = '// ' + trimmed;
                    log(`LINE ${i}: Fixed to: "${lines[i]}"`);
                    fixed = true;
                    break;
                }
            }
        }

        if (!fixed) {
            log('No uncommented equals-sign line found. Fix may already be applied.');
            log(`All lines (first 30):\n${lines.slice(0, 30).map((l, i) => `${i}: ${l}`).join('\n')}`);
            evidence.steps.push({ step: 'apply_fix', result: 'no_fix_needed' });
            
            // Save and return
            fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
            await browser.close();
            return evidence;
        }

        const fixedCode = lines.join('\n');
        log(`Fix applied. Code changed: ${codeContent !== fixedCode}`);

        // Save AFTER state (redacted)
        const codeAfterRedacted = redactSecrets(fixedCode);
        fs.writeFileSync(
            path.join(EVIDENCE_DIR, 'code-after.md'),
            `# Code After Fix (via REST API)\n\nNode: ${NODE_NAME}\n\n\`\`\`javascript\n${codeAfterRedacted}\n\`\`\`\n`
        );

        evidence.code_after = codeAfterRedacted.slice(0, 3000);
        evidence.steps.push({ step: 'apply_fix', result: 'success', linesChanged: 1 });

        // --- Step 6: Update the workflow via PUT ---
        // Set the fixed code back to the correct parameter
        const keys = codeField.split('.');
        let target = targetNode;
        for (let i = 1; i < keys.length - 1; i++) {
            target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = fixedCode;

        log('Updating workflow via PUT...');
        const putResult = await apiCall(page, 'PUT', `${BASE_URL}/rest/workflows/${WORKFLOW_ID}`, workflow);
        log(`PUT status: ${putResult.status} ${putResult.ok ? 'OK' : 'FAILED'}`);

        if (putResult.ok) {
            evidence.steps.push({ step: 'update_workflow', result: 'success' });
            log('Workflow updated successfully!');
        } else {
            log(`PUT failed: ${JSON.stringify(putResult.data).slice(0, 500)}`);
            evidence.steps.push({ step: 'update_workflow', result: 'failed', status: putResult.status });
        }

        // --- Step 7: Activate/publish the workflow ---
        if (putResult.ok && workflow.active) {
            log('Re-activating workflow...');
            const activateResult = await apiCall(page, 'POST', `${BASE_URL}/rest/workflows/${WORKFLOW_ID}/activate`);
            log(`Activate status: ${activateResult.status} ${activateResult.ok ? 'OK' : 'FAILED'}`);
            evidence.steps.push({ step: 'activate', result: activateResult.ok ? 'success' : 'failed' });
        }

        // --- Step 8: Verify the fix by re-fetching ---
        log('Verifying fix by re-fetching workflow...');
        const verifyResult = await apiCall(page, 'GET', `${BASE_URL}/rest/workflows/${WORKFLOW_ID}`);
        if (verifyResult.ok) {
            const verifyNode = verifyResult.data.nodes?.find(n => n.name === NODE_NAME);
            if (verifyNode) {
                let verifyCode = '';
                const vKeys = codeField.split('.');
                let vTarget = verifyNode;
                for (let i = 1; i < vKeys.length; i++) {
                    vTarget = vTarget?.[vKeys[i]];
                }
                verifyCode = vTarget || '';
                
                const verified = verifyCode.includes('// ====') || verifyCode.includes('// ===');
                log(`Verification: Code contains comment prefix: ${verified}`);
                log(`Verify preview: ${verifyCode.slice(0, 200)}`);
                evidence.steps.push({ step: 'verify', result: verified ? 'confirmed' : 'not_confirmed' });
            }
        }

        // --- Final: Save all evidence ---
        evidence.result = putResult.ok ? 'fix_applied' : 'fix_failed';
        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
        log(`Final result: ${evidence.result}`);
        
        return evidence;

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        evidence.steps.push({ step: 'error', result: error.message });
        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v5-results.json'), JSON.stringify(evidence, null, 2));
        return evidence;
    } finally {
        if (browser) await browser.close().catch(() => {});
    }
}

main().then(r => log(`Done: ${r.result || 'error'}`));
