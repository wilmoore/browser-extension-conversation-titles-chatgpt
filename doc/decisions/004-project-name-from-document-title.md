# 004. Extract Project Name from Document Title

Date: 2025-12-20

## Status

Accepted

## Context

For ChatGPT project conversations, the extension was extracting the project name from the URL slug (e.g., `business-ideas` → `business ideas`), which resulted in lowercase text. However, ChatGPT's document title already contains the properly-cased project name in the format:

```
{ProjectName} - {ConversationTitle} - ChatGPT
```

This caused duplication where the display showed:
```
business ideas – Business Ideas - Consulting firms and AI
```

Instead of the expected:
```
Business Ideas – Consulting firms and AI
```

## Decision

Extract both the project name and conversation title from the document title rather than the URL slug:

1. Parse document title by removing the ` - ChatGPT` suffix
2. Split the remaining string on ` - ` delimiter
3. First segment = project name (properly cased)
4. Remaining segments (joined) = conversation title

This ensures:
- Project name uses the canonical casing from ChatGPT
- Conversation title is the specific part only (excludes project prefix)
- No duplication in display

## Consequences

**Positive:**
- Display matches user expectations with proper casing
- TITLE copy format returns only the conversation-specific part
- Consistent with how ChatGPT presents the information

**Negative:**
- If ChatGPT changes the document title format, parsing may break
- Project names containing hyphens could be mis-parsed (edge case)

## Alternatives Considered

1. **URL slug with Title Case conversion** - Rejected because heuristic casing is unreliable for proper nouns and brand names
2. **Deduplicate by checking if title starts with project name** - Rejected because it doesn't solve the casing issue

## Related

- Planning: `.plan/.done/fix-title-display-duplication/`
- ADR 003: Document Title Parsing Strategy (original parsing approach)
