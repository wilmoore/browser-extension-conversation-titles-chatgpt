# Gap Analysis & Verification - Critical Path

**Branch:** `fix/gaps-verification-critical-path`
**Status:** Completed

## Summary

This branch addresses critical gaps in requirements coverage, tests, and edge cases for the Conversation Titles for ChatGPT browser extension.

## Completed Work

### 1. Bug Fix: TITLE Copy Format

**File:** `src/content/copy-handler.ts`

Fixed `formatTitleOnly()` to return only the conversation-specific part (excluding project name), per the locked requirements in `.plan/fix-title-display-duplication/PLAN.md`.

- **Before:** `Business Ideas – Consulting firms and AI`
- **After:** `Consulting firms and AI` (conversation part only)

### 2. Unit Tests for title-renderer.ts

**New File:** `src/content/title-renderer.test.ts`

Added 37 comprehensive tests for the 459-line module:
- `render()` function behavior
- `removeElement()` cleanup and restoration
- `getDisplayElement()` retrieval
- Tooltip hover behavior (show/hide timers)
- Tooltip content and format labels
- `showTooltipFeedback()` highlighting
- Platform detection (Mac vs Windows/Linux)
- `setTooltipPreferences()` updates

### 3. Unit Tests for placement-manager.ts

**New File:** `src/content/placement-manager.test.ts`

Added 13 tests for the 72-line module:
- `findFooter()` primary approach (pointer-events-auto)
- FOOTER_SELECTORS fallback chain
- Visibility checks (display, visibility, opacity)
- Disclaimer text detection
- Edge cases (nested structures, multiple elements)

### 4. Race Condition Fixes

**Files Modified:**
- `src/content/index.ts` - Added `updateInProgress` guard
- `src/content/copy-handler.ts` - Added `copyInProgress` guard

Prevents concurrent `update()` calls between URL poll and title observer, and rapid clipboard operations.

### 5. Memory Leak Fixes

**Files Modified:**
- `src/storage/preferences.ts` - Returns cleanup function from `onPreferencesChange()`
- `src/content/copy-handler.ts` - Added `attachedElements` WeakSet
- `src/content/index.ts` - Stores and calls cleanup function

Prevents:
- Preference change listeners from accumulating
- Click handlers from attaching multiple times
- Cleanup properly called on unload

### 6. ARIA Accessibility

**Files Modified:**
- `src/content/title-renderer.ts` - Added ARIA attributes
- `public/_locales/en/messages.json` - Added `ariaClickToCopy` key

Added accessibility attributes:
- Tooltip: `role="tooltip"`, `aria-live="polite"`
- Title element: `role="button"`, `aria-label`, `tabindex="0"`

### 7. Playwright E2E Testing Setup

**New Files:**
- `playwright.config.ts` - Playwright configuration
- `e2e/fixtures/extension.ts` - Extension loading fixture
- `e2e/extension-loading.spec.ts` - Basic E2E tests

**Modified:**
- `package.json` - Added e2e test scripts

E2E tests verify:
- Extension loads without errors
- Options page is accessible
- All preference controls exist
- Preference changes are saved

## Test Results

- **Unit Tests:** 133 passing
- **Test Files:** 6 (up from 4)
- **New Tests:** 50+ added

## Files Changed

| File | Changes |
|------|---------|
| `src/content/copy-handler.ts` | Bug fix, race guard, handler tracking |
| `src/content/index.ts` | Race guard, cleanup function |
| `src/storage/preferences.ts` | Returns cleanup function |
| `src/content/title-renderer.ts` | ARIA accessibility attributes |
| `src/content/index.test.ts` | Added removeListener mock |
| `public/_locales/en/messages.json` | Added ariaClickToCopy |
| `package.json` | Added e2e scripts |

## New Files

| File | Purpose |
|------|---------|
| `src/content/title-renderer.test.ts` | Unit tests (37 tests) |
| `src/content/placement-manager.test.ts` | Unit tests (13 tests) |
| `playwright.config.ts` | E2E configuration |
| `e2e/fixtures/extension.ts` | Extension fixture |
| `e2e/extension-loading.spec.ts` | E2E tests |

## Acceptance Criteria

- [x] TITLE copy excludes project prefix
- [x] FULL_CONTEXT copy includes project name
- [x] `title-renderer.ts` has comprehensive unit tests
- [x] `placement-manager.ts` has comprehensive unit tests
- [x] No race conditions in update/copy/preferences
- [x] No memory leaks (listeners cleaned up)
- [x] ARIA labels on interactive elements
- [x] E2E test infrastructure set up
- [x] All existing tests still pass
- [x] Build succeeds without errors

## Related ADRs

- [007. Race Condition Guards](../../doc/decisions/007-race-condition-guards.md)
- [008. Memory Leak Prevention](../../doc/decisions/008-memory-leak-prevention.md)
- [009. Playwright E2E Testing](../../doc/decisions/009-playwright-e2e-testing.md)
