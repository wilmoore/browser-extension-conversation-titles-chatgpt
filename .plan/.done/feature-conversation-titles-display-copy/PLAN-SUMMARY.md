# Plan Summary: Conversation Titles for ChatGPT

## Overview

A minimal Chrome extension that displays the current ChatGPT conversation title and project name, with modifier-click copy functionality.

---

## Branch

`feature/conversation-titles-display-copy`

---

## Confirmed Decisions

| Item | Decision |
|------|----------|
| Manifest | V3 only |
| URL Support | Both `chatgpt.com` and `chat.openai.com` |
| Build Tool | TypeScript + Vite |
| Selector Strategy | Multi-selector cascade with fallbacks |

---

## Architecture

```
src/
├── content/
│   ├── index.ts              # Entry point
│   ├── selectors.ts          # DOM selector definitions
│   ├── context-extractor.ts  # Title/project/URL extraction
│   ├── placement-manager.ts  # Top nav vs footer placement
│   ├── title-renderer.ts     # DOM rendering
│   └── copy-handler.ts       # Click handler + clipboard
├── styles/
│   └── content.css           # Injected styles
└── types/
    └── index.ts              # TypeScript interfaces
```

---

## Key Features

### Display
- Always shows conversation title (fallback: "Untitled Conversation")
- Shows project name when applicable
- Format: `Project Name – Conversation Title`

### Placement Strategy
1. **Primary:** Top-center nav (after 700ms stability)
2. **Fallback:** Footer (replaces disclaimer text)
3. Single location only, no duplicates

### Copy Modes
| Action | Output |
|--------|--------|
| Click | Title only |
| Shift+Click | Project – Title |
| Cmd/Ctrl+Click | Markdown link |
| Cmd/Ctrl+Shift+Click | Raw URL |

### Resilience
- MutationObserver for DOM changes
- Route change detection
- Silent failure (no console spam)
- Multiple selector fallbacks

---

## Implementation Phases

1. **Project Setup** - Vite + TypeScript + Manifest V3
2. **Context Extraction** - Title, project, URL detection
3. **Placement Management** - Promotion/demotion logic
4. **Title Rendering** - DOM element with styling
5. **Copy Handlers** - Modifier detection + clipboard
6. **Observer Setup** - MutationObserver + route detection
7. **Integration** - Wire modules together
8. **Testing** - Manual verification on both domains

---

## Hard Constraints (from requirements)

- No UI controls, buttons, menus, or popups
- No right-click behavior
- No HTML copy output
- Single render location only
- Promotion delay: 600–800ms (using 700ms)
- Cmd and Ctrl behave identically
- All copy formats single-line
- Silence preferred over errors

---

## Out of Scope (v1)

- Right-click menus
- Toolbar popup UI
- Keyboard-only shortcuts
- Analytics/tracking
- Account sync
- HTML copy format
- Delimiter customization

---

## Planning Files

- `REQUIREMENTS.md` - Full requirements documentation
- `SELECTOR-STRATEGY.md` - DOM selector approach
- `IMPLEMENTATION-PLAN.md` - Detailed implementation steps
- `TODO.md` - Checkable task list

---

## Ready for Implementation

All planning documentation complete. Awaiting approval to proceed with implementation.
