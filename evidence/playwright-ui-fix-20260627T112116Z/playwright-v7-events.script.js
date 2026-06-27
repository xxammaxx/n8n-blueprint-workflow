/**
 * Playwright v7: Direct event dispatch + diagnostic event tracking
 * Strategy: Use dblclick event, track what receives clicks, force node panel open
 */

const { chromium } = require('C:\\Users\\xxammaxx\\AppData\\Roaming\\npm\\node_modules\\@playwright\\mcp\\node_modules\\playwright');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = __dirname;
const STORAGE_STATE = 'C:\\Users\\xxammaxx\\.n8n-automation\\playwright\\n8n-storage-state.json';
const WORKFLOW_URL = 'http://192.168.1.52:5678/workflow/Sv12QTo56NoPUu2D';
const NODE_DATA_ID = 'f1aedb55-8b84-4886-85be-8a672817add5';

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

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

        // Add click tracking
        await page.evaluate(() => {
            window.__clickLog = [];
            document.addEventListener('click', (e) => {
                window.__clickLog.push({
                    tag: e.target.tagName,
                    class: e.target.className?.slice(0, 80),
                    id: e.target.id,
                    x: e.clientX,
                    y: e.clientY,
                    time: Date.now(),
                });
                if (window.__clickLog.length > 20) window.__clickLog.shift();
            }, true); // capture phase
        });

        // --- Navigate ---
        log(`Navigating to: ${WORKFLOW_URL}`);
        await page.goto(WORKFLOW_URL, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(6000);

        if (page.url().includes('/signin')) {
            log('LOGIN_REQUIRED');
            return { login: 'required' };
        }

        // --- Step 1: Diagnostic - node element structure ---
        log('Analyzing node element structure...');
        const nodeStructure = await page.evaluate((dataId) => {
            const node = document.querySelector(`[data-id="${dataId}"]`);
            if (!node) return { error: 'node_not_found' };
            
            const info = {
                tagName: node.tagName,
                className: node.className,
                dataId: node.getAttribute('data-id'),
                role: node.getAttribute('role'),
                tabindex: node.getAttribute('tabindex'),
                rect: (() => {
                    const r = node.getBoundingClientRect();
                    return { x: r.x, y: r.y, w: r.width, h: r.height };
                })(),
                style: {
                    position: getComputedStyle(node).position,
                    transform: getComputedStyle(node).transform,
                    pointerEvents: getComputedStyle(node).pointerEvents,
                    zIndex: getComputedStyle(node).zIndex,
                },
                children: Array.from(node.children).map(c => ({
                    tag: c.tagName,
                    class: c.className?.slice(0, 60),
                    text: c.textContent?.slice(0, 50),
                    rect: (() => {
                        const r = c.getBoundingClientRect();
                        return { x: r.x, y: r.y, w: r.width, h: r.height };
                    })(),
                    pointerEvents: getComputedStyle(c).pointerEvents,
                })),
                parentInfo: {
                    tag: node.parentElement?.tagName,
                    class: node.parentElement?.className?.slice(0, 60),
                    transform: getComputedStyle(node.parentElement).transform,
                },
            };
            return info;
        }, NODE_DATA_ID);
        
        log(`Node structure: ${JSON.stringify(nodeStructure, null, 2)}`);

        // --- Step 2: Get the clickable element geometry ---
        log('\n=== Attempting dblclick dispatch ===');
        
        const dispatchResult = await page.evaluate((dataId) => {
            const node = document.querySelector(`[data-id="${dataId}"]`);
            if (!node) return { error: 'node_not_found' };

            // Find the most clickable child (largest area, visible)
            let bestTarget = node;
            let bestArea = 0;
            
            const checkElement = (el) => {
                if (el.nodeType !== 1) return; // Skip text nodes
                const r = el.getBoundingClientRect();
                const area = r.width * r.height;
                if (area > bestArea && r.width > 5 && r.height > 5) {
                    bestTarget = el;
                    bestArea = area;
                }
            };
            
            checkElement(node);
            for (const child of node.children) {
                checkElement(child);
                for (const grandchild of child.children) {
                    checkElement(grandchild);
                }
            }
            
            const rect = bestTarget.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            
            // Build a comprehensive dblclick event
            const opts = {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: cx,
                clientY: cy,
                screenX: cx,
                screenY: cy,
                button: 0,
                buttons: 1,
                detail: 2, // 2 = double click
            };
            
            // Dispatch necessary event sequence
            const events = [
                new PointerEvent('pointerdown', { ...opts, pointerId: 1, pointerType: 'mouse' }),
                new MouseEvent('mousedown', opts),
                new PointerEvent('pointerup', { ...opts, pointerId: 1, pointerType: 'mouse' }),
                new MouseEvent('mouseup', opts),
                new MouseEvent('click', { ...opts, detail: 1 }),
                new PointerEvent('pointerdown', { ...opts, pointerId: 1, pointerType: 'mouse', detail: 2 }),
                new MouseEvent('mousedown', { ...opts, detail: 2 }),
                new PointerEvent('pointerup', { ...opts, pointerId: 1, pointerType: 'mouse', detail: 2 }),
                new MouseEvent('mouseup', { ...opts, detail: 2 }),
                new MouseEvent('click', { ...opts, detail: 2 }),
                new MouseEvent('dblclick', opts),
            ];
            
            for (const event of events) {
                bestTarget.dispatchEvent(event);
            }
            
            return {
                dispatched: true,
                target: bestTarget.tagName + '.' + (bestTarget.className?.split(' ')[0] || ''),
                area: bestArea,
                coords: { cx, cy },
            };
        }, NODE_DATA_ID);
        
        log(`Dispatch result: ${JSON.stringify(dispatchResult)}`);
        
        // Wait and check
        await new Promise(r => setTimeout(r, 3000));
        
        // Get click log
        const clickLog = await page.evaluate(() => window.__clickLog);
        log(`Click events captured: ${clickLog.length}`);
        clickLog.slice(-10).forEach((cl, i) => {
            log(`  [${i}] tag=${cl.tag} class=${cl.class} x=${cl.x} y=${cl.y}`);
        });

        // --- Step 3: Check panel state ---
        const panelState = await page.evaluate(() => {
            const selectors = [
                '.ndv', '.node-details-view', '[data-test-id="node-details-view"]', 
                '.node-view-wrapper', '.node-parameters',
                '.CodeMirror', '.cm-editor', '.code-node-editor',
            ];
            const results = {};
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) {
                    results[sel] = {
                        exists: true,
                        visible: el.offsetParent !== null,
                        rect: (() => {
                            const r = el.getBoundingClientRect();
                            return { x: r.x, y: r.y, w: r.width, h: r.height };
                        })(),
                    };
                }
            }
            return results;
        });
        
        log(`Panel state: ${JSON.stringify(panelState, null, 2)}`);
        
        // --- Step 4: Try n8n internal store ---
        log('\n=== Trying n8n internal methods ===');
        const internalResult = await page.evaluate((dataId) => {
            const results = {};
            
            // Try window store
            if (window.__n8nStore) {
                results.windowStore = Object.keys(window.__n8nStore);
            }
            
            // Try to find Pinia store via Vue devtools hook
            const app = document.getElementById('app')?.__vue_app__;
            if (app) {
                const pinia = app.config?.globalProperties?.$pinia;
                if (pinia && pinia._s) {
                    const stores = {};
                    for (const [key, store] of Object.entries(pinia._s)) {
                        stores[key] = {
                            stateKeys: Object.keys(store.$state || {}),
                            hasNodeView: typeof store.openNodeView === 'function',
                            hasSelectNode: typeof store.selectNode === 'function',
                        };
                    }
                    results.piniaStores = stores;
                    
                    // Try to find and call openNodeView
                    for (const [key, store] of Object.entries(pinia._s)) {
                        if (typeof store.setNodeViewSelectedNodeName === 'function') {
                            try {
                                store.setNodeViewSelectedNodeName('Format Final Result');
                                results.calledSetNodeView = key;
                            } catch (e) {
                                results.setNodeViewError = e.message;
                            }
                        }
                        if (typeof store.openNodeView === 'function') {
                            try {
                                store.openNodeView(dataId);
                                results.calledOpenNodeView = key;
                            } catch (e) {
                                results.openNodeViewError = e.message;
                            }
                        }
                    }
                }
            }
            
            return results;
        }, NODE_DATA_ID);
        
        log(`Internal result: ${JSON.stringify(internalResult, null, 2)}`);
        
        // Wait and check again
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: path.join(EVIDENCE_DIR, 'v7-final.png'), fullPage: true });

        // --- Final checks ---
        const finalPanel = await page.evaluate(() => {
            const panel = document.querySelector('.ndv, .node-details-view, [data-test-id="node-details-view"]');
            const code = document.querySelector('.CodeMirror, .cm-editor, .code-node-editor, textarea.code');
            return {
                panelVisible: !!(panel && panel.offsetParent !== null),
                codeVisible: !!(code && code.offsetParent !== null),
            };
        });
        log(`Final: panel=${finalPanel.panelVisible} code=${finalPanel.codeVisible}`);

        fs.writeFileSync(path.join(EVIDENCE_DIR, 'v7-results.json'), JSON.stringify({
            timestamp: new Date().toISOString(),
            nodeStructure,
            dispatchResult,
            clickLog,
            panelState,
            internalResult,
            finalPanel,
        }, null, 2));

        await new Promise(r => setTimeout(r, 15000));
        return { finalPanel, internalResult };

    } catch (error) {
        log(`FATAL: ${error.message}\n${error.stack}`);
        return { error: error.message };
    }
}

main().then(r => log('Done.'));
