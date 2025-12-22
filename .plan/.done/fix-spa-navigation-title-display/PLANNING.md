# Fix: SPA Navigation Title Display

## Branch
`fix/spa-navigation-title-display`

## Problem
When navigating to an existing conversation via SPA (clicking sidebar or using bookmark), the conversation title doesn't appear. It only shows after a manual page refresh.

## Root Cause Analysis

The issue is a **timing problem** during SPA navigation:

1. URL changes → `checkUrlChange()` detects it immediately via URL polling (500ms interval)
2. `update()` is called which invokes `getFullContext()` to parse `document.title`
3. **BUT** `document.title` still has the OLD title (ChatGPT's React hasn't updated it yet)
4. `getConversationTitle()` returns `null` because title parsing fails
5. `update()` returns early, removing any existing element
6. The MutationObserver watches `document.body`, NOT the `<title>` element in `<head>`
7. No retry mechanism exists, so the title never appears

**Why refresh works**: On full page load, by the time the content script runs at `document_idle`, the `document.title` is already correct.

## Solution

Added a dedicated MutationObserver for the `<title>` element with a "waiting for title" state machine:

### Flow
1. When URL changes and `getFullContext()` returns `null` (no valid title), set `waitingForTitle = true`
2. A separate observer watches the `<title>` element for text mutations
3. When title changes AND we're waiting, retry `update()`
4. If title is found, clear the waiting state and timeout
5. Timeout after 3 seconds to prevent indefinite waiting

### Key Changes

**`src/content/selectors.ts`**:
- Added `TITLE_WAIT_TIMEOUT: 3000` constant

**`src/content/index.ts`**:
- Added `titleObserver`, `waitingForTitle`, and `titleWaitTimer` state variables
- Added `onTitleChange()` callback that triggers update when waiting
- Added `initTitleObserver()` to observe `<title>` element mutations
- Modified `checkUrlChange()` to set waiting state when title extraction fails
- Updated `cleanup()` to clean up new observers and timers
- Updated `init()` to call `initTitleObserver()`

**`src/content/index.test.ts`** (new file):
- Tests for TIMING constants
- Tests for title observer initialization
- Tests for waiting state behavior
- Tests for rapid navigation handling
- Tests for cleanup behavior

## Edge Cases Handled

1. **Rapid navigation**: Clearing existing timeouts ensures only the latest navigation triggers updates
2. **Title never updates**: 3-second timeout prevents indefinite waiting
3. **Page unload**: All observers and timers are properly cleaned up
4. **No title element**: Graceful early return if `<title>` element doesn't exist

## Performance Impact
- Title observer is extremely lightweight (single element, simple mutations)
- Event-driven approach means zero polling overhead when not navigating
- Timeouts prevent resource leaks
- No impact on page refresh or initial load behavior

## Testing
- All 50 tests pass
- Build succeeds
- Manual verification recommended with browser extension loaded

## Related ADRs
- [005. Title Observer for SPA Navigation](../../doc/decisions/005-title-observer-for-spa-navigation.md)
