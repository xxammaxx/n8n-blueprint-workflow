/**
 * Playwright Diagnostic Script v3: n8n UI Comment Fix
 * Focus: Better code extraction and DOM diagnostics
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const BASE_URL = 'http://192.168.1.52:5678';
const WORKFLOW_ID = 'Sv12QTo56NoPUu2D';
const WORKFLOW_URL = `${BASE_URL}/workflow/${WORKFLOW_ID}`;
const NODE_NAME = 'Format Final Result';
const NODE_DATA_ID = 'f1aedb55-8b84-4886-85be-8a672817add5';

let logLines = [];
function log(msg) { const line = `[${new Date().toISOString()}] ${msg}`; console.log(line); logLines.push(line); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function dumpEditorState(page, label) {
    log(`--- DOM DUMP: ${label} ---`);
    const info = await page.evaluate(() => {
        const result = {};

        // Check all CodeMirror elements
        const cmEls = document.querySelectorAll('.CodeMirror');
        result.cmCount = cmEls.length;
        result.cmDetails = [];
        cmEls.forEach((el, i) => {
            result.cmDetails.push({
                index: i,
                visible: el.offsetParent !== null,
                hasCM: !!el.CodeMirror,
                hasGetValue: !!(el.CodeMirror && el.CodeMirror.getValue),
                textContent: (el.textContent || '').slice(0, 200),
                className: el.className,
                parentClass: el.parentElement?.className || '',
            });
        });

        // Check CM6 elements
        const cmContent = document.querySelector('.cm-content');
        result.cm6Content = cmContent ? {
            exists: true,
            visible: cmContent.offsetParent !== null,
            text: (cmContent.textContent || '').slice(0, 200),
            childCount: cmContent.children.length,
            firstChildTag: cmContent.children[0]?.tagName || 'none',
        } : { exists: false };

        // Check .cm-editor
        const cmEditor = document.querySelector('.cm-editor');
        result.cmEditor = cmEditor ? {
            exists: true,
            visible: cmEditor.offsetParent !== null,
            hasView: !!cmEditor.cmView,
            className: cmEditor.className,
        } : { exists: false };

        // Check all textareas
        const tas = document.querySelectorAll('textarea');
        result.textareaCount = tas.length;
        result.textareaDetails = Array.from(tas).map(ta => ({
            visible: ta.offsetParent !== null,
            valueLen: (ta.value || '').length,
            valuePreview: (ta.value || '').slice(0, 150),
            placeholder: ta.placeholder || '',
            className: ta.className,
        }));

        // Check .code-node-editor area
        const cne = document.querySelector('.code-node-editor');
        result.codeNodeEditor = cne ? {
            exists: true,
            visible: cne.offsetParent !== null,
            innerHTML: cne.innerHTML.slice(0, 500),
            textContent: (cne.textContent || '').slice(0, 300),
        } : { exists: false };

        // Check node panel
        const ndv = document.querySelector('.ndv, [data-test-id="node-details-view"]');
        result.nodePanel = ndv ? {
            exists: true,
            visible: ndv.offsetParent !== null,
            className: ndv.className,
        } : { exists: false };

        // Check for monaco
        result.monaco = typeof monaco !== 'undefined' ? {
            models: (monaco.editor?.getModels() || []).length,
            modelValues: (monaco.editor?.getModels() || []).map(m => (m.getValue() || '').slice(0, 200)),
        } : 'not_loaded';

        return result;
    });

    log(JSON.stringify(info, null, 2));
    return info;
}

async function extractCode(page) {
    // Try multiple strategies in parallel
    const code = await page.evaluate(() => {
        const results = {};

        // 1. CodeMirror 5 API
        const cmEls = document.querySelectorAll('.CodeMirror');
        for (const cmEl of cmEls) {
            if (cmEl.CodeMirror && cmEl.CodeMirror.getValue) {
                const val = cmEl.CodeMirror.getValue();
                if (val && val.length > 5) {
                    results.cm5 = val;
                    break;
                }
            }
        }

        // 2. CM6 .cm-content
        const cmContent = document.querySelector('.cm-content');
        if (cmContent && cmContent.textContent && cmContent.textContent.length > 5) {
            const lines = cmContent.querySelectorAll('.cm-line');
            if (lines.length > 0) {
                results.cm6 = Array.from(lines).map(l => l.textContent || '').join('\n');
            } else {
                results.cm6 = cmContent.textContent;
            }
        }

        // 3. Textareas
        const tas = document.querySelectorAll('textarea');
        for (const ta of tas) {
            if (ta.value && ta.value.length > 10) {
                results.textarea = ta.value;
                break;
            }
        }

        // 4. Contenteditable
        const ces = document.querySelectorAll('[contenteditable="true"]');
        for (const ce of ces) {
            if (ce.textContent && ce.textContent.length > 10) {
                results.contenteditable = ce.textContent;
                break;
            }
        }

        // 5. Monaco
        if (typeof monaco !== 'undefined' && monaco.editor) {
            const models = monaco.editor.getModels();
            if (models.length > 0) {
                results.monaco = models[0].getValue();
            }
        }

        // 6. Code-node-editor raw text
        const cne = document.querySelector('.code-node-editor');
        if (cne && cne.textContent && cne.textContent.length > 10) {
            results.cneText = cne.textContent;
        }

        return results;
    });

    return code;
}

async function main() {
    let browser;
    try {
        log('Launching Chromium (headless=false for debugging)...');
        browser = await chromium.launch({
            headless: false,
            slowMo: 80,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
            args: ['--start-maximized'],
        });

        const context = await browser.newContext({
            storageState: STORAGE_STATE,
            viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();

        // --- Navigate to main workflow URL (NOT deep link - too unreliable) ---
        log(`Navigating to: ${WORKFLOW_URL}`);
        await page.goto(WORKFLOW_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        log(`URL: ${page.url()}`);
        
        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            await page.screenshot({ path: path.join(EVIDENCE_DIR, 'login.png') });
            return { login: 'required' };
        }

        // Wait for SPA to fully render
        await page.waitForTimeout(6000);
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '01-workflow-loaded.png'), fullPage: true });

        // --- Dismiss modals ---
        log('Dismissing modals...');
        for (let i = 0; i < 3; i++) {
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }

        // --- Dump initial DOM state ---
        await dumpEditorState(page, 'initial');

        // --- Click the node on canvas ---
        log(`Locating node "${NODE_NAME}" on canvas...`);
        
        // Force-click the node by its data-id
        try {
            const node = page.locator(`[data-id="${NODE_DATA_ID}"]`).first();
            await node.scrollIntoViewIfNeeded();
            await page.waitForTimeout(500);
            await node.click({ force: true, timeout: 10000 });
            log('Node clicked via data-id with force.');
        } catch (e) {
            log(`Force-click via data-id failed: ${e.message}`);
            
            // Try by label text
            try {
                const label = page.locator('.vue-flow__node').filter({ hasText: NODE_NAME }).first();
                await label.click({ force: true, timeout: 10000 });
                log('Node clicked via label with force.');
            } catch (e2) {
                log(`Label click also failed: ${e2.message}`);
                
                // Last resort: double-click the canvas area near the node
                try {
                    const nodeEl = page.locator(`[data-id="${NODE_DATA_ID}"]`);
                    const box = await nodeEl.boundingBox();
                    if (box) {
                        log(`Node bounding box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
                        await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
                        await page.waitForTimeout(1000);
                        await page.mouse.click(box.x + box.width/2, box.y + box.height/2); // double-click
                        log('Double-clicked at node center.');
                    }
                } catch (e3) {
                    log(`Bounding box click failed: ${e3.message}`);
                }
            }
        }

        // Wait for panel to potentially open
        await page.waitForTimeout(4000);
        await page.screenshot({ path: path.join(EVIDENCE_DIR, '02-after-node-click.png'), fullPage: true });

        // --- Dump DOM state after click ---
        const afterState = await dumpEditorState(page, 'after-node-click');

        // --- Try to find the code parameter tab ---
        // n8n Code node: you may need to click "Parameters" tab or the code area is directly visible
        log('Looking for "Code" or "JavaScript" tab/button...');
        const codeTabFound = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button, [role="tab"], .parameter-item button, .option');
            for (const btn of buttons) {
                if ((btn.textContent || '').trim().match(/^(Code|JavaScript|JS)$/i)) {
                    return btn.textContent.trim();
                }
            }
            return null;
        });
        log(`Code tab found: ${codeTabFound || 'none'}`);

        // --- Extract code ---
        log('Extracting code...');
        const codeResults = await extractCode(page);
        log(`Code extraction results: ${JSON.stringify(Object.keys(codeResults))}`);
        for (const [method, code] of Object.entries(codeResults)) {
            log(`[${method}]: ${code.length} chars`);
            if (code.length > 0) log(`Preview: ${code.slice(0, 300)}`);
        }

        // --- Determine which extraction method worked best ---
        let bestCode = '';
        let bestMethod = '';
        const priority = ['cm5', 'cm6', 'textarea', 'monaco', 'contenteditable', 'cneText'];
        for (const m of priority) {
            if (codeResults[m] && codeResults[m].length > 10) {
                bestCode = codeResults[m];
                bestMethod = m;
                break;
            }
        }

        if (!bestCode) {
            // Last attempt: wait longer and try again
            log('No code found. Waiting 5 more seconds...');
            await page.waitForTimeout(5000);
            const retry = await extractCode(page);
            log(`Retry keys: ${Object.keys(retry).join(', ')}`);
            for (const m of priority) {
                if (retry[m] && retry[m].length > 10) {
                    bestCode = retry[m];
                    bestMethod = m;
                    break;
                }
            }
        }

        log(`Best extraction method: ${bestMethod} (${bestCode.length} chars)`);

        // --- Save diagnostic evidence ---
        fs.writeFileSync(
            path.join(EVIDENCE_DIR, 'diagnostic-results.json'),
            JSON.stringify({
                timestamp: new Date().toISOString(),
                url: page.url(),
                login: 'authenticated',
                nodePanel: afterState?.nodePanel || 'unknown',
                cmCount: afterState?.cmCount || 0,
                codeNodeEditor: afterState?.codeNodeEditor || 'unknown',
                textareaDetails: afterState?.textareaDetails || [],
                codeExtracted: !!bestCode,
                codeLength: bestCode.length,
                extractionMethod: bestMethod,
                codePreview: bestCode.slice(0, 1000),
                allExtractionResults: Object.fromEntries(
                    Object.entries(codeResults).map(([k, v]) => [k, typeof v === 'string' ? v.length + ' chars' : v])
                ),
            }, null, 2)
        );

        // --- Apply fix if code was found ---
        if (bestCode && bestCode.length > 10) {
            const lines = bestCode.split('\n');
            let fixed = false;
            
            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (/^=+$/.test(trimmed) && !trimmed.startsWith('//')) {
                    log(`Found uncommented at line ${i}: "${trimmed}"`);
                    lines[i] = `// ${trimmed}`;
                    fixed = true;
                    break;
                }
            }

            if (fixed) {
                const fixedCode = lines.join('\n');
                log('Fix prepared. Injecting...');
                
                // Inject via CodeMirror API
                const injected = await page.evaluate((code) => {
                    const cmEls = document.querySelectorAll('.CodeMirror');
                    for (const cmEl of cmEls) {
                        if (cmEl.CodeMirror && cmEl.CodeMirror.setValue) {
                            cmEl.CodeMirror.setValue(code);
                            return 'cm5';
                        }
                    }
                    
                    // CM6
                    const cmEditor = document.querySelector('.cm-editor');
                    if (cmEditor && cmEditor.cmView && cmEditor.cmView.view) {
                        const view = cmEditor.cmView.view;
                        view.dispatch({
                            changes: { from: 0, to: view.state.doc.length, insert: code }
                        });
                        return 'cm6';
                    }
                    
                    // Textarea
                    const tas = document.querySelectorAll('textarea');
                    for (const ta of tas) {
                        if (ta.value !== undefined) {
                            ta.value = code;
                            ta.dispatchEvent(new Event('input', { bubbles: true }));
                            ta.dispatchEvent(new Event('change', { bubbles: true }));
                            return 'textarea';
                        }
                    }
                    
                    return 'none';
                }, fixedCode);
                
                log(`Code injected via: ${injected}`);
                
                if (injected !== 'none') {
                    // Save
                    await page.waitForTimeout(2000);
                    log('Saving...');
                    await page.keyboard.press('Control+s');
                    await page.waitForTimeout(3000);
                    
                    fs.writeFileSync(
                        path.join(EVIDENCE_DIR, 'fix-result.json'),
                        JSON.stringify({ fix_applied: true, injected_via: injected, saved: true })
                    );
                    log('FIX APPLIED AND SAVED');
                } else {
                    log('FIX FAILED - could not inject code');
                }
            } else {
                log('No uncommented equals-sign line found. Already fixed?');
            }
        } else {
            log('INCONCLUSIVE - no code content extracted. Manual inspection needed.');
            // Final screenshot for manual debugging
            await page.screenshot({ path: path.join(EVIDENCE_DIR, '03-final-state.png'), fullPage: true });
        }

        log('Script complete. Browser remains open for inspection.');
        await page.waitForTimeout(10000);
        
        return { complete: true };

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        return { error: error.message };
    }
}

main().then(r => log('Done: ' + JSON.stringify(r)));
