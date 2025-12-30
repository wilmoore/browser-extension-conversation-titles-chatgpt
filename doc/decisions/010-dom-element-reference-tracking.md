# 010. DOM Element Reference Tracking for React Re-render Detection

Date: 2025-12-26

## Status

Accepted

## Context

The extension replaces ChatGPT's footer disclaimer text with the conversation title and attaches click handlers for copy functionality. However, ChatGPT uses React which may re-render the footer area at any time, replacing the DOM node we modified.

When React replaces a DOM node:
1. Our modified element is removed from the DOM
2. A new, unmodified element takes its place
3. Our `update()` function runs (triggered by MutationObserver)
4. Context extraction returns the same title/URL (document.title unchanged)
5. `contextEquals()` returns true, so we skip re-rendering
6. The new element has no click handlers attached

This caused the Chrome Web Store rejection (violation: "Red Potassium") with the issue: "click shortcuts for different copy formats functionality is not working."

## Decision

Track the actual DOM element reference alongside the context data. In `update()`, check not just if context changed, but also if the element was replaced or disconnected.

Implementation:
```typescript
let currentElementRef: HTMLElement | null = null;

function update(): void {
  // ... existing checks ...

  const currentElement = getDisplayElement();
  const elementReplaced =
    currentElementRef !== null &&
    (currentElement === null || currentElement !== currentElementRef);

  const elementMissing =
    currentContext !== null &&
    currentElementRef !== null &&
    !currentElementRef.isConnected;

  if (contextChanged || elementReplaced || elementMissing) {
    currentContext = newContext;
    renderWithHandler();
  }
}
```

## Consequences

### Positive
- Click handlers are reliably re-attached after React re-renders
- Solves the Chrome Web Store rejection issue
- Uses native DOM APIs (`isConnected`, reference comparison) - no polling needed
- Minimal performance overhead - just reference comparisons
- Works regardless of what triggers the re-render

### Negative
- Additional state to track and clean up
- Slightly more complex update logic
- Element reference must be cleared in all cleanup paths

## Alternatives Considered

### 1. Re-attach handlers on every MutationObserver callback
- Rejected: Would cause duplicate handler attachment, performance issues

### 2. Use event delegation on document.body
- Rejected: Would require different click handler architecture, less reliable

### 3. Poll for element existence
- Rejected: Wasteful, introduces latency, MutationObserver already triggers updates

### 4. Store handler reference and check if still attached
- Rejected: No reliable way to check if an event listener is attached to an element

## Related

- Planning: `.plan/.done/fix-click-handlers-not-attached-after-react-rerender/`
- ADR-007: Race Condition Guards (related guard pattern)
- ADR-008: Memory Leak Prevention (cleanup pattern)
