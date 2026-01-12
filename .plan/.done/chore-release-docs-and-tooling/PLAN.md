# Chore: Release Docs and Tooling

## Scope

1. **Enable GitHub Pages** - Host privacy policy at a public URL
2. **Add `npm run open:privacy`** - Quick access to view the hosted privacy policy
3. **Version Sync** - Keep package.json and manifest.json versions in sync
4. **Document Release Process** - Create `docs/RELEASING.md`
5. **Clarify Automation** - Answer: Do code changes auto-release? What's manual?

---

## Related ADRs

- **ADR-012**: Chrome Web Store Publishing Automation
  - Documents: tag-triggered releases, manual workflow dispatch, local `make release`

---

## Implementation Steps

### 1. Enable GitHub Pages

**Current State**: `docs/privacy.html` exists but GitHub Pages is not enabled.

**Options**:
- A) Manual: Settings > Pages > Source: main branch, /docs folder
- B) GitHub API: `gh api` to enable programmatically
- C) GitHub Actions workflow: Auto-deploy on push

**Decision**: Use GitHub API to enable Pages from `/docs` folder. Add a one-time setup script.

**Result URL**: `https://wilmoore.github.io/browser-extension-conversation-titles-chatgpt/privacy.html`

---

### 2. Add `npm run open:privacy`

Add to `package.json`:
```json
"open:privacy": "open https://wilmoore.github.io/browser-extension-conversation-titles-chatgpt/privacy.html"
```

Also add Makefile target for cross-platform support.

---

### 3. Version Sync (package.json ↔ manifest.json)

**Current State**:
- `package.json`: 1.3.0
- `public/manifest.json`: 1.1.2 (out of sync!)

**Solution**: Add a `sync-version` script that:
1. Reads version from `package.json`
2. Updates `public/manifest.json` to match
3. Run this before build or as a pre-commit hook

---

### 4. Create docs/RELEASING.md

Document:
- How automated releases work (tag-triggered)
- How to do a manual release
- Version bump workflow
- What happens after push (nothing auto-releases without a tag)

---

### 5. Release Automation Clarification

**Q: Do code changes auto-release?**
A: NO. Pushing to `main` does NOT auto-release.

**What triggers a release?**
1. Push a version tag: `git tag v1.3.1 && git push --tags`
2. Manual workflow dispatch from GitHub Actions UI

**What's manual?**
- Version bump in package.json
- Creating and pushing the git tag
- (Optional) Manual workflow dispatch if you want draft-only upload

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Add `open:privacy`, `sync-version` scripts |
| `public/manifest.json` | Update version to 1.3.0 |
| `Makefile` | Add `privacy` target |
| `docs/RELEASING.md` | Create new |
| `.plan/backlog.json` | Mark backlog-013 complete when Pages enabled |

---

## Verification

- [ ] `npm run open:privacy` opens the privacy policy URL
- [ ] `npm run sync-version` updates manifest.json from package.json
- [ ] Versions match between package.json and manifest.json
- [ ] docs/RELEASING.md explains the release process clearly
- [ ] GitHub Pages serves privacy.html (after manual enable or API call)
