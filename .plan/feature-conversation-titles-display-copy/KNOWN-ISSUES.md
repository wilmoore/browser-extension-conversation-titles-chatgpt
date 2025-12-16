# Known Issues & Future Work

## Known Issues (v1.0.0)

### 1. Selector Fragility
- ChatGPT uses compiled/obfuscated CSS class names that may change
- Selectors are based on research of common patterns
- May require updates when ChatGPT UI changes significantly

### 2. Project Name Detection
- Project detection relies on URL pattern matching
- DOM selectors for project name may not be accurate until tested on actual project conversations
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

### 2. Test Coverage
- No automated tests currently
- Should add unit tests for:
  - Context extraction
  - Copy format functions
  - Placement state machine

### 3. Error Reporting (Optional)
- Currently fails silently (by design)
- Could add optional dev-mode logging for debugging

## Future Enhancements

### v1.1 Candidates
- [ ] Delimiter customization in options
- [ ] Theme-aware styling improvements
- [ ] Better project name extraction

### v2.0 Candidates
- [ ] Firefox support
- [ ] Safari support
- [ ] Optional visual feedback on copy (brief flash)
- [ ] Copy history (local only)
