# Chrome Trust & Reputation Hardening

## Summary

Patch-level release focused on trust stabilization, not new features. Reduces host scope, validates privacy claims, and improves store presentation.

## Requirements

### 1. Reduce Host Scope (Code Change)

**Current state:**
```json
"content_scripts": [{
  "matches": [
    "https://chatgpt.com/*",
    "https://chat.openai.com/*"  // legacy - to be removed
  ]
}]
```

**Target state:**
```json
"content_scripts": [{
  "matches": [
    "https://chatgpt.com/*"
  ]
}]
```

**Rationale:** `chat.openai.com` redirects to `chatgpt.com`. Removing legacy domain narrows host permissions, which improves Chrome heuristics for trust scoring.

**Code impact:**
- `public/manifest.json` - remove legacy URL
- `src/content/selectors.ts:80` - update `CONVERSATION_URL_REGEX` to remove `chat.openai.com`
- Update tests that reference `chat.openai.com`
- Update store listing (SUPPORTED SITES section)

---

### 2. Explicit Local-Only Privacy Signaling (Verification)

**Audit completed - all checks pass:**

| Check | Status | Evidence |
|-------|--------|----------|
| No network requests | ✅ PASS | `grep -r "fetch\|XMLHttpRequest\|WebSocket" src/` = 0 matches |
| Client-side only | ✅ PASS | No remote endpoints in codebase |
| Clipboard write-only | ✅ PASS | Only `navigator.clipboard.writeText()` used |

**Action:** No code changes needed. Document in ADR for future reference.

---

### 3. Versioned Micro-Update (Release)

**Strategy:**
- Bump patch version: `1.3.1` → `1.3.2`
- Limit changes to:
  - Host scope reduction (manifest.json)
  - Selector regex update (selectors.ts)
  - Test updates
  - Store listing text updates
- **No new permissions**
- **No new features**

---

### 4. Icon & Asset Cleanup (IN SCOPE)

**Current state:** Teal "T" with chain link design

**Target design:** ChatGPT-inspired icon (speech bubble/chat variant with title indicator)

**Requirements:**
- Clear rendering at 16px, 48px, and 128px
- High contrast for visibility
- Visually connects to ChatGPT context
- Professional appearance for store listing

---

### 5. Screenshot Refresh (IN SCOPE)

**Approach:** Browser automation via Playwright MCP

**Requirements:**
- High-resolution screenshots (1280x800 recommended for CWS)
- Show extension in action on chatgpt.com
- Demonstrate:
  - Title display in footer area
  - Copy tooltip/feedback
  - Minimal UI footprint
- No login screens visible
- No external services shown

---

### 6. Store Description Alignment (Documentation)

**Current description claims:**
- No data collection ✅ (verified)
- No external servers ✅ (verified)
- No tracking or analytics ✅ (verified)
- Works entirely offline ✅ (verified)

**Updates needed:**
- Remove "chat.openai.com" from SUPPORTED SITES section
- Ensure description matches single-domain scope

---

## Scope Summary

| Item | In Scope | Notes |
|------|----------|-------|
| 1. Remove legacy host | ✅ | Code change |
| 2. Privacy verification | ✅ | Documentation only |
| 3. Version bump | ✅ | 1.3.1 → 1.3.2 |
| 4. Icon refresh | ✅ | ChatGPT-inspired design |
| 5. Screenshot refresh | ✅ | Browser automation via Playwright |
| 6. Store description | ✅ | Documentation update |

---

## Related ADRs

- ADR-012: Chrome Web Store Publishing Automation (relevant for release process)

## Related Backlog Items

- backlog-007: Icon refresh (deferred)
- backlog-012: CWS Enhanced Safe Browsing trust warning (related work)
- backlog-014: Update CWS listing with privacy policy URL (pending)
