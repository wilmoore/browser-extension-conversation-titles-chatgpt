# 002. Configurable Copy Shortcuts with Chrome Storage

Date: 2024-12-20

## Status

Accepted

## Context

Users need to copy conversation information in different formats:
- Markdown link: `[Title](URL)`
- Title only
- Full context: `Project – Title\nURL`
- URL only

Initially, these were hardcoded to specific click modifiers. Users requested the ability to customize which format is triggered by each modifier combination.

## Decision

Implement configurable copy shortcuts using Chrome's storage.sync API with an options page.

Configuration structure:
```typescript
interface CopyPreferences {
  click: CopyFormat;        // Default: MARKDOWN
  shiftClick: CopyFormat;   // Default: FULL_CONTEXT
  modClick: CopyFormat;     // Default: TITLE
  modShiftClick: CopyFormat; // Default: URL
  audioFeedback: boolean;   // Default: false
}
```

Storage approach:
- Use `chrome.storage.sync` for cross-device preferences
- Load preferences on content script initialization
- Listen for storage changes to update preferences in real-time

## Consequences

**Positive:**
- Users can customize behavior to their workflow
- Preferences sync across devices
- Options page provides discoverability
- Default configuration matches most common use case (markdown)

**Negative:**
- Added complexity for storage management
- Options page requires additional permissions
- Must handle missing/corrupt preferences gracefully

## Alternatives Considered

1. **Hardcoded shortcuts** - Rejected as inflexible
2. **localStorage** - Rejected (doesn't sync, not available in content scripts)
3. **Context menu options** - Considered for future, but click modifiers are faster

## Related

- Planning: `.plan/.done/feature-conversation-titles-display-copy/`
