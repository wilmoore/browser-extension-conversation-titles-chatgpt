# Chrome Web Store Submission Checklist

## Pre-Submission Preparation

### 1. Developer Account Setup
- [ ] Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] Sign in with your Google account
- [ ] Pay the one-time $5 USD developer registration fee
- [ ] Accept the Developer Agreement
- [ ] Complete identity verification (if prompted)

### 2. Prepare Your Package
- [ ] Run `npm run build` to create production build
- [ ] Create ZIP: `cd dist && zip -r ../conversation-titles-chatgpt-v1.1.0.zip . && cd ..`
- [ ] Verify ZIP contains:
  - `manifest.json`
  - `icons/` folder with all icon sizes
  - `assets/` folder with JS bundles
  - `src/options/options.html`

### 3. Host Privacy Policy
- [ ] Create page at `https://savvyai.dev/privacy/conversation-titles-chatgpt`
- [ ] Copy content from `privacy-policy.md` in this directory
- [ ] Verify the page is publicly accessible

---

## Store Listing Submission

### 4. Create New Item
- [ ] Click "New Item" in Developer Dashboard
- [ ] Upload the ZIP file

### 5. Store Listing Tab
Fill in the following fields:

| Field | Value |
|-------|-------|
| Language | English (United States) |
| Extension Name | Conversation Titles for ChatGPT |
| Short Description | (copy from manifest.json - 118 chars) |
| Detailed Description | (copy from store-listing.md) |
| Category | Productivity |
| Extension Icon | (auto-populated from ZIP) |

### 6. Graphics Tab
**Required:**
- [ ] 128x128 icon (already in package)

**Optional (skip for minimal submission):**
- Screenshots (1280x800 or 640x400)
- Small promo tile (440x280)
- Marquee promo tile (1400x560)

### 7. Privacy Tab
- [ ] Single Purpose Description:
  > "Displays and copies ChatGPT conversation titles with configurable copy formats"

- [ ] Host Permissions Justification:
  > "The extension needs access to chatgpt.com and chat.openai.com to read and display conversation titles from the page DOM. It does not access any other websites."

- [ ] Privacy Policy URL: `https://savvyai.dev/privacy/conversation-titles-chatgpt`

- [ ] Data Usage Certifications:
  - [ ] Check: "I certify that this extension does not collect or transmit user data"

### 8. Distribution Tab
- [ ] Visibility: Public
- [ ] Regions: All regions (or specify if needed)

---

## Submit for Review

### 9. Final Checks
- [ ] Review all tabs for completeness
- [ ] Check preview of store listing
- [ ] Verify icon displays correctly

### 10. Submit
- [ ] Click "Submit for Review"
- [ ] Note: Review typically takes 1-3 business days
- [ ] You'll receive email notification when approved or if changes needed

---

## Post-Submission

### After Approval
- [ ] Copy the Chrome Web Store URL
- [ ] Update README.md with installation link
- [ ] Announce the extension launch

### Store URL Format
Your extension will be available at:
```
https://chrome.google.com/webstore/detail/conversation-titles-for-c/[EXTENSION_ID]
```

---

## Troubleshooting Common Issues

### Rejection Reasons & Fixes

| Reason | Fix |
|--------|-----|
| "Insufficient functionality" | Add more details to description explaining value |
| "Privacy policy issues" | Ensure policy is accessible and complete |
| "Permission justification" | Be more specific about why permissions are needed |
| "Trademark concerns" | Clarify relationship to ChatGPT (we don't claim affiliation) |

### If Rejected
1. Read the rejection email carefully
2. Make requested changes
3. Re-submit with explanation of changes

---

## Support Contacts

**Chrome Web Store Support:**
https://support.google.com/chrome_webstore/

**Developer Forum:**
https://groups.google.com/a/chromium.org/g/chromium-extensions
