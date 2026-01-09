# CWS Trust Optimization

## Issue

Chrome shows "Proceed with caution - This extension is not trusted by Enhanced Safe Browsing" during install.

## Root Cause Analysis

This is **not a code bug**. It's a distribution trust penalty from Google caused by:

1. **Low install count** - New extension with few users
2. **New extension** - No track record
3. **Powerful permissions** - `clipboardWrite` + host access to chat.openai.com
4. **Enhanced Safe Browsing** - User has this enabled in Chrome

## Audit Findings

| Item | Status | Notes |
|------|--------|-------|
| Manifest permissions | Minimal | Only necessary permissions declared |
| Privacy policy doc | Exists | `.plan/.done/.../privacy-policy.md` |
| Privacy policy hosted | **MISSING** | `savvyai.dev/privacy` returns 404 |
| CWS listing | Needs verification | Check if privacy URL linked |

## Actionable Fixes

### 1. Host Privacy Policy

The privacy policy document exists but isn't accessible at a public URL.

Options:
- Host at `savvyai.dev/privacy`
- Use GitHub Pages
- Add `PRIVACY.md` to repo and link raw URL

### 2. Update CWS Listing

Ensure:
- Privacy policy URL is linked
- Permission justifications are explicit
- Description explains clipboard usage

### 3. Add Install Guidance

Add section to README preempting the warning:

> Chrome may show a caution warning for new extensions with advanced permissions. This is expected for new releases and does not indicate a security issue.

## What Won't Fix This Immediately

- Code changes
- Refactoring
- Reducing permissions (they're already minimal)

Trust accrues over time with:
- More installs
- Low uninstall rate
- No reports
- Time in market

## Implementation

### Completed

1. **Created GitHub Pages privacy policy** (`docs/privacy.html`)
   - Professional HTML page with dark mode support
   - Explains all permissions with justification
   - Clear "no data collection" messaging

2. **Created docs landing page** (`docs/index.html`)
   - Links to CWS, GitHub, and privacy policy

3. **Updated README**
   - Added install warning guidance note
   - Linked to hosted privacy policy

### Manual Steps Required

1. **Enable GitHub Pages**
   - Go to repo Settings > Pages
   - Source: Deploy from branch
   - Branch: `main`, folder: `/docs`
   - URL will be: `https://wilmoore.github.io/browser-extension-conversation-titles-chatgpt/`

2. **Update CWS Listing**
   - Go to [Store Listing Editor](https://chrome.google.com/webstore/devconsole/df3fb377-c0da-4b93-a6fb-872b2fe2b99a/kgjldbijkcbbjbnfdaebkfbpgdoogfjo/edit)
   - Set Privacy Policy URL to: `https://wilmoore.github.io/browser-extension-conversation-titles-chatgpt/privacy.html`
   - Verify permission justifications are explicit

## References

- Bug report screenshots show the warning dialog
- Extension ID: `kgjldbijkcbbjbnfdaebkfbpgdoogfjo`
- Version: 1.1.2
