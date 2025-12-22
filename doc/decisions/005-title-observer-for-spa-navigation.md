# 005. Title Observer for SPA Navigation

Date: 2025-12-22

## Status

Accepted

## Context

When users navigate between conversations in ChatGPT via SPA navigation (clicking sidebar links or using bookmarks), the conversation title extension fails to display the title. The title only appears after a manual page refresh.

The root cause is a timing issue: the URL changes before `document.title` is updated by ChatGPT's React application. The extension's URL polling (500ms interval) detects the URL change immediately and calls `update()`, but `document.title` still contains the previous conversation's title, causing title extraction to fail and return `null`.

The existing MutationObserver watches `document.body` for DOM changes, but `document.title` resides in `<head>`, so title updates are not detected.

## Decision

Implement a dedicated MutationObserver for the `<title>` element with a "waiting for title" state machine:

1. After URL change detection, if title extraction fails on a conversation page, enter a "waiting" state
2. Observe the `<title>` element for mutations (`childList`, `characterData`, `subtree`)
3. When the title element changes while in waiting state, retry the update
4. Implement a 3-second timeout to prevent indefinite waiting
5. Clear waiting state when title is successfully extracted or on timeout

## Consequences

### Positive

- Event-driven approach is more efficient than polling
- Minimal CPU overhead when not navigating
- Title appears as soon as `document.title` updates (immediate response)
- Timeout prevents edge cases from causing memory leaks
- Clean integration with existing architecture

### Negative

- Adds another MutationObserver (minimal overhead)
- Adds state management for waiting flag and timeout
- Slightly more complex cleanup logic

## Alternatives Considered

### Polling Retry with Backoff

Retry title extraction on a timer with exponential backoff when it fails.

**Rejected because**: Causes unnecessary CPU usage during polling, less responsive than event-driven approach, more complex to tune intervals correctly.

### Extended DOM Observer

Expand the existing body MutationObserver to watch for sidebar changes that might indicate title updates.

**Rejected because**: `document.title` is in `<head>`, not `<body>`, so this doesn't directly solve the problem. Would require heuristics to guess when title might be ready.

### Intercept History API

Override `history.pushState` and `history.replaceState` to detect SPA navigation earlier.

**Rejected because**: Doesn't solve the timing issue (title still updates after navigation), more invasive approach, could conflict with ChatGPT's code.

## Related

- Planning: `.plan/.done/fix-spa-navigation-title-display/`
- Related: [003. Document Title Parsing Strategy](003-document-title-parsing-strategy.md)
