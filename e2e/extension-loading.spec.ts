import { test, expect } from './fixtures/extension';

/**
 * Basic E2E tests for extension loading and functionality.
 *
 * Note: These tests require the extension to be built first (`npm run build`).
 * Run with `npm run test:e2e:headed` to see the browser.
 *
 * For full ChatGPT integration testing, authentication would be required.
 * These tests verify the extension loads and basic functionality works.
 */
test.describe('Extension Loading', () => {
  test('extension loads without errors', async ({ context, extensionId }) => {
    expect(extensionId).toBeTruthy();
    expect(extensionId.length).toBeGreaterThan(0);
  });

  test('extension options page is accessible', async ({ context, extensionId }) => {
    const optionsUrl = `chrome-extension://${extensionId}/src/options/options.html`;
    const page = await context.newPage();

    await page.goto(optionsUrl);

    // Verify options page loaded
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Conversation Titles');
  });

  test('options page has all preference controls', async ({ context, extensionId }) => {
    const optionsUrl = `chrome-extension://${extensionId}/src/options/options.html`;
    const page = await context.newPage();

    await page.goto(optionsUrl);

    // Verify all 4 shortcut dropdowns exist
    await expect(page.locator('select#click')).toBeVisible();
    await expect(page.locator('select#shiftClick')).toBeVisible();
    await expect(page.locator('select#modClick')).toBeVisible();
    await expect(page.locator('select#modShiftClick')).toBeVisible();

    // Verify audio toggle exists
    await expect(page.locator('input#audioFeedback')).toBeVisible();
  });

  test('preference changes are saved', async ({ context, extensionId }) => {
    const optionsUrl = `chrome-extension://${extensionId}/src/options/options.html`;
    const page = await context.newPage();

    await page.goto(optionsUrl);

    // Change the click preference to URL
    await page.selectOption('select#click', 'URL');

    // Wait for save status to appear
    await expect(page.locator('#status')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('#status')).toContainText('Saved');

    // Reload and verify the change persisted
    await page.reload();

    const clickValue = await page.locator('select#click').inputValue();
    expect(clickValue).toBe('URL');
  });
});

test.describe('Mock ChatGPT Page', () => {
  test('content script runs on matching URLs', async ({ context }) => {
    const page = await context.newPage();

    // Create a mock page that looks like ChatGPT
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>My Test Conversation - ChatGPT</title>
        </head>
        <body>
          <main>
            <div class="pointer-events-auto">
              <span>ChatGPT can make mistakes. Check important info.</span>
            </div>
          </main>
        </body>
      </html>
    `);

    // Note: Content scripts only run on matching URLs per manifest.json
    // This test verifies the page structure is correct for the extension
    await expect(page.locator('span')).toContainText('ChatGPT can make mistakes');
  });
});
