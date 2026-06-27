/**
 * Playwright Script v4: Targeted node panel opening via proper events
 * Goal: Open the "Format Final Result" node panel and fix the comment
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const BASE_URL = 'http://192.168.1.52:5678';
const WORKFLOW_URL = `${BASE_URL}/workflow/Sv12QTo56NoPUu2D`;
const NODE_DATA_ID = 'f1aedb55-8b84-4886-85be-8a672817add5';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

async function waitForNodePanel(page, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const exists = await page.evaluate(() => {
            // Multiple panel selectors for n8n NDV
            const selectors = [
                '.ndv', '.node-details-view', '[data-test-id="node-details-view"]',
                '.node-view-wrapper', '.code-node-editor',
                '.CodeMirror', '.cm-editor', '.cm-content',
                '.node-parameters',
            ];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el && el.offsetParent !== null) return sel;
            }
            return null;
        });
        if (exists) return exists;
        await new Promise(r => setTimeout(r, 500));
    }
    return null;
}

async function main() {
    let browser;
    try {
        log('Launching browser...');
        browser = await chromium.launch({
            headless: false,
            slowMo: 50,
            executablePath: 'C:\\Users\\xxammaxx\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe',
            args: ['--start-maximized'],
        });

        const context = await browser.newContext({
            storageState: STORAGE_STATE,
            viewport: { width: 1920, height: 1080 },
        });
        const page = await context.newPage();

        // --- Navigate to workflow ---
        log(`Navigating to: ${WORKFLOW_URL}`);
        await page.goto(WORKFLOW_URL, { waitUntil: 'networkidle', timeout: 60000 });
        log(`URL: ${page.url()}`);

        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            return { login: 'required' };
        }

        // Wait for canvas to fully render
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'v4-01-loaded.png'), fullPage: true });

        // --- First, check if any modals are actually blocking ---
        const modalCheck = await page.evaluate(() => {
            const modals = document.querySelectorAll('.el-overlay, .el-dialog__wrapper, [role="dialog"], .modal');
            const visibleModals = Array.from(modals).filter(m => m.offsetParent !== null);
            return {
                count: visibleModals.length,
                details: visibleModals.map(m => ({
                    className: m.className.slice(0, 100),
                    hasCloseBtn: !!m.querySelector('[class*="close" i], [aria-label="Close"]'),
                    text: (m.textContent || '').slice(0, 100),
                })),
            };
        });
        log(`Visible modals: ${JSON.stringify(modalCheck)}`);

        // Only dismiss if there's actually a visible modal
        if (modalCheck.count > 0) {
            log('Dismissing visible modals...');
            for (let i = 0; i < modalCheck.count; i++) {
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1500);
            }
            await page.screenshot({ path: path.join(EVIDENCE_DIR, 'v4-02-modals-dismissed.png'), fullPage: true });
        } else {
            log('No visible modals - proceeding directly to node interaction.');
        }

        // --- Find the node on canvas and get its bounding box ---
        log(`Looking for node with data-id="${NODE_DATA_ID}"...`);
        
        // Ensure node is in viewport
        const nodeLocator = page.locator(`[data-id="${NODE_DATA_ID}"]`).first();
        
        // Scroll to node
        await nodeLocator.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const box = await nodeLocator.boundingBox();
        log(`Node bounding box: ${JSON.stringify(box)}`);

        if (!box) {
            log('ERROR: Could not find node bounding box!');
            // Try alternate selector
            const altNodes = await page.evaluate(() => {
                const nodes = document.querySelectorAll('.vue-flow__node');
                return Array.from(nodes).map((n, i) => ({
                    index: i,
                    dataId: n.getAttribute('data-id'),
                    label: n.querySelector('._label_9txz0_177')?.textContent || n.textContent?.slice(0, 50),
                    visible: n.offsetParent !== null,
                }));
            });
            log(`All canvas nodes: ${JSON.stringify(altNodes, null, 2)}`);
            return { error: 'node_box_not_found' };
        }

        // --- Click the node at its center using proper mouse events ---
        const clickX = box.x + box.width / 2;
        const clickY = box.y + box.height / 2;
        log(`Clicking at coordinates: (${clickX}, ${clickY})`);

        // Use page.mouse for more reliable clicking
        await page.mouse.move(clickX, clickY);
        await page.waitForTimeout(200);
        await page.mouse.down();
        await page.waitForTimeout(100);
        await page.mouse.up();
        await page.waitForTimeout(2000);

        // Check if panel opened
        let panelSelector = await waitForNodePanel(page, 8000);
        
        if (!panelSelector) {
            log('Single click did not open panel. Trying double-click...');
            await page.mouse.click(clickX, clickY);
            await page.waitForTimeout(500);
            await page.mouse.click(clickX, clickY);
            await page.waitForTimeout(2000);
            panelSelector = await waitForNodePanel(page, 8000);
        }

        if (!panelSelector) {
            log('Double-click also failed. Trying direct JS event dispatch...');
            // Use dispatchEvent with proper MouseEvent
            await page.evaluate((dataId) => {
                const node = document.querySelector(`[data-id="${dataId}"]`);
                if (!node) return 'node_not_found';
                
                const rect = node.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                
                const downEvent = new PointerEvent('pointerdown', {
                    bubbles: true, cancelable: true,
                    clientX: cx, clientY: cy,
                    button: 0, pointerId: 1, pointerType: 'mouse',
                });
                const upEvent = new PointerEvent('pointerup', {
                    bubbles: true, cancelable: true,
                    clientX: cx, clientY: cy,
                    button: 0, pointerId: 1, pointerType: 'mouse',
                });
                const clickEvent = new MouseEvent('click', {
                    bubbles: true, cancelable: true,
                    clientX: cx, clientY: cy, button: 0,
                });
                
                node.dispatchEvent(downEvent);
                node.dispatchEvent(upEvent);
                node.dispatchEvent(clickEvent);
                
                return 'dispatched';
            }, NODE_DATA_ID);
            
            log('JS events dispatched. Waiting for panel...');
            await page.waitForTimeout(3000);
            panelSelector = await waitForNodePanel(page, 5000);
        }

        // --- Take screenshot at this point ---
        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'v4-03-after-click-attempts.png'), fullPage: true });

        // --- Dump final state ---
        const finalState = await page.evaluate(() => {
            return {
                panelOpen: !!document.querySelector('.ndv, .node-details-view'),
                codeMirror: !!document.querySelector('.CodeMirror, .cm-editor'),
                codeNodeEditor: !!document.querySelector('.code-node-editor'),
                textareas: Array.from(document.querySelectorAll('textarea')).map(ta => ({
                    visible: ta.offsetParent !== null,
                    valLen: (ta.value || '').length,
                    preview: (ta.value || '').slice(0, 200),
                    placeholder: ta.placeholder,
                })),
                // Check if "Format Final Result" appears in any visible panel
                nodeNameInPanel: (document.querySelector('.ndv, .node-details-view')?.textContent || '').includes('Format Final Result'),
            };
        });
        log(`Final state: ${JSON.stringify(finalState, null, 2)}`);

        if (panelSelector) {
            log(`SUCCESS: Node panel opened! Selector: ${panelSelector}`);
        } else {
            log('FAILED: Could not open node panel through any method.');
            log('The n8n instance may need manual interaction.');
        }

        // Save diagnostic
        fs.writeFileSync(
            path.join(EVIDENCE_DIR, 'v4-final-state.json'),
            JSON.stringify({
                timestamp: new Date().toISOString(),
                panelOpened: !!panelSelector,
                panelSelector,
                modalCount: modalCheck.count,
                finalState,
                box,
                url: page.url(),
            }, null, 2)
        );

        log('Script complete. Browser remains open.');
        await page.waitForTimeout(15000);

        return { panelOpened: !!panelSelector, panelSelector };

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        return { error: error.message };
    }
}

main().then(r => log('Done: ' + JSON.stringify(r)));
