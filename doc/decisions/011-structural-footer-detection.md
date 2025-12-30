# 011. Structural Footer Detection

Date: 2025-12-30

## Status

Accepted

## Context

The extension displays conversation titles by replacing the footer disclaimer text. The original implementation relied on text-pattern matching to locate the footer element, specifically looking for "ChatGPT can make mistakes".

This approach failed for custom GPT conversations because they display different footer text:
- "New version of GPT available - Continue chatting to use the old version, or start a new chat for the latest version."
- Potentially other messages in different locales or contexts

When the text pattern didn't match, `findFooter()` returned `null` and titles never rendered.

## Decision

Replace text-pattern detection with structural/positional detection using ChatGPT's semantic class marker:

```typescript
export const FOOTER_STRUCTURAL_SELECTOR = '[class*="vt-disclaimer"]';
```

The `vt-disclaimer` class (from `view-transition-name:var(--vt-disclaimer)`) is ChatGPT's semantic marker for the disclaimer/footer area, regardless of text content. This selector works for:
- Standard conversations with disclaimer text
- Custom GPTs with version messages
- Any future footer variations

Additionally:
- Remove `isDisclaimerElement()` check from render flow
- Rename `findDisclaimerTextElement()` to `findFooterTextElement()`
- Store `innerHTML` for complex structures (GPT version message with icons/links) to enable proper restoration
- Keep `DISCLAIMER_PATTERNS` for backwards compatibility documentation only

## Consequences

### Positive

- Title rendering works for all conversation types (standard, custom GPT, projects)
- More stable than text patterns (text can be localized, changed, etc.)
- Simpler detection logic (structural vs text matching)
- Fallback to `#thread-bottom-container` provides additional safety

### Negative

- Dependency on ChatGPT's internal class naming (`vt-disclaimer`)
- If ChatGPT removes this class pattern, fallback must handle it
- Complex footer structures require `innerHTML` storage/restoration

## Alternatives Considered

1. **Add more text patterns** - Would require ongoing maintenance as ChatGPT adds new messages; doesn't scale
2. **Position-based detection** (nth-child, etc.) - Too fragile, breaks with layout changes
3. **Container-only approach** (`#thread-bottom-container`) - Less precise, could match wrong elements

## Related

- Planning: `.plan/.done/fix-title-not-showing-in-custom-gpts/`
- ADR-001: Footer-Only Title Placement (this fix maintains that decision)
- ADR-010: DOM Element Reference Tracking (continues using element tracking)
