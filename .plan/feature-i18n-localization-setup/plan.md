# i18n Localization Setup

## Overview
Set up internationalization infrastructure for the Chrome extension with English as the default locale.

## Implementation Summary

### Created Files
- `public/_locales/en/messages.json` - English locale with 19 strings

### Modified Files
- `public/manifest.json` - Added `default_locale: "en"` and `__MSG_*` placeholders
- `src/options/options.html` - Added `data-i18n` attributes to all text elements
- `src/options/options.ts` - Added `applyI18n()` function using `chrome.i18n.getMessage()`
- `src/content/title-renderer.ts` - Localized tooltip format labels and shortcut text

## String Categories

| Category | Count | Location |
|----------|-------|----------|
| Manifest | 2 | Name, description |
| Options headings | 2 | Copy Shortcuts, Feedback |
| Shortcut labels | 4 | Click, Shift, Cmd/Ctrl, Cmd+Shift/Ctrl+Shift |
| Format labels | 4 | Markdown link, Title only, Full context, URL only |
| Status/footer | 3 | Saved, footer text, toggle label |
| Tooltip | 4 | md, title, full, url |

## Platform Handling
- **Mac**: Uses Unicode symbols (⌘, ⇧) - not localized
- **Windows/Linux**: Uses localized text strings from messages.json

## Adding New Languages

To add a new language (e.g., Spanish):

1. Create `public/_locales/es/messages.json`
2. Copy structure from `en/messages.json`
3. Translate all `message` values
4. Keep `description` in English (for developers)
5. Rebuild and test

## Future Enhancements
- Add Spanish, French, German, Portuguese
- Consider RTL language support (Arabic, Hebrew)
- Add locale-specific number/date formatting if needed
