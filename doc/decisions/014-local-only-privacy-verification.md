# 014. Local-Only Privacy Verification

Date: 2026-01-17

## Status

Accepted

## Context

The extension makes privacy claims in its Chrome Web Store listing:
- No data collection
- No external servers
- No tracking or analytics
- Works entirely offline

These claims must be verifiable through code audit to maintain trust and comply with CWS policies.

## Decision

Document the results of a comprehensive privacy audit conducted on the codebase.

### Audit Methodology

1. **Network Request Audit**: Search for all network-related APIs
2. **Clipboard Audit**: Verify clipboard operations are write-only
3. **Storage Audit**: Verify storage is local-only (chrome.storage.sync)
4. **External Dependency Audit**: Check for analytics or tracking libraries

### Audit Results

#### Network Requests

**Command:** `grep -r "fetch\|XMLHttpRequest\|WebSocket\|navigator\.sendBeacon" src/`

**Result:** No matches found

The extension makes zero network requests. All functionality runs entirely client-side.

#### Clipboard Operations

**Command:** `grep -r "clipboard" src/`

**Result:** Only `navigator.clipboard.writeText()` found in `src/content/copy-handler.ts:138`

Clipboard access is **write-only**. The extension:
- Writes formatted conversation titles to clipboard on user click
- Never reads clipboard contents
- Uses the minimal `clipboardWrite` permission

#### Storage Operations

**Files reviewed:** `src/storage/preferences.ts`

Storage uses `chrome.storage.sync` which:
- Stores user preferences (copy format shortcuts, audio feedback toggle)
- Syncs across user's Chrome instances when signed into Chrome (via Google's sync servers)
- Never sends data to third-party or extension-controlled servers
- When user is not signed into Chrome, storage remains local-only

#### External Dependencies

**Production dependencies:** None

**Dev dependencies:** Standard build tooling only (vite, vitest, typescript, playwright)

No analytics SDKs, tracking libraries, or telemetry packages.

### Manifest Permissions

```json
{
  "permissions": [
    "clipboardWrite",  // Required for copy functionality
    "storage"          // Required for preference persistence
  ]
}
```

Both permissions are the minimum necessary for the extension's functionality.

### Host Permissions

```json
{
  "content_scripts": [{
    "matches": ["https://chatgpt.com/*"]
  }]
}
```

Content scripts only run on ChatGPT. No host permissions requested.

## Consequences

**Positive:**
- Privacy claims are verifiable and accurate
- Builds user trust
- Complies with CWS policies
- Documentation serves as audit trail

**Negative:**
- Requires re-audit if new features add network capability
- Manual process (could be automated with CI checks)

## Future Considerations

Consider adding automated CI checks:
- Fail build if `fetch`, `XMLHttpRequest`, `WebSocket` patterns appear in src/
- Track permission changes in manifest.json

## Related

- ADR-012: Chrome Web Store Publishing Automation
- Backlog-012: CWS Enhanced Safe Browsing trust warning
