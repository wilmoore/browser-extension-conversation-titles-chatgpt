# Plan: CWS Open Commands

## Goal

Add commands to open Chrome Web Store developer dashboard and public listing page.

## Commands

| Command | Target URL | Use Case |
|---------|------------|----------|
| `make cws-dashboard` / `npm run cws:dashboard` | Developer console | Pre/post-publish management |
| `make cws-open` / `npm run cws:open` | Public listing | View as end users see it |

## URLs

- Dashboard: `https://chrome.google.com/webstore/devconsole/g/[publisher-id]/${EXTENSION_ID}`
  - Simplified: `https://chrome.google.com/u/0/webstore/devconsole` (goes to overview, user navigates)
- Listing: `https://chromewebstore.google.com/detail/${EXTENSION_ID}`

## Implementation

1. Auto-detect OS for browser open command:
   - macOS: `open`
   - Linux: `xdg-open`
   - Windows (WSL): `cmd.exe /c start`

2. Add Makefile targets following existing `cws-*` pattern

3. Add npm scripts following existing `cws:*` pattern

## Definition of Done

- [x] `make cws-dashboard` opens developer console
- [x] `make cws-open` opens public listing
- [x] npm script equivalents work
- [x] Cross-platform open command detection (macOS, Linux, WSL)
