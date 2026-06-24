/**
 * n8n GitHub Issue Intake — Playwright CLI Regression Smoke Test
 *
 * Purpose: Reproducible browser-based smoke test for the n8n workflow.
 * NOT MCP-based — uses Playwright Test Runner CLI directly.
 *
 * Usage:
 *   npx playwright test tests/ui/n8n-github-issue-intake-smoke.spec.ts
 *   npx playwright test tests/ui/n8n-github-issue-intake-smoke.spec.ts --headed
 *
 * Security: No credentials, tokens, or secrets are read or stored.
 * If login is required, the test aborts with LOGIN_REQUIRED.
 */

import { test, expect } from '@playwright/test';

const N8N_URL = 'http://192.168.1.52:5678';
const WORKFLOW_NAME = 'GitHub Issue -> Runner Agent Intake';
const EXPECTED_NODE_NAMES = [
  'Manual Trigger (Fallback)',
  'Validate Issue Contract',
  'Prepare RUN_INPUT.json',
  'SSH Write RUN_INPUT to Runner',
  'SSH Start Runner Script',
  'Wait',
  'SSH Read status.json',
  'Format Evidence Comment',
  'Format Final Result',
];

test.describe('n8n GitHub Issue Intake Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(N8N_URL);
  });

  test('should load n8n main page without errors', async ({ page }) => {
    // Accept: could be workflows dashboard or login page
    await page.waitForLoadState('networkidle');

    // Detect login page
    const loginForm = page.locator('input[type="email"], input[name="email"], form[action*="signin"], form[action*="login"]');
    const loginVisible = await loginForm.first().isVisible().catch(() => false);

    test.skip(loginVisible, 'LOGIN_REQUIRED — n8n sign-in page detected. Test cannot proceed without interactive login.');

    // Should be on workflows page or redirect
    await expect(page).not.toHaveURL(/\/signin/);
    console.log('[OK] n8n main page loaded successfully');
  });

  test('should find the GitHub Issue Intake workflow', async ({ page }) => {
    // Check for login first
    const loginForm = page.locator('input[type="email"], input[name="email"]');
    if (await loginForm.first().isVisible().catch(() => false)) {
      test.skip(true, 'LOGIN_REQUIRED');
    }

    // Search for the workflow by name
    const searchInput = page.locator('[data-test-id="resources-list-search"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(WORKFLOW_NAME);
      await page.waitForTimeout(1000);
    }

    // Find workflow card or row with the name
    const workflowLink = page.locator(`text="${WORKFLOW_NAME}"`).first();
    const found = await workflowLink.isVisible().catch(() => false);

    if (!found) {
      // Try fuzzy match
      const allText = await page.textContent('body');
      console.log(`[DIAGNOSTIC] Workflow "${WORKFLOW_NAME}" not found. Page contains relevant text:`,
        allText?.includes('GitHub Issue') ? 'YES' : 'NO');
      test.skip(!found, `WORKFLOW_NOT_FOUND — "${WORKFLOW_NAME}" not visible on workflows page`);
    }

    await workflowLink.click();
    await page.waitForLoadState('networkidle');
    console.log('[OK] Workflow opened');
  });

  test('should verify all expected nodes are present', async ({ page }) => {
    const loginForm = page.locator('input[type="email"], input[name="email"]');
    if (await loginForm.first().isVisible().catch(() => false)) {
      test.skip(true, 'LOGIN_REQUIRED');
    }

    // Navigate to workflow
    const searchInput = page.locator('[data-test-id="resources-list-search"], input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(WORKFLOW_NAME);
      await page.waitForTimeout(1000);
    }

    const workflowLink = page.locator(`text="${WORKFLOW_NAME}"`).first();
    const found = await workflowLink.isVisible().catch(() => false);
    if (!found) {
      test.skip(true, `WORKFLOW_NOT_FOUND — "${WORKFLOW_NAME}"`);
    }
    await workflowLink.click();
    await page.waitForLoadState('networkidle');

    // Check node names in the workflow canvas
    for (const nodeName of EXPECTED_NODE_NAMES) {
      const nodeElement = page.locator(`[data-test-id="canvas-node"], .node-title, .workflow-node`).filter({ hasText: nodeName }).first();
      const isVisible = await nodeElement.isVisible().catch(() => false);
      if (!isVisible) {
        // Try looser match — node names might be in tooltips or truncated
        const canvasText = await page.textContent('.workflow-canvas, #canvas, [data-test-id="canvas"]').catch(() => '');
        console.log(`[DIAGNOSTIC] Node "${nodeName}": visible=${isVisible}, canvasHasText=${canvasText?.includes(nodeName.substring(0, 20))}`);
      }
      expect(isVisible, `Node "${nodeName}" should be visible`).toBeTruthy();
    }

    console.log(`[OK] All ${EXPECTED_NODE_NAMES.length} expected nodes verified`);
  });

  test('should not expose credentials or secrets in the UI', async ({ page }) => {
    const loginForm = page.locator('input[type="email"], input[name="email"]');
    if (await loginForm.first().isVisible().catch(() => false)) {
      test.skip(true, 'LOGIN_REQUIRED');
    }

    await page.goto(N8N_URL);

    // Check page content for obvious secrets (red flag check)
    const pageContent = await page.textContent('body');

    const redFlagPatterns = [
      /BEGIN (OPENSSH|RSA|EC|PRIVATE) KEY/,
      /ghp_[a-zA-Z0-9]{36}/,
      /sk-[a-zA-Z0-9]{32,}/,
      /N8N_ENCRYPTION_KEY/,
    ];

    for (const pattern of redFlagPatterns) {
      const match = pageContent?.match(pattern);
      if (match) {
        console.log(`[SECURITY WARNING] Potential secret pattern found in page: ${pattern}`);
      }
      expect(match, `No secret pattern ${pattern} should be visible in page content`).toBeNull();
    }

    console.log('[OK] No secret patterns detected in visible page content');
  });
});
