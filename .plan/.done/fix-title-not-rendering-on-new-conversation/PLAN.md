# Fix: Title Not Rendering on New Conversation

## Bug Report

**Steps to Reproduce:**
1. Open ChatGPT homepage (chatgpt.com)
2. Start a new conversation by typing and sending a message
3. Wait for the model to respond
4. Observe that URL changes to `/c/{conversation-id}`
5. Observe that document title updates to conversation title
6. Footer still shows "ChatGPT can make mistakes" instead of title

**Expected Behavior:**
Extension should display the conversation title in the footer as soon as document.title is set.

**Actual Behavior:**
Footer continues showing the disclaimer text even though:
- URL has the conversation ID
- Document title shows the real conversation title in the browser tab

**Environment:**
- Browser: Chrome
- OS: macOS
- Extension loaded via developer mode

**Severity:** High (degraded experience - core feature not working)

## Root Cause Analysis

### Code Path

1. URL polling detects URL change (`checkUrlChange()`)
2. `update()` is called
3. `getFullContext()` returns valid context (title extracted from document.title)
4. First render condition is met: `contextChanged = true` (since `currentContext` is null)
5. `currentContext = newContext` is set **before** render attempt
6. `renderWithHandler()` is called
7. `findFooter()` returns `null` (footer element doesn't exist during streaming)
8. `render()` returns `false`
9. `currentElementRef` remains `null`

### Why It Never Recovers

On subsequent MutationObserver callbacks when footer appears:
1. `update()` is called
2. `getFullContext()` returns the same valid context
3. `contextChanged = false` (contexts match)
4. `elementReplaced = false` (`currentElementRef` is null, not a real element)
5. `elementMissing = false` (`currentElementRef` is null)
6. All conditions are `false` → no render attempt

### The Bug

```typescript
// src/content/index.ts:158-161
if (contextChanged || elementReplaced || elementMissing) {
  currentContext = newContext;  // BUG: Sets context even if render will fail
  renderWithHandler();
}
```

**Missing condition:** The code doesn't handle the case where:
- `currentContext` is set (we know what title to show)
- `currentElementRef` is `null` (but we haven't successfully rendered it)

## Fix

Add a new condition to detect failed initial render:

```typescript
// Detect if we have context but failed to render (footer didn't exist)
const needsInitialRender = currentContext !== null && currentElementRef === null;

if (contextChanged || elementReplaced || elementMissing || needsInitialRender) {
  currentContext = newContext;
  renderWithHandler();
}
```

This ensures the extension retries rendering when:
- We have valid context
- But no element was successfully rendered

## Test Plan

1. Unit test: Verify `update()` retries render when `currentElementRef` is null
2. E2E test: Start new conversation, verify title renders after streaming completes
3. Manual test: Reproduce original bug scenario and confirm fix

## Related ADRs

- ADR-005: Title Observer for SPA Navigation
- ADR-007: Race Condition Guards
- ADR-010: DOM Element Reference Tracking (this fix extends that pattern)
