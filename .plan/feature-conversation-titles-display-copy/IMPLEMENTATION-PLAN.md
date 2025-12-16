# Implementation Plan

## Project Structure

```
browser-extension-conversation-titles-chatgpt/
├── .plan/                          # Planning documentation
├── src/
│   ├── content/                    # Content script (injected into ChatGPT)
│   │   ├── index.ts               # Entry point
│   │   ├── context-extractor.ts   # Title, project, URL extraction
│   │   ├── placement-manager.ts   # Render location management
│   │   ├── title-renderer.ts      # DOM element creation
│   │   ├── copy-handler.ts        # Click/modifier interactions
│   │   └── selectors.ts           # Centralized selector definitions
│   ├── styles/
│   │   └── content.css            # Injected styles
│   └── types/
│       └── index.ts               # TypeScript definitions
├── public/
│   ├── manifest.json              # Chrome extension manifest v3
│   └── icons/                     # Extension icons
├── vite.config.ts                 # Build configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies
└── README.md                      # Project documentation
```

---

## Implementation Steps

### Phase 1: Project Setup

#### Step 1.1: Initialize npm project
- Create `package.json` with project metadata
- Install dependencies:
  - `vite` - Build tool
  - `@crxjs/vite-plugin` - Chrome extension Vite plugin
  - `typescript` - Type checking
- Install dev dependencies:
  - `@types/chrome` - Chrome API types

#### Step 1.2: Configure TypeScript
- Create `tsconfig.json` with strict mode
- Target ES2020 for modern browser support
- Include DOM and Chrome types

#### Step 1.3: Configure Vite
- Set up `@crxjs/vite-plugin` for extension bundling
- Configure content script injection
- Set up CSS injection

#### Step 1.4: Create Manifest V3
- Extension name: "Conversation Titles for ChatGPT"
- Permissions: `activeTab`, `clipboardWrite`
- Content scripts: Match `*://chatgpt.com/*` and `*://chat.openai.com/*`
- No background script needed
- No popup UI

---

### Phase 2: Context Extraction Module

#### Step 2.1: Create selector definitions (`selectors.ts`)
- Define title selectors array
- Define project selectors array
- Define navigation selectors array
- Define footer selectors array
- URL regex patterns

#### Step 2.2: Implement context extractor (`context-extractor.ts`)
- `getConversationTitle(): string` - Returns title or "Untitled Conversation"
- `getProjectName(): string | null` - Returns project name or null
- `getConversationUrl(): string` - Returns canonical URL
- `getFullContext(): ConversationContext` - Combined interface

#### Step 2.3: Implement safe DOM queries
- Wrap all queries in try/catch
- Return null on failure (no throws)
- Document title fallback parsing

---

### Phase 3: Placement Management

#### Step 3.1: Implement placement manager (`placement-manager.ts`)
- `PlacementLocation` enum: `TOP_NAV`, `FOOTER`, `NONE`
- `getCurrentPlacement(): PlacementLocation`
- `promotionTimer` - 700ms stability check
- `demotionTimer` - 200ms delay before fallback

#### Step 3.2: Top navigation detection
- Check if nav center element exists
- Start 700ms stability timer on detection
- Cancel timer if element disappears
- Promote only after timer completes

#### Step 3.3: Footer detection and fallback
- Find disclaimer text element
- Store reference for replacement
- Always available as guaranteed fallback

#### Step 3.4: Placement state machine
```
NONE → (nav found) → CHECKING_NAV
CHECKING_NAV → (stable 700ms) → TOP_NAV
CHECKING_NAV → (nav lost) → FOOTER
TOP_NAV → (nav lost) → CHECKING_DEMOTION
CHECKING_DEMOTION → (200ms) → FOOTER
FOOTER → (nav found) → CHECKING_NAV
```

---

### Phase 4: Title Rendering

#### Step 4.1: Create title element (`title-renderer.ts`)
- Generate unique element ID to prevent duplicates
- Small, muted text style
- Cursor: pointer on hover
- Single-line tooltip

#### Step 4.2: Styling (`content.css`)
```css
.conversation-title-ext {
  font-size: 12px;
  color: var(--token-text-secondary, #6b6b6b);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.conversation-title-ext:hover {
  color: var(--token-text-primary, #333);
}
```

#### Step 4.3: Render function
- `render(context: ConversationContext, location: PlacementLocation)`
- Remove existing element if present (prevent duplicates)
- Create new element with current data
- Insert at specified location

#### Step 4.4: Format display text
- With project: `{project} – {title}` (en dash)
- Without project: `{title}`
- Fallback: "Untitled Conversation"

---

### Phase 5: Copy Interaction Handlers

#### Step 5.1: Click handler (`copy-handler.ts`)
- Detect modifier keys from MouseEvent
- `metaKey` (Mac Cmd) or `ctrlKey` (Win/Linux Ctrl)
- `shiftKey`

#### Step 5.2: Copy format functions
```typescript
function getTitleOnly(ctx: ConversationContext): string
function getFullContext(ctx: ConversationContext): string
function getMarkdownLink(ctx: ConversationContext): string
function getRawUrl(ctx: ConversationContext): string
```

#### Step 5.3: Clipboard interaction
- Use `navigator.clipboard.writeText()`
- Silent failure (no alerts/toasts)

#### Step 5.4: Interaction matrix
| Modifier | Action |
|----------|--------|
| None | Copy title only |
| Shift | Copy project – title |
| Cmd/Ctrl | Copy markdown link |
| Cmd/Ctrl + Shift | Copy raw URL |

---

### Phase 6: MutationObserver Setup

#### Step 6.1: Observer initialization
- Observe document body for major changes
- Debounce updates (100ms)

#### Step 6.2: Route change detection
- Listen for `popstate` events
- Monitor URL changes via polling (fallback)
- Re-extract context on navigation

#### Step 6.3: Update cycle
```typescript
function onDOMChange() {
  const newContext = extractContext();
  const newPlacement = determinePlacement();

  if (contextChanged(newContext) || placementChanged(newPlacement)) {
    render(newContext, newPlacement);
  }
}
```

---

### Phase 7: Integration & Testing

#### Step 7.1: Content script entry point
- Initialize placement manager
- Start MutationObserver
- Initial render

#### Step 7.2: Manual testing checklist
- [ ] Title displays in top nav when stable
- [ ] Title falls back to footer when nav absent
- [ ] Click copies title only
- [ ] Shift+click copies full context
- [ ] Cmd/Ctrl+click copies markdown
- [ ] Cmd/Ctrl+Shift+click copies URL
- [ ] Tooltip appears on hover
- [ ] Navigation updates title
- [ ] No console errors
- [ ] No duplicate elements

#### Step 7.3: Edge cases
- [ ] New conversation (no title yet)
- [ ] Conversation in project
- [ ] Standalone conversation
- [ ] Home page (no conversation)
- [ ] Model switch mid-conversation
- [ ] Page refresh

---

## Deliverables

1. Working Chrome extension (unpacked)
2. Build output in `dist/` directory
3. README with installation instructions
4. Planning documentation in `.plan/`
