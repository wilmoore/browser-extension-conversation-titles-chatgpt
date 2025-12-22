# Fix: Title Copy Includes Project Name

## Bug Report

When copying "title only" format (Cmd/Ctrl+Click), only the conversation title is copied without the project name.

**Actual behavior**: "AI ownership model"
**Expected behavior**: "Śavvy AI :: Transformation Partner – AI ownership model"

## Root Cause

The `formatTitleOnly()` function in `src/content/copy-handler.ts` (lines 47-49) returns only `context.title` without prepending the project name:

```typescript
export function formatTitleOnly(context: ConversationContext): string {
  return context.title;
}
```

## Agreed Solution

1. **Change 'title' format** to include project name (same as 'full' format)
2. **Keep both formats** for backward compatibility (TITLE and FULL_CONTEXT will produce identical output)

## Implementation Steps

1. Update `formatTitleOnly()` to use the same logic as `formatFullContext()`
2. Update any existing tests for `formatTitleOnly()`
3. Run build and tests to verify fix
4. Browser verification

## Files to Modify

- `src/content/copy-handler.ts` - Update `formatTitleOnly()` function

## Files to Verify

- Tests for copy-handler (if any)
- Build output

## Definition of Done

- [x] Requirements documented
- [x] `formatTitleOnly()` includes project name when available
- [x] Tests pass (39 tests passing)
- [x] Build succeeds with no errors/warnings
- [x] Code review verification confirms fix
