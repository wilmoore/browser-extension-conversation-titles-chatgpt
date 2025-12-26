# 007. Race Condition Guards

Date: 2025-12-25

## Status

Accepted

## Context

The extension uses multiple triggers for updates: URL polling (every 500ms) and MutationObserver for DOM changes. These can fire simultaneously, causing concurrent `update()` calls. Similarly, rapid clicks could trigger multiple clipboard operations before the first completes.

This leads to:
- Duplicate title elements being created
- Corrupted clipboard state
- Unpredictable UI behavior

## Decision

Implement guard flags to prevent concurrent execution:

1. **`updateInProgress` flag** in `src/content/index.ts`:
   - Set to `true` at function start
   - Reset to `false` in `finally` block
   - Early return if already in progress

2. **`copyInProgress` flag** in `src/content/copy-handler.ts`:
   - Prevents overlapping clipboard operations
   - Returns `false` if copy already in progress

## Consequences

### Positive
- Eliminates race conditions between URL poll and MutationObserver
- Prevents duplicate element creation
- Predictable single-threaded behavior for critical operations

### Negative
- Slightly delayed updates if triggers overlap (next poll cycle)
- Additional boolean checks on every update call

## Alternatives Considered

1. **Debouncing**: Would delay all updates, not just overlapping ones
2. **Mutex/semaphore**: Overkill for single-threaded JavaScript
3. **Removing one trigger**: Reduces reliability of detection

## Related

- Planning: `.plan/.done/fix-gaps-verification-critical-path/`
