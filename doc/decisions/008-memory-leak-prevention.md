# 008. Memory Leak Prevention with Cleanup Functions and WeakSet

Date: 2025-12-25

## Status

Accepted

## Context

Content scripts run for the lifetime of the page. Without proper cleanup:
- Event listeners accumulate on `chrome.storage.onChanged`
- Click handlers attach multiple times to the same element
- Preference change callbacks pile up

This degrades performance over time and can cause duplicate event handling.

## Decision

Implement three memory leak prevention patterns:

1. **Cleanup function from `onPreferencesChange()`**:
   ```typescript
   export function onPreferencesChange(callback): () => void {
     chrome.storage.onChanged.addListener(listener);
     return () => chrome.storage.onChanged.removeListener(listener);
   }
   ```

2. **WeakSet for handler tracking** in `copy-handler.ts`:
   ```typescript
   const attachedElements = new WeakSet<HTMLElement>();
   if (attachedElements.has(element)) return;
   attachedElements.add(element);
   ```

3. **Cleanup on page unload** in `index.ts`:
   - Store cleanup function reference
   - Call on `beforeunload` event

## Consequences

### Positive
- No listener accumulation over page lifetime
- WeakSet allows garbage collection of removed elements
- Clean teardown on navigation

### Negative
- Slightly more complex initialization/cleanup flow
- Need to track cleanup function references

## Alternatives Considered

1. **Named functions for removeEventListener**: Requires storing function references
2. **AbortController**: Not supported for chrome.storage API
3. **Single global listener**: Makes per-feature cleanup harder

## Related

- Planning: `.plan/.done/fix-gaps-verification-critical-path/`
