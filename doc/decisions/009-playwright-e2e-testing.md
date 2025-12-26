# 009. Playwright for E2E Extension Testing

Date: 2025-12-25

## Status

Accepted

## Context

Unit tests with Vitest/jsdom can't test:
- Actual extension loading in Chrome
- chrome.* API behavior
- Options page persistence
- Content script injection on real pages

Browser extension testing requires a real browser context with the extension loaded.

## Decision

Use Playwright with custom fixtures for extension testing:

1. **Configuration** (`playwright.config.ts`):
   - `headless: false` (extensions require headed mode)
   - Single worker (extensions need sequential tests)
   - `chromium-extension` project

2. **Custom fixture** (`e2e/fixtures/extension.ts`):
   - Uses `chromium.launchPersistentContext` with extension flags
   - Extracts `extensionId` from service worker URL
   - Provides `context` and `extensionId` to tests

3. **Test patterns**:
   - Direct options page access via `chrome-extension://${extensionId}/...`
   - Mock ChatGPT page structure for content script testing

## Consequences

### Positive
- Tests real extension behavior in real browser
- Catches issues unit tests miss (permissions, CSP, manifest)
- Verifies end-to-end user flows

### Negative
- Requires headed mode (no CI without virtual display)
- Slower than unit tests
- Extension must be built first (`npm run build`)

## Alternatives Considered

1. **Puppeteer**: Less ergonomic extension support
2. **Selenium**: Heavier, more setup required
3. **Manual testing only**: Not reproducible, error-prone

## Related

- Planning: `.plan/.done/fix-gaps-verification-critical-path/`
