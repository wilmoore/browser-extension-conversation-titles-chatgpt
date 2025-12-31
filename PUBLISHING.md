# Publishing Guide

This guide covers publishing updates to the Chrome Web Store. For initial submission, see `.plan/.done/feature-chrome-web-store-publication/submission-checklist.md`.

## Quick Reference

| Field | Value |
|-------|-------|
| Developer Dashboard | https://chrome.google.com/webstore/devconsole |
| Extension ID | `kgjldbijkcbbjbnfdaebkfbpgdoogfjo` |
| Store Listing | https://chrome.google.com/webstore/detail/conversation-titles-for-chatgpt/kgjldbijkcbbjbnfdaebkfbpgdoogfjo |

---

## Publishing an Update

### 1. Version Bump

Update the version in **both** files (keep them in sync):

```bash
# public/manifest.json - Chrome extension version
# package.json - npm package version
```

Version format: `MAJOR.MINOR.PATCH` (e.g., `1.1.3`)

- **PATCH**: Bug fixes, minor improvements
- **MINOR**: New features, backward-compatible changes
- **MAJOR**: Breaking changes, significant rewrites

### 2. Run Tests

```bash
npm run test:run
npm run build
```

Ensure all tests pass and the build completes without errors.

### 3. Create the ZIP Package

```bash
# Build production bundle
npm run build

# Create ZIP from dist folder
cd dist && zip -r ../conversation-titles-chatgpt-v$(cat manifest.json | grep '"version"' | sed 's/.*: "\(.*\)".*/\1/').zip . && cd ..
```

Or manually:
```bash
npm run build
cd dist
zip -r ../conversation-titles-chatgpt-v1.1.3.zip .
cd ..
```

### 4. Verify the Package

Before uploading, verify the ZIP contents:

```bash
unzip -l conversation-titles-chatgpt-v*.zip
```

Expected contents:
```
manifest.json
icons/
  icon16.png
  icon48.png
  icon128.png
assets/
  *.js (bundled scripts)
styles/
  content.css
src/options/
  options.html
_locales/
  en/messages.json
```

### 5. Upload to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Find "Conversation Titles for ChatGPT" in your extensions list
3. Click on the extension to open its details
4. Click **"Package"** tab in the left sidebar
5. Click **"Upload new package"**
6. Select your ZIP file
7. Wait for validation to complete

### 6. Update Store Listing (if needed)

If the update includes user-facing changes, update the store listing:

1. Click **"Store listing"** tab
2. Update the **Detailed Description** to mention new features
3. Add/update screenshots if UI changed

### 7. Submit for Review

1. Review all changes in the dashboard
2. Click **"Submit for review"**
3. Review typically takes 1-3 business days

---

## Post-Release Checklist

- [ ] Verify the update appears in the Chrome Web Store
- [ ] Test installation on a fresh browser profile
- [ ] Update README.md if features changed
- [ ] Create a git tag for the release:
  ```bash
  git tag -a v1.1.3 -m "Release v1.1.3: Brief description"
  git push origin v1.1.3
  ```

---

## Troubleshooting

### Version Number Rejected

Chrome requires the new version to be higher than the published version. Check the current published version in the Developer Dashboard.

### Package Validation Failed

Common causes:
- Missing required files (manifest.json, icons)
- Invalid manifest.json syntax
- Icon dimensions don't match declared sizes

### Review Rejection

If rejected, you'll receive an email with the reason. Common issues:

| Reason | Fix |
|--------|-----|
| Permission justification | Update the Privacy tab with clearer explanations |
| Policy violation | Review [Chrome Web Store policies](https://developer.chrome.com/docs/webstore/program-policies/) |
| Functionality issues | Test thoroughly before resubmitting |

After fixing, resubmit through the dashboard.

---

## Rollback

If a critical issue is found after release:

1. **Option A**: Publish a new patch version with the fix
2. **Option B**: Unpublish the extension temporarily (Developer Dashboard > Distribution > Visibility)

Note: You cannot revert to a previous version directly. You must upload a new package with a higher version number.
