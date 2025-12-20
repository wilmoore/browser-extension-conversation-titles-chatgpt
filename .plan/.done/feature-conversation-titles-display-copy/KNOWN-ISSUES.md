# Known Issues & Future Work

## Known Issues (v1.0.0)

### 1. Selector Fragility
- ChatGPT uses compiled/obfuscated CSS class names that may change
- Selectors are based on research of common patterns
- May require updates when ChatGPT UI changes significantly

### 2. Project Name Detection
- Project detection relies on URL pattern matching
- ~~DOM selectors for project name may not be accurate~~ (RESOLVED: Now extracts from URL)
- Project feature is relatively new to ChatGPT

### 3. Testing Limitations
- Cannot fully test without an authenticated ChatGPT session
- Manual testing required after installation

## Deferred to v1.1

### Delimiter Customization
- Currently uses en dash (–) as hardcoded delimiter
- Future: Add options page for delimiter configuration

### Mobile Support Improvements
- Current implementation focused on desktop
- Mobile behavior (tap to copy) works via default click behavior
- May need additional mobile-specific styling

## Technical Debt

### 1. Icon Assets
- Current icons are placeholder (simple "T" on green background)
- Should be replaced with professional icon design

### ~~2. Test Coverage~~ (RESOLVED)
- ~~No automated tests currently~~
- Added 35 unit tests for context extraction
- Vitest framework with jsdom environment

### 3. Error Reporting (Optional)
- Currently fails silently (by design)
- Could add optional dev-mode logging for debugging

## Future Enhancements

### v1.1 Candidates
- [ ] Delimiter customization in options
- [ ] Theme-aware styling improvements
- [x] Better project name extraction (DONE: URL-based extraction)

### v2.0 Candidates
- [ ] Firefox support
- [ ] Safari support
- [x] Optional visual feedback on copy (DONE: green flash + "Copied!" indicator)
- [x] Optional audio feedback (DONE: configurable in options)
- [ ] Copy history (local only)

## Related ADRs

- [001. Footer-Only Title Placement](../../../doc/decisions/001-footer-only-title-placement.md)
- [002. Configurable Copy Shortcuts](../../../doc/decisions/002-configurable-copy-shortcuts.md)
- [003. Document Title Parsing Strategy](../../../doc/decisions/003-document-title-parsing-strategy.md)
