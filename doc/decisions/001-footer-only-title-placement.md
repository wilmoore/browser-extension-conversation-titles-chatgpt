# 001. Footer-Only Title Placement

Date: 2024-12-20

## Status

Accepted

## Context

The extension needed to display conversation titles in the ChatGPT UI. Initial implementation attempted multiple placement strategies:
- Top navigation bar (near ChatGPT logo)
- Footer area (replacing disclaimer text)
- Fallback floating container

The top navigation approach had issues:
- ChatGPT's header structure is complex with nested flex containers
- Sidebar navigation elements were being incorrectly targeted
- Required significant DOM manipulation that caused visual "jumps"

## Decision

Implement footer-only placement by modifying the existing disclaimer element ("ChatGPT can make mistakes...") to display the conversation title instead.

Key implementation details:
- Find the innermost text element containing disclaimer text
- Store original text for restoration on cleanup
- Replace text content directly (preserves all ChatGPT styling)
- Track element references to avoid modifying wrong elements

## Consequences

**Positive:**
- Simpler, more reliable implementation
- No visual "jumps" or layout shifts
- Inherits ChatGPT's own styling naturally
- Single render location eliminates duplicate display issues

**Negative:**
- Loses top-of-page visibility
- Footer may not be visible when scrolled up in long conversations
- Relies on ChatGPT's disclaimer element existing

## Alternatives Considered

1. **Top navigation placement** - Rejected due to complexity and sidebar interference
2. **Floating overlay** - Rejected as too intrusive and not native-looking
3. **Both top and footer** - Rejected as redundant and harder to maintain

## Related

- Planning: `.plan/.done/feature-conversation-titles-display-copy/`
