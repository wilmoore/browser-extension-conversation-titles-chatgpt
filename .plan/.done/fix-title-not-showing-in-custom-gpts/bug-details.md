# Bug: Title Not Showing in Custom GPTs

## Summary
Conversation titles display consistently everywhere except custom GPT conversations.

## Reproduction Steps
1. Navigate to chatgpt.com
2. Open a custom GPT conversation (e.g., https://chatgpt.com/g/g-68b9303383588191928d212af0971c9a-spec-forge/c/694d83d5-e5ac-832f-969e-b4b1b8a744f2)
3. Observe the footer area - shows "New version of GPT available - Continue chatting to use the old version, or start a new chat for the latest version."
4. Conversation title does NOT appear

## Expected Behavior
The conversation title should appear in the footer area, replacing whatever text is there - consistent with all other conversation types.

## Actual Behavior
Footer shows the GPT version message, title is not displayed.

## Root Cause Analysis

### Problem
Footer detection relies on **hardcoded text patterns** that only match the standard disclaimer:

| File | Line | Pattern |
|------|------|---------|
| `placement-manager.ts` | 38 | `element.innerText?.includes('ChatGPT can make mistakes')` |
| `placement-manager.ts` | 63 | `element.innerText === 'ChatGPT can make mistakes. Check important info.'` |
| `title-renderer.ts` | 453, 461 | `textContent?.includes('ChatGPT can make mistakes')` |
| `selectors.ts` | 57-60 | `DISCLAIMER_PATTERNS` only has standard disclaimer |

Custom GPTs can show different footer text:
- "New version of GPT available - Continue chatting to use the old version, or start a new chat for the latest version."
- Possibly other messages

When text doesn't match, `findFooter()` returns `null` → title never renders.

### Solution Approach
**Structural/positional detection** instead of text-pattern matching:
- Find footer by DOM position (within `#thread-bottom-container`, below chat input)
- Replace whatever text is there, regardless of content
- Remove dependency on `DISCLAIMER_PATTERNS` for element detection

## Environment
- Browser: Chrome (from screenshot)
- URL pattern: `/g/[gpt-id]/c/[conversation-id]`
- Footer text: "New version of GPT available..."

## Severity
**High** - Degraded experience for custom GPT users

## Related ADRs
- ADR-001: Footer-Only Title Placement (this fix maintains footer placement)
- ADR-010: DOM Element Reference Tracking (continue using element tracking)
