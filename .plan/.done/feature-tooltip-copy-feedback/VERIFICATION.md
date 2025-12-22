# Manual Verification Checklist

## Setup
1. Build the extension: `npm run build`
2. Load the unpacked extension from `dist/` folder in Chrome
3. Navigate to ChatGPT and open a conversation

## Test Cases

### TC1: Plain Click (Copy Markdown)
- [ ] Click on the conversation title in footer
- [ ] Tooltip appears immediately (even if not hovering)
- [ ] "Click: md" portion is highlighted (white text on green background)
- [ ] Title text flashes green briefly
- [ ] Tooltip fades out after ~800ms
- [ ] No "Copied!" badge appears

### TC2: Shift+Click (Copy Full Context)
- [ ] Shift+click on the conversation title
- [ ] Tooltip appears with "⇧: full" highlighted
- [ ] Other shortcuts remain unhighlighted
- [ ] Highlight fades after ~800ms

### TC3: ⌘+Click / Ctrl+Click (Copy Title Only)
- [ ] ⌘+click (Mac) or Ctrl+click (Windows) on title
- [ ] Tooltip appears with "⌘: title" or "Ctrl: title" highlighted
- [ ] Text is correctly copied to clipboard

### TC4: ⌘⇧+Click / Ctrl+Shift+Click (Copy URL)
- [ ] ⌘+Shift+click (Mac) or Ctrl+Shift+click (Windows)
- [ ] Tooltip appears with "⌘⇧: url" or "Ctrl⇧: url" highlighted
- [ ] URL is correctly copied to clipboard

### TC5: Hover Behavior Preserved
- [ ] Hovering over title shows tooltip after 150ms delay
- [ ] Moving mouse away hides tooltip with fade
- [ ] Tooltip shows all shortcuts when just hovering (no highlight)

### TC6: Hover + Copy Interaction
- [ ] Hover to show tooltip
- [ ] Click while hovering → correct shortcut highlights
- [ ] Tooltip stays visible while hovering (doesn't auto-hide)
- [ ] Moving mouse away after copy → tooltip fades normally

### TC7: Rapid Clicks
- [ ] Click multiple times rapidly
- [ ] Previous highlight clears, new highlight appears
- [ ] No visual glitches or stacking tooltips

### TC8: Audio Feedback (Optional)
- [ ] Enable audio feedback in extension options
- [ ] Copy any format → hear subtle pop sound
- [ ] Disable audio feedback → no sound

## Browser Compatibility
- [ ] Chrome (primary)
- [ ] Edge (Chromium-based)

## Expected Visual Appearance
- Tooltip: Dark semi-transparent background (rgba(0,0,0,0.8))
- Highlight: Green (#10a37f) background with white text
- Animation: 100ms transition for smooth highlight
- Position: Centered above the title element
