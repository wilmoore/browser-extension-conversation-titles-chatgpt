# 006. In-Tooltip Copy Feedback with Shortcut Highlighting

Date: 2025-12-22

## Status

Accepted

## Context

The extension provides multiple copy formats accessible via modifier key combinations (Click, Shift+Click, Cmd+Click, Cmd+Shift+Click). Users needed clear feedback about:
1. Whether the copy succeeded
2. Which format was copied

The original implementation used a floating "Copied!" badge that appeared above the element. While functional, this approach:
- Didn't indicate which shortcut/format was used
- Added a separate DOM element for feedback
- Could visually conflict with the tooltip on hover

## Decision

Replace the floating "Copied!" badge with in-tooltip highlighting that:

1. **Auto-shows the tooltip** on copy, even if the user wasn't hovering
2. **Highlights only the specific shortcut used** (e.g., "⌘: title" gets a green pill background)
3. **Prepends a checkmark** (✓) to the highlighted shortcut for clear success indication
4. **Fades out after 800ms** unless the user is hovering

The tooltip structure was changed from plain text to HTML with individual `<span>` elements per shortcut, each with a `data-shortcut` attribute for targeted highlighting.

## Consequences

### Positive
- **Clear feedback**: Users see exactly which shortcut they used
- **Unified UI**: Tooltip serves dual purpose (hint + feedback) without extra elements
- **Learnable**: Repeated use reinforces the shortcut → format mapping
- **Consistent timing**: 800ms duration matches user expectations

### Negative
- **Increased complexity**: Tooltip state management now tracks highlighting, timers, and hover state
- **DOM manipulation**: Must store/restore original text when adding/removing checkmark

## Alternatives Considered

### 1. Flash entire tooltip
Rejected: Doesn't indicate which specific shortcut was used.

### 2. Replace tooltip with format name
Rejected: Loses the shortcut reference that helps users learn the system.

### 3. Keep "Copied!" badge alongside tooltip
Rejected: Visual clutter; two feedback mechanisms for one action.

### 4. Bold + color change only
Rejected: At 11px font size, bold weight change is barely visible; background highlight provides better contrast.

## Related

- Planning: `.plan/.done/feature-tooltip-copy-feedback/`
- Related ADR: [002-configurable-copy-shortcuts.md](002-configurable-copy-shortcuts.md)
