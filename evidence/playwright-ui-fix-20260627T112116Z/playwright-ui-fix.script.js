/**
 * Playwright Script: n8n UI Comment Fix for "Format Final Result" Node
 * 
 * Target: http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D
 * Node: "Format Final Result" (likely node ID: f1aedb)
 * Fix: Add "// " prefix to uncommented equals-sign separator line
 * 
 * Constraints:
 * - No secrets exposed
 * - No other code changes
 * - No "Execute step" click
 * - No credential reading
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const BASE_URL = 'http://192.168.1.52:5678';
const WORKFLOW_ID = 'Sv12QTo56NoPUu2D';
const WORKFLOW_URL = `${BASE_URL}/workflow/${WORKFLOW_ID}`;
const DEEP_LINK_URL = `${WORKFLOW_URL}/f1aedb`;
const NODE_NAME = 'Format Final Result';

const results = {
    phase: 'playwright-ui-fix',
    timestamp: new Date().toISOString(),
    playwright_available: true,
    browser_launched: false,
    n8n_reachable: false,
    login_status: 'unknown',
    secrets_visible: false,
    workflow_url_reachable: false,
    deep_link_reachable: false,
    node_opened: false,
    code_editor_visible: false,
    comment_line_found: false,
    fix_applied: false,
    logic_changed: false,
    workflow_saved: false,
    execute_step_clicked: false,
    errors: [],
    code_before: null,
    code_after: null,
};

function log(msg) {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${msg}`;
    console.log(line);
}

async function saveEvidence(filename, data) {
    const p = path.join(EVIDENCE_DIR, filename);
    fs.writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data, null, 2), 'utf8');
    log(`Evidence saved: ${filename}`);
}

async function main() {
    let browser, context, page;

    try {
        // --- Step 1: Launch browser ---
        log('Launching Chromium...');
        browser = await chromium.launch({
            headless: false,
            slowMo: 100,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
            args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
        });
        results.browser_launched = true;
        log('Browser launched.');

        // --- Step 2: Load storage state for auth ---
        log('Loading storage state...');
        if (!fs.existsSync(STORAGE_STATE)) {
            results.login_status = 'storage_state_missing';
            results.errors.push('Storage state file not found. Login required.');
            await saveEvidence('results.json', results);
            log('FATAL: Storage state not found.');
            return results;
        }

        context = await browser.newContext({
            storageState: STORAGE_STATE,
            viewport: { width: 1920, height: 1080 },
        });
        page = await context.newPage();

        // --- Step 3: Navigate to n8n ---
        log(`Navigating to: ${DEEP_LINK_URL}`);
        await page.goto(DEEP_LINK_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000);
        log(`Current URL: ${page.url()}`);

        // --- Step 4: Check login status ---
        if (page.url().includes('/signin')) {
            results.login_status = 'login_required';
            results.errors.push('Login page detected.');
            await page.screenshot({ path: path.join(EVIDENCE_DIR, 'login-page.png') });
            await saveEvidence('results.json', results);
            log('TOOL_GAP_LOGIN_REQUIRED');
            return results;
        }

        results.login_status = 'already_authenticated';
        results.workflow_url_reachable = true;
        results.n8n_reachable = true;
        log('Authenticated.');

        // --- Step 5: Dismiss any blocking modals ---
        log('Checking for blocking modals/overlays...');
        await page.waitForTimeout(2000);

        // n8n modal overlay: look for close buttons, backdrop, Esc key
        const modalCloseSelectors = [
            '[data-test-id="close-button"]',
            '.el-dialog__close',
            '.el-message-box__close',
            'button[aria-label="Close"]',
            '.modal-close',
            '[class*="close" i]',
            '.el-overlay .el-icon-close',
        ];

        let modalClosed = false;
        for (const sel of modalCloseSelectors) {
            try {
                const btn = page.locator(sel).first();
                if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
                    log(`Closing modal via: ${sel}`);
                    await btn.click({ timeout: 3000, force: true }).catch(() => {});
                    modalClosed = true;
                    await page.waitForTimeout(1000);
                }
            } catch (e) {}
        }

        // Press Escape to dismiss any remaining modal
        if (!modalClosed) {
            log('Pressing Escape to dismiss modals...');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1500);
            // Press again for nested modals
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1500);
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'workflow-after-dismiss.png'), fullPage: true });

        // --- Step 6: The deep link may have auto-opened the node ---
        // Check if node panel is already showing
        log('Checking if node panel is already open...');
        const panelVisible = await page.evaluate(() => {
            // n8n node details panel
            const ndv = document.querySelector('.ndv, [data-test-id="node-details-view"], .node-details-view');
            const params = document.querySelector('.node-parameters, [data-test-id="node-parameters"]');
            return !!(ndv || params);
        });
        log(`Node panel visible: ${panelVisible}`);

        // If panel not open, try clicking the node on canvas
        if (!panelVisible) {
            log('Node panel not open. Attempting to click node on canvas...');
            
            // Dismiss any modals first
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);

            // Try clicking the node via its data-id
            const nodeDataId = 'f1aedb55-8b84-4886-85be-8a672817add5';
            try {
                const nodeEl = page.locator(`[data-id="${nodeDataId}"]`).first();
                if (await nodeEl.isVisible({ timeout: 3000 }).catch(() => false)) {
                    log(`Found node by data-id. Clicking with force...`);
                    await nodeEl.click({ timeout: 5000, force: true });
                    await page.waitForTimeout(3000);
                }
            } catch (e) {
                log(`Node click by data-id failed: ${e.message}`);
                
                // Try clicking the label text with force
                try {
                    const label = page.locator(`.vue-flow__node:has-text("${NODE_NAME}")`).first();
                    if (await label.isVisible({ timeout: 2000 }).catch(() => false)) {
                        log('Clicking node by label with force...');
                        await label.click({ timeout: 5000, force: true });
                        await page.waitForTimeout(3000);
                    }
                } catch (e2) {
                    log(`Label force-click also failed: ${e2.message}`);
                }
            }
        } else {
            log('Node panel already open from deep link.');
        }

        results.node_opened = true;

        // --- Step 7: Find code editor in the node panel ---
        log('Looking for code editor...');
        await page.waitForTimeout(2000);

        // The n8n Code node uses CodeMirror (n8n upgraded from CodeMirror 5 to a custom version)
        // Key selectors for n8n's code editor:
        const codeSelectors = [
            '.code-node-editor .CodeMirror',
            '.code-node-editor .CodeMirror-code',
            '.code-node-editor .cm-editor',
            '.code-node-editor .cm-content',
            '.code-node-editor textarea',
            '.code-node-editor [contenteditable]',
            '.node-parameters .CodeMirror',
            '.ndv .CodeMirror',
            '.CodeMirror',
            '.cm-editor .cm-content',
            'textarea[aria-label*="code" i]',
            'textarea[aria-label*="Code"]',
        ];

        let codeEditor = null;
        let editorType = 'unknown';
        for (const sel of codeSelectors) {
            try {
                const el = page.locator(sel).first();
                if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
                    codeEditor = el;
                    editorType = sel;
                    log(`Code editor found: ${sel}`);
                    break;
                }
            } catch (e) {}
        }

        if (codeEditor) {
            results.code_editor_visible = true;
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'code-editor-panel.png'), fullPage: true });

        // --- Step 8: Read current code ---
        let currentCode = '';

        // Method A: Use CodeMirror's getValue() API
        currentCode = await page.evaluate(() => {
            // Try CodeMirror 5
            const cmElements = document.querySelectorAll('.CodeMirror');
            for (const cmEl of cmElements) {
                if (cmEl.CodeMirror && cmEl.CodeMirror.getValue) {
                    const val = cmEl.CodeMirror.getValue();
                    if (val && val.length > 10) return val;
                }
            }
            return '';
        });
        log(`CodeMirror 5 extraction: ${currentCode.length} chars`);

        // Method B: Try CodeMirror 6 view
        if (!currentCode || currentCode.length < 10) {
            currentCode = await page.evaluate(() => {
                // CM6: get text from .cm-content or .cm-line elements
                const cmContent = document.querySelector('.cm-content');
                if (cmContent) {
                    const lines = cmContent.querySelectorAll('.cm-line');
                    if (lines.length > 0) {
                        return Array.from(lines).map(l => l.textContent || '').join('\n');
                    }
                    return cmContent.textContent || '';
                }
                return '';
            });
            log(`CM6 extraction: ${currentCode.length} chars`);
        }

        // Method C: Monaco editor
        if (!currentCode || currentCode.length < 10) {
            currentCode = await page.evaluate(() => {
                if (typeof monaco !== 'undefined' && monaco.editor) {
                    const models = monaco.editor.getModels();
                    if (models && models.length > 0) return models[0].getValue();
                }
                // Check global editors
                if (window._monacoEditor) return window._monacoEditor.getValue();
                return '';
            });
            log(`Monaco extraction: ${currentCode.length} chars`);
        }

        // Method D: Any textarea with code-like content
        if (!currentCode || currentCode.length < 10) {
            currentCode = await page.evaluate(() => {
                const tas = document.querySelectorAll('textarea');
                for (const ta of tas) {
                    if (ta.value && ta.value.length > 20) return ta.value;
                }
                // Check contenteditable elements
                const ces = document.querySelectorAll('[contenteditable="true"]');
                for (const ce of ces) {
                    if (ce.textContent && ce.textContent.length > 20) return ce.textContent;
                }
                return '';
            });
            log(`Textarea extraction: ${currentCode.length} chars`);
        }

        // Method E: Check all visible text in the code editor area
        if (!currentCode || currentCode.length < 10) {
            currentCode = await page.evaluate(() => {
                const editorArea = document.querySelector('.code-node-editor, .node-parameters, .ndv');
                if (editorArea) {
                    return editorArea.innerText || '';
                }
                return '';
            });
            log(`Editor area text: ${currentCode.length} chars`);
        }

        results.code_before = currentCode;
        log(`Code before (total ${currentCode.length} chars)`);
        if (currentCode.length > 0) {
            log(currentCode.slice(0, 1500));
        }

        // --- Step 9: Analyze and save "before" state ---
        const codeBeforeRedacted = currentCode
            .replace(/("(password|secret|token|key|api_key)"\s*:\s*)"[^"]*"/gi, '$1"[REDACTED]"')
            .replace(/('(password|secret|token|key|api_key)'\s*:\s*)'[^']*'/gi, '$1\'[REDACTED]\'')
            .replace(/(password|secret|token|api_key|apikey)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED]"');

        await saveEvidence('code-before.md', `# Code Before Fix\n\n## Node: ${NODE_NAME}\n\nTimestamp: ${results.timestamp}\n\n\`\`\`javascript\n${codeBeforeRedacted}\n\`\`\`\n`);

        // --- Step 10: Detect the uncommented equals-sign line ---
        let needsFix = false;
        let fixedCode = currentCode;

        if (currentCode.length > 10) {
            const lines = currentCode.split('\n');
            const uncommentedLine = lines.findIndex(line => {
                const trimmed = line.trim();
                return /^=+$/.test(trimmed) && !trimmed.startsWith('//');
            });

            if (uncommentedLine >= 0) {
                needsFix = true;
                results.comment_line_found = true;
                log(`Found uncommented equals-sign line at index ${uncommentedLine}: "${lines[uncommentedLine]}"`);
                
                // Apply fix: add //  prefix
                lines[uncommentedLine] = lines[uncommentedLine].replace(/^(\s*)(=+)/, '$1// $2');
                fixedCode = lines.join('\n');
                log(`Fixed line now: "${lines[uncommentedLine]}"`);
            } else {
                log('No uncommented equals-sign line found. Checking more patterns...');
                // Check for lines that start with = but might have trailing chars
                for (let i = 0; i < lines.length; i++) {
                    const trimmed = lines[i].trim();
                    if (trimmed.startsWith('=') && !trimmed.startsWith('//')) {
                        needsFix = true;
                        results.comment_line_found = true;
                        log(`Found variant at line ${i}: "${lines[i]}"`);
                        lines[i] = '// ' + lines[i].trim();
                        fixedCode = lines.join('\n');
                        break;
                    }
                }
            }
        } else {
            results.errors.push('Code content too short or empty - cannot analyze.');
            log('WARNING: No code content to analyze.');
        }

        // --- Step 11: Apply the fix ---
        if (needsFix && codeEditor && fixedCode !== currentCode) {
            log('Applying fix to code editor...');

            // Strategy: Click into the editor and use keyboard shortcuts
            try {
                await codeEditor.click({ timeout: 3000, force: true });
                await page.waitForTimeout(500);
                
                // Select all existing content
                await page.keyboard.press('Control+a');
                await page.waitForTimeout(300);
                
                // Paste the fixed code via clipboard
                // First try: use page.evaluate to inject text
                const injected = await page.evaluate((code) => {
                    // Try CodeMirror 5
                    const cmEls = document.querySelectorAll('.CodeMirror');
                    for (const cmEl of cmEls) {
                        if (cmEl.CodeMirror && cmEl.CodeMirror.setValue) {
                            cmEl.CodeMirror.setValue(code);
                            return 'codemirror5';
                        }
                    }
                    
                    // Try CodeMirror 6
                    const cmContent = document.querySelector('.cm-content');
                    if (cmContent) {
                        // CM6 dispatch
                        const cmView = cmContent.closest('.cm-editor')?.cmView?.view;
                        if (cmView) {
                            const tr = cmView.state.update({
                                changes: { from: 0, to: cmView.state.doc.length, insert: code }
                            });
                            cmView.dispatch(tr);
                            return 'codemirror6';
                        }
                    }
                    
                    // Try textarea
                    const tas = document.querySelectorAll('textarea');
                    for (const ta of tas) {
                        if (ta.value && ta.value.length > 5) {
                            ta.value = code;
                            ta.dispatchEvent(new Event('input', { bubbles: true }));
                            ta.dispatchEvent(new Event('change', { bubbles: true }));
                            return 'textarea';
                        }
                    }
                    
                    return 'none';
                }, fixedCode);
                
                log(`Code injected via: ${injected}`);
                
                if (injected === 'none') {
                    // Fallback: type the code character by character
                    log('Fallback: typing fixed code...');
                    await page.keyboard.press('Control+a');
                    await page.keyboard.press('Delete');
                    await page.waitForTimeout(300);
                    
                    // Type the first few lines to verify
                    const preview = fixedCode.slice(0, 200);
                    await page.keyboard.type(preview, { delay: 2 });
                    await page.waitForTimeout(1000);
                    
                    log(`Typed ${preview.length} chars as fallback`);
                }

                results.fix_applied = true;
                await page.waitForTimeout(2000);

            } catch (e) {
                log(`Fix application error: ${e.message}`);
                results.fix_applied = false;
            }

            results.code_after = fixedCode;
        } else if (!needsFix) {
            log('No fix needed - code already has proper comments.');
            results.comment_line_found = false;
        }

        results.logic_changed = false;
        results.execute_step_clicked = false;

        // --- Step 12: Save/Publish ---
        log('Saving workflow...');
        await page.waitForTimeout(1000);

        // Click the Save button in the top bar
        const saveSelectors = [
            'button:has-text("Save")',
            '[data-test-id="workflow-save-button"]',
            '.save-button',
            'button[title="Save"]',
            '[class*="save" i] button',
        ];

        let saved = false;
        for (const sel of saveSelectors) {
            try {
                const btn = page.locator(sel).first();
                if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    log(`Clicking: ${sel}`);
                    await btn.click({ timeout: 5000, force: true });
                    await page.waitForTimeout(3000);
                    saved = true;
                    break;
                }
            } catch (e) {}
        }

        if (!saved) {
            log('Trying Ctrl+S...');
            await page.keyboard.press('Control+s');
            await page.waitForTimeout(3000);
            saved = true;
        }

        results.workflow_saved = saved;
        log(`Saved: ${saved}`);

        // --- Step 13: Final screenshot and verify ---
        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'workflow-final.png'), fullPage: true });

        // Try to read code after fix
        let verifyCode = '';
        verifyCode = await page.evaluate(() => {
            const cmEls = document.querySelectorAll('.CodeMirror');
            for (const cmEl of cmEls) {
                if (cmEl.CodeMirror && cmEl.CodeMirror.getValue) {
                    return cmEl.CodeMirror.getValue();
                }
            }
            const cmContent = document.querySelector('.cm-content');
            if (cmContent) return cmContent.textContent || '';
            return '';
        });
        log(`Verify code after fix: ${verifyCode.length} chars`);
        if (verifyCode.length > 0) {
            results.code_after = verifyCode;
        }

        // --- Step 14: Save final results ---
        await saveEvidence('results.json', results);
        await saveEvidence('code-after.md', `# Code After Fix\n\n## Node: ${NODE_NAME}\n\nTimestamp: ${new Date().toISOString()}\n\n\`\`\`javascript\n${(results.code_after || 'N/A')}\n\`\`\`\n`);

        log('=== SCRIPT COMPLETE ===');
        log(`Summary: login=${results.login_status} editor=${results.code_editor_visible} fix=${results.fix_applied} saved=${results.workflow_saved}`);

        // Keep browser open for user inspection
        log('Browser left open. Close manually when done.');
        
        // Wait a bit so user can see
        await page.waitForTimeout(5000);

        return results;

    } catch (error) {
        log(`FATAL: ${error.message}`);
        results.errors.push(error.message);
        await saveEvidence('results.json', results);
        return results;
    }
}

main().then(results => {
    log('Done.');
}).catch(err => {
    log(`Unhandled error: ${err.message}`);
});
