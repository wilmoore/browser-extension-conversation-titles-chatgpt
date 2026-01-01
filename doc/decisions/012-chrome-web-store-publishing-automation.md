# 012. Chrome Web Store Publishing Automation

Date: 2025-12-31

## Status

Accepted

## Context

Publishing updates to the Chrome Web Store required manual steps: building the extension, creating a ZIP file, uploading through the web dashboard, and publishing. This process was time-consuming and error-prone.

## Decision

Implement automated publishing using:

1. **chrome-webstore-upload-cli** - NPM package for Chrome Web Store API interactions
2. **Makefile** - Local automation with targets for build, package, upload, and publish
3. **npm scripts** - Alternative automation through package.json scripts
4. **GitHub Actions** - CI/CD workflow for tag-triggered and manual releases

OAuth 2.0 credentials are stored in `.env` (local) and GitHub Secrets (CI/CD).

## Consequences

**Positive:**
- One-command releases with `make release`
- CI/CD automation on version tags
- Consistent build and publish process
- Artifact retention for debugging

**Negative:**
- Requires initial OAuth credential setup (one-time)
- Credentials must be kept secure and rotated if compromised
- GitHub Actions workflow consumes CI minutes

## Alternatives Considered

1. **Manual publishing only** - Rejected due to repetitive effort and human error risk
2. **GitHub Actions only** - Rejected; local automation also valuable for development
3. **Custom Node.js script** - Rejected; chrome-webstore-upload-cli is well-maintained

## Related

- Planning: `.plan/.done/feat-cws-publishing-automation/`
- Docs: `docs/PUBLISHING.md`
