# Implementation Plan: Chrome Trust & Reputation Hardening

## Overview

This is a trust-focused patch release (v1.3.2) that reduces host permissions, verifies privacy claims, updates icons, and captures new screenshots. No new features.

## Implementation Steps

### Step 1: Remove Legacy Host from Manifest

**File:** `public/manifest.json`

Remove `https://chat.openai.com/*` from content_scripts matches:

```diff
"content_scripts": [
  {
    "matches": [
-     "https://chatgpt.com/*",
-     "https://chat.openai.com/*"
+     "https://chatgpt.com/*"
    ],
```

### Step 2: Update URL Regex in Selectors

**File:** `src/content/selectors.ts:80`

Update `CONVERSATION_URL_REGEX` to only match chatgpt.com:

```diff
export const CONVERSATION_URL_REGEX =
-  /^https:\/\/(chatgpt\.com|chat\.openai\.com)(\/g\/[^/]+)?\/c\/([a-zA-Z0-9-]+)/;
+  /^https:\/\/chatgpt\.com(\/g\/[^/]+)?\/c\/([a-zA-Z0-9-]+)/;
```

### Step 3: Update Tests

Search for any tests using `chat.openai.com` URLs and update them to use `chatgpt.com`.

**Files to check:**
- `src/content/*.test.ts`

### Step 4: Update Store Listing Documentation

**File:** `.plan/.done/feature-chrome-web-store-publication/store-listing.md`

Update SUPPORTED SITES section:
```diff
SUPPORTED SITES
-• chatgpt.com
-• chat.openai.com
+• chatgpt.com
```

### Step 5: Version Bump

**Files:** `package.json` and `public/manifest.json`

Bump version from `1.3.1` to `1.3.2`.

### Step 6: Create Privacy Verification ADR

Create `doc/decisions/014-local-only-privacy-verification.md` documenting:
- Code audit findings (no network requests)
- Clipboard write-only verification
- No external dependencies

### Step 7: Create ChatGPT-Inspired Icon

Design and export icons at 16px, 48px, and 128px sizes.

**Design approach:** Speech bubble with "T" or title indicator, using ChatGPT's color palette (teal/green) but clearly distinct.

**Output:** `public/icons/icon16.png`, `public/icons/icon48.png`, `public/icons/icon128.png`

### Step 8: Capture Store Screenshots

Use Playwright MCP to capture screenshots showing:
1. Extension in action on a conversation page
2. Title displayed in footer
3. Copy tooltip visible (hover state)

**Output:** `docs/screenshots/` or similar directory

### Step 9: Verify Build & Tests

Run:
```bash
npm run test:run
npm run build
```

## Files Changed

| File | Change |
|------|--------|
| `public/manifest.json` | Remove legacy host, bump version |
| `package.json` | Bump version |
| `src/content/selectors.ts` | Update URL regex |
| `src/content/*.test.ts` | Update any chat.openai.com references |
| `.plan/.done/feature-chrome-web-store-publication/store-listing.md` | Update supported sites |
| `doc/decisions/014-local-only-privacy-verification.md` | New ADR |
| `public/icons/*.png` | New icon assets |
| `docs/screenshots/*.png` | New screenshot assets |

## Verification Checklist

- [ ] `npm run test:run` passes
- [ ] `npm run build` succeeds
- [ ] Extension loads in Chrome without errors
- [ ] Content script runs on chatgpt.com
- [ ] Content script does NOT run on chat.openai.com (verify redirect behavior)
- [ ] Icons render clearly at all sizes
- [ ] Screenshots show extension functionality clearly

## Risk Assessment

**Low risk:**
- Removing legacy host is safe because chat.openai.com redirects to chatgpt.com
- No functional changes to extension behavior
- Tests verify URL pattern matching still works
- Icon/screenshot changes are asset-only, no code impact
