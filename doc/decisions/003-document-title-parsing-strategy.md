# 003. Document Title Parsing Strategy

Date: 2024-12-20

## Status

Accepted

## Context

ChatGPT displays conversation titles in multiple places:
- Browser tab/document title
- Sidebar navigation (active conversation)
- URL for project conversations

Initial implementation used DOM selectors to find titles in the sidebar, but this had issues:
- Selectors were fragile (ChatGPT uses obfuscated class names)
- Wrong titles could be extracted ("ChatGPT", project names only)
- Timing issues with DOM updates

## Decision

Use document.title as the primary source for conversation titles, with URL parsing for project context.

Parsing strategy:
1. Extract from `document.title` (format: "Title - ChatGPT" or "ChatGPT – Title")
2. Strip ChatGPT prefix and suffix using regex
3. For project conversations, extract project slug from URL pattern: `/g/g-p-{id}-{slug}/c/`
4. Skip rendering if title equals "ChatGPT" or matches project slug only
5. Convert project slug to display format (domain-like names use dots)

Validation rules:
- Title must not equal "ChatGPT" (case-insensitive)
- Title must not equal project slug (if in project)
- Empty/whitespace titles are rejected

## Consequences

**Positive:**
- More reliable than DOM scraping
- Works immediately on page load (no waiting for DOM)
- Handles all ChatGPT title formats (dash, en-dash, pipe)
- Correctly handles titles containing "ChatGPT" (e.g., "ChatGPT API guide")

**Negative:**
- Still depends on ChatGPT's title format
- Project name extraction relies on URL pattern stability
- Domain-like name detection uses heuristics (TLD matching)

## Alternatives Considered

1. **DOM-only approach** - Rejected due to selector fragility
2. **API interception** - Too complex, not necessary
3. **Strict title validation** - Initially rejected titles containing "ChatGPT", fixed to only reject exact matches

## Related

- Planning: `.plan/.done/feature-conversation-titles-display-copy/`
