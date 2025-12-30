# Bug: Click Handlers Not Attached After React Re-render

## Chrome Web Store Rejection Details

- **Version**: 1.1.0
- **Violation reference ID**: Red Potassium
- **Violation type**: Content Policies
- **Issue**: "click shortcuts for different copy formats functionality is not working"

## Bug Details

### Steps to Reproduce
1. Navigate to a ChatGPT conversation page
2. Wait for the extension to render the title in the footer
3. Interact with the page (scroll, send message, etc.) triggering React re-renders
4. Attempt to click on the title element
5. Notice: no copy feedback, no clipboard change

### Expected Behavior
- Clicking on title copies markdown link to clipboard
- Shift+click copies full context
- Cmd/Ctrl+click copies title only
- Cmd/Ctrl+Shift+click copies URL
- Visual tooltip feedback appears on hover and click

### Actual Behavior
- Title element displays correctly with proper attributes
- Hovering shows no tooltip
- Clicking does nothing (no copy, no feedback)
- Title text may briefly "jump back" to disclaimer text

### Environment
- Chrome Web Store review environment
- Also reproducible locally on ChatGPT.com

### Severity
**Critical** - Main functionality completely broken after React re-renders

## Root Cause Analysis

### The Bug
In `src/content/index.ts`, the `update()` function only calls `renderWithHandler()` when the **context changes**:

```typescript
const contextChanged = !contextEquals(currentContext, newContext);

if (contextChanged) {
  currentContext = newContext;
  renderWithHandler();  // This attaches handlers
}
```

### The Problem
When ChatGPT's React re-renders the footer area:
1. React replaces the DOM element with a new node
2. Our MutationObserver detects the change and calls `update()`
3. `getFullContext()` extracts title from `document.title` (unchanged)
4. `contextEquals()` returns `true` (context hasn't changed)
5. `renderWithHandler()` is NOT called
6. The new DOM element has NO event handlers attached

### Evidence
- Element exists with correct ID (`conversation-title-ext-display`)
- Element has correct data attributes (`data-title`, `data-url`, etc.)
- Element has correct ARIA attributes and cursor style
- BUT: manually attached test click handlers work (element CAN receive events)
- Extension's click and tooltip handlers are NOT attached

### Related Code Paths
- `src/content/index.ts:update()` - only renders on context change
- `src/content/index.ts:renderWithHandler()` - attaches handlers
- `src/content/title-renderer.ts:render()` - sets attributes, attaches tooltip handlers
- `src/content/copy-handler.ts:attachClickHandler()` - attaches click handlers

## Fix Strategy

### Approach: Track Element Reference
Track the actual DOM element reference and detect when it changes, not just when context changes.

### Implementation
1. Add element reference tracking in `index.ts`
2. In `update()`, check if element reference has changed
3. If element changed OR context changed, call `renderWithHandler()`

### Code Change
```typescript
// Add new variable
let currentElementRef: HTMLElement | null = null;

// In update(), after checking contextChanged:
const currentElement = getDisplayElement();
const elementChanged = currentElement !== currentElementRef ||
                       (currentElement === null && currentElementRef !== null);

if (contextChanged || elementChanged) {
  currentContext = newContext;
  renderWithHandler();
  currentElementRef = getDisplayElement();
}
```

### Cleanup
Also clear `currentElementRef` in:
- `removeElement()` calls
- `cleanup()` function

## Test Plan
1. Unit tests for element change detection
2. E2E test that:
   - Loads ChatGPT conversation
   - Verifies title renders
   - Triggers React re-render (e.g., scroll/interact)
   - Verifies click handler still works
3. Manual verification on live ChatGPT

## Related ADRs
- ADR-002: Configurable Copy Shortcuts with Chrome Storage
- ADR-007: Race Condition Guards
