# Feature: Tooltip Copy Feedback

## Branch
`feature/tooltip-copy-feedback`

## Summary
Replace the floating "Copied!" badge with an in-tooltip highlight that flashes the specific shortcut used during copy operations.

## User Story
As a user, when I copy content using any modifier combination (click, ⇧+click, ⌘+click, ⌘⇧+click), I want to see the tooltip appear and highlight the specific shortcut I used, so I get clear visual confirmation of what was copied.

## Requirements

### Behavior
1. **Auto-show tooltip on copy** - Tooltip appears immediately when copy occurs, even if user wasn't hovering
2. **Highlight specific shortcut** - Only the shortcut used is highlighted (e.g., "⌘: title" when ⌘+click)
3. **Inverted pill style** - Highlighted shortcut shows white text on green background (#10a37f)
4. **800ms visibility** - Tooltip remains visible for 800ms after copy, then fades out
5. **Replaces badge** - Remove the current floating "Copied!" indicator

### Preserved Behavior
- Text color flash on the title element remains
- Optional audio feedback remains
- Tooltip hover behavior unchanged (still shows on hover)

## Design Decisions

### Why inverted pill style?
- Maximum visual contrast at small font size (11px)
- Familiar UI pattern (similar to VS Code, Figma shortcut hints)
- Clean visual separation without disrupting tooltip readability

### Why 800ms duration?
- Matches previous "Copied!" badge timing for consistency
- Long enough to register, short enough to feel responsive
- Prevents visual conflicts during rapid navigation

### Why auto-show?
- Ensures feedback is always visible regardless of mouse position
- Users don't need to hover to confirm copy succeeded
- More intuitive than requiring hover + click simultaneously

## Technical Approach

### Tooltip Structure Update
Current: `"Click: md • ⇧: full • ⌘: title • ⌘⇧: url"`

New structure needs individual `<span>` elements per shortcut:
```html
<span data-shortcut="click">Click: md</span> •
<span data-shortcut="shift">⇧: full</span> •
<span data-shortcut="mod">⌘: title</span> •
<span data-shortcut="mod-shift">⌘⇧: url</span>
```

### Shortcut Mapping
| User Action | Shortcut Key | Data Attribute |
|-------------|--------------|----------------|
| Plain click | `click` | `data-shortcut="click"` |
| Shift+click | `shiftClick` | `data-shortcut="shift"` |
| Cmd/Ctrl+click | `modClick` | `data-shortcut="mod"` |
| Cmd/Ctrl+Shift+click | `modShiftClick` | `data-shortcut="mod-shift"` |

### Animation Sequence
1. Copy triggered → determine which shortcut was used
2. Force tooltip visible (opacity: 1, positioned above element)
3. Add highlight class to matching `<span>` (green bg, white text, border-radius)
4. Hold for 800ms
5. Remove highlight class, fade tooltip out over 150ms
6. Clean up / remove tooltip after fade

## Files to Modify

1. **src/content/title-renderer.ts**
   - Update `generateTooltip()` to return structured HTML with spans
   - Add `highlightShortcut(key)` function
   - Add `showTooltipWithFeedback(element, shortcutKey)` function

2. **src/content/feedback.ts**
   - Remove `showCopiedIndicator()` function
   - Update `showCopyFeedback()` to call tooltip highlight instead
   - Keep `showVisualFeedback()` and `playAudioFeedback()`

3. **src/content/copy-handler.ts**
   - Pass shortcut key to feedback function

4. **src/content/selectors.ts**
   - Add TOOLTIP_HIGHLIGHT_DURATION constant (800)

## Test Cases

1. Plain click shows tooltip with "Click: md" highlighted
2. Shift+click shows tooltip with "⇧: full" highlighted
3. Cmd+click shows tooltip with "⌘: title" highlighted
4. Cmd+Shift+click shows tooltip with "⌘⇧: url" highlighted
5. Tooltip auto-appears even when not hovering
6. Tooltip fades after 800ms
7. Text color flash still occurs
8. Audio feedback still works (when enabled)
9. No "Copied!" badge appears
10. Rapid clicks don't cause visual glitches (debounce/clear previous)

## Out of Scope
- Customizing highlight colors via preferences
- Customizing duration via preferences
- Animation easing customization
