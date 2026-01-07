# Icon Design Requirements for Figma

## Context

The current icon is functional but generic. Previous attempt (backlog-007) to create a refined "T" glyph was deferred due to PNG rendering issues at small sizes.

## Approach

Design pixel-perfect icons in Figma, exporting at exact sizes to avoid scaling artifacts.

## Required Sizes

| Size | Usage |
|------|-------|
| 16x16 | Browser toolbar (small) |
| 48x48 | Extension management page |
| 128x128 | Chrome Web Store listing |

## Design Constraints

### For 16x16
- **Maximum detail**: ~12x12 usable pixels (2px padding recommended)
- **Stroke width**: Minimum 1px, prefer 2px for visibility
- **Avoid**: Fine serifs, thin lines, gradients, small text
- **Prefer**: Bold shapes, high contrast, simple silhouettes

### For 48x48
- More detail possible
- Can include subtle gradients or shadows
- Text/letterforms can be more refined

### For 128x128
- Full detail possible
- Can include branding elements, refined typography
- This is what users see in the Chrome Web Store

## Design Direction Options

### Option A: Bold "T" Letterform
- Simple, bold sans-serif "T"
- Represents "Title"
- Works at all sizes due to simplicity
- Differentiates from generic chat/AI icons

### Option B: Speech Bubble + Title
- Chat bubble with title bar element
- More illustrative, shows concept
- May be too detailed for 16x16

### Option C: Document/Page with Header
- Page icon with emphasized top bar
- Represents "title" as document header
- Common metaphor, may not stand out

### Option D: Abstract Mark
- Geometric shape suggesting "top" or "header"
- Unique, memorable
- Requires more iteration to get right

## Recommended: Option A (Bold "T")

**Rationale**:
- Scales well to all sizes
- Clear connection to "Title"
- Distinctive in extension toolbar
- Previous attempt was a refined serif T - try bold sans instead

## Color Recommendations

| Element | Color | Reasoning |
|---------|-------|-----------|
| Background | #FAFAFA (off-white) | Clean, light, professional |
| Foreground | #2D3748 (charcoal) | High contrast, not harsh black |
| Alternative | ChatGPT green (#10A37F) | Brand alignment |

## Figma Export Settings

1. Create artboards at exact sizes (16x16, 48x48, 128x128)
2. Design at 128x128, then adapt (not just scale) for smaller sizes
3. Export as PNG with 1x scale
4. Ensure pixel-perfect alignment (no half-pixels)

## Delivery

Place exported PNGs in:
- `public/icons/icon16.png`
- `public/icons/icon48.png`
- `public/icons/icon128.png`

Also save Figma source file or link in this directory.

## Previous Attempt Notes

From backlog-007:
> "SVG renders well but PNG generation at small sizes (16, 32, 48px) produces blurry results."

The issue was automated SVG-to-PNG conversion. Manual Figma design with pixel-perfect exports should avoid this.
