/**
 * Playwright v6: Canvas zoom + node interaction
 * Strategy: Use n8n's fit-view / zoom controls first, then interact
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const WORKFLOW_URL = 'http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D';
const NODE_DATA_ID = 'f1aedb55-8b84-4886-85be-8a672817add5';
const NODE_NAME = 'Format Final Result';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const evidence = { timestamp: new Date().toISOString(), steps: [] };
    let browser;

    try {
        log('Launching browser (headless=false for canvas interaction)...');
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

        // --- Navigate ---
        log(`Navigating to: ${WORKFLOW_URL}`);
        await page.goto(WORKFLOW_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(5000);

        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            return { login: 'required' };
        }

        // --- Step 1: Fit view (zoom to fit all nodes) ---
        log('Clicking "Fit to view" button...');
        
        // n8n's fit-to-view button
        const fitViewSelectors = [
            'button[title="Fit to view"]',
            '[data-test-id="fit-view-button"]',
            '[class*="zoom" i] button:has(svg)',
            '.zoom-menu button:first-child',
            'button:has-text("Fit view")',
        ];
        
        let fitted = false;
        for (const sel of fitViewSelectors) {
            try {
                const btn = page.locator(sel).first();
                if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    log(`Found fit-view: ${sel}`);
                    await btn.click({ timeout: 5000 });
                    await page.waitForTimeout(2000);
                    fitted = true;
                    break;
                }
            } catch (e) {}
        }

        if (!fitted) {
            log('Fit-view button not found. Using keyboard shortcut (1 for fit view)...');
            // n8n uses number keys for zoom: 1 = fit view
            await page.keyboard.press('Digit1');
            await page.waitForTimeout(2000);
        }

        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'v6-01-fit-view.png'), fullPage: true });

        // --- Step 2: Check node position after fit ---
        const nodeBox = await page.evaluate((dataId) => {
            const node = document.querySelector(`[data-id="${dataId}"]`);
            if (!node) return null;
            const rect = node.getBoundingClientRect();
            const viewport = node.closest('.vue-flow__viewport');
            const transform = viewport ? getComputedStyle(viewport).transform : 'none';
            return {
                x: rect.left, y: rect.top,
                width: rect.width, height: rect.height,
                inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
                transform,
            };
        }, NODE_DATA_ID);
        
        log(`Node after fit: ${JSON.stringify(nodeBox)}`);

        // --- Step 3: Click the node's LABEL text (not the small icon) ---
        log('Attempting to click node label text...');
        
        // Click on the label text specifically
        const labelClicked = await page.evaluate((dataId) => {
            const node = document.querySelector(`[data-id="${dataId}"]`);
            if (!node) return 'node_not_found';
            
            // Find the label element
            const label = node.querySelector('._label_9txz0_177, [data-test-id="node-label"], .node-label, .vue-flow__node-label');
            const target = label || node;
            
            const rect = target.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            
            return { cx, cy, width: rect.width, height: rect.height, element: target.tagName + '.' + (target.className?.split(' ')[0] || '') };
        }, NODE_DATA_ID);
        
        log(`Label element: ${JSON.stringify(labelClicked)}`);

        if (labelClicked && labelClicked !== 'node_not_found' && labelClicked.cx > 0) {
            // Click at the label center
            await page.mouse.click(labelClicked.cx, labelClicked.cy);
            await page.waitForTimeout(3000);
            
            // Check if panel opened
            const panelCheck = await page.evaluate(() => {
                const panel = document.querySelector('.ndv, .node-details-view, [data-test-id="node-details-view"]');
                if (panel && panel.offsetParent !== null) {
                    return { opened: true, className: panel.className.slice(0, 100) };
                }
                return { opened: false };
            });
            
            log(`Panel after label click: ${JSON.stringify(panelCheck)}`);
            
            if (!panelCheck.opened) {
                // Try double-click on label
                log('Trying double-click on label...');
                await page.mouse.click(labelClicked.cx, labelClicked.cy);
                await page.waitForTimeout(300);
                await page.mouse.click(labelClicked.cx, labelClicked.cy);
                await page.waitForTimeout(3000);
            }
        }

        // --- Step 4: Try keyboard shortcut to open node ---
        // In n8n, Enter or Space on a selected node opens it
        log('Trying keyboard approach: select node then Enter...');
        
        // First ensure canvas is focused
        await page.locator('#canvas, .vue-flow__pane').first().click({ timeout: 3000, force: true });
        await page.waitForTimeout(500);
        
        // Try Tab to navigate to nodes
        await page.keyboard.press('Tab');
        await page.waitForTimeout(500);
        
        // Check if any node is selected (has focus)
        const focusedNode = await page.evaluate(() => {
            const active = document.activeElement;
            if (!active) return null;
            const node = active.closest('.vue-flow__node');
            if (node) {
                return {
                    dataId: node.getAttribute('data-id'),
                    className: active.className,
                    tagName: active.tagName,
                };
            }
            return { tagName: active.tagName, className: active.className };
        });
        log(`Focused element: ${JSON.stringify(focusedNode)}`);

        // --- Step 5: Try programmatic node opening ---
        log('Trying programmatic node selection via n8n internal state...');
        
        const programmaticResult = await page.evaluate((dataId) => {
            // Try to access n8n's Pinia/ Vuex store through the Vue app instance
            const appEl = document.getElementById('app');
            if (!appEl) return 'no_app_element';
            
            const vueApp = appEl.__vue_app__;
            if (!vueApp) return 'no_vue_app';
            
            // Try Pinia store
            if (vueApp.config?.globalProperties?.$pinia) {
                const pinia = vueApp.config.globalProperties.$pinia;
                const stores = pinia._s;
                const storeKeys = Object.keys(stores);
                
                // Look for workflow or nodeview store
                for (const key of storeKeys) {
                    const store = stores[key];
                    if (store.openNodeView || store.openNDV || store.setNodeViewSelected) {
                        return { 
                            storeKey: key,
                            hasOpenNodeView: !!store.openNodeView,
                            hasOpenNDV: !!store.openNDV,
                            methods: Object.keys(store).filter(k => typeof store[k] === 'function'),
                        };
                    }
                }
                return { storeKeys, piniaAvailable: true };
            }
            
            // Try Vuex
            if (vueApp.config?.globalProperties?.$store) {
                const store = vueApp.config.globalProperties.$store;
                return { 
                    vuexAvailable: true, 
                    stateKeys: Object.keys(store.state || {}),
                    actionKeys: Object.keys(store._actions || {}),
                };
            }
            
            // Try to find the workflow store through component instances
            const allElements = document.querySelectorAll('[data-v-]');
            let componentInfo = [];
            for (const el of allElements) {
                const instance = el.__vueParentComponent || el.__vue_app__;
                if (instance && componentInfo.length < 5) {
                    componentInfo.push({
                        tag: el.tagName,
                        hasStore: !!instance.setupState?.workflowsStore,
                    });
                }
            }
            
            return { vueAppAvailable: true, componentInfo };
        }, NODE_DATA_ID);
        
        log(`Programmatic result: ${JSON.stringify(programmaticResult, null, 2)}`);

        // --- Step 6: Final state dump ---
        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'v6-02-final.png'), fullPage: true });
        
        const finalState = await page.evaluate(() => {
            const panel = document.querySelector('.ndv, .node-details-view, [data-test-id="node-details-view"]');
            const codeEl = document.querySelector('.CodeMirror, .cm-editor, .code-node-editor');
            return {
                panelOpen: !!(panel && panel.offsetParent !== null),
                panelSelector: panel?.className?.slice(0, 80) || null,
                codeEditorVisible: !!(codeEl && codeEl.offsetParent !== null),
                codeEditorSelector: codeEl?.className?.slice(0, 80) || null,
            };
        });
        
        log(`Final state: ${JSON.stringify(finalState, null, 2)}`);
        evidence.steps.push({
            step: 'final',
            ...finalState,
            nodeBox,
            labelClicked,
            programmaticResult,
        });

        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v6-results.json'), JSON.stringify(evidence, null, 2));
        log('Script complete.');
        
        await page.waitForTimeout(15000);
        return evidence;

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        return { error: error.message };
    } finally {
        // Keep browser open
    }
}

main().then(r => log('Done.'));
