# Requirements Document

## Project: Conversation Titles for ChatGPT

**Branch:** `feature/conversation-titles-display-copy`
**Created:** 2025-12-16

---

## Confirmed Configuration

| Decision | Choice |
|----------|--------|
| Manifest Version | V3 only |
| URL Patterns | Both `chatgpt.com` and `chat.openai.com` |
| Build Tooling | TypeScript + Vite |
| Selector Strategy | Research current ChatGPT DOM |

---

## Core Requirements

### 1. Display Behavior

- **Always display** the conversation title
- **Conditionally display** project name when conversation belongs to a project
- **Format:** `Project Name – Conversation Title` (en dash delimiter)
- **Fallback title:** "Untitled Conversation" when no title exists

### 2. Placement Strategy (Progressive Enhancement)

| Priority | Location | Condition |
|----------|----------|-----------|
| Primary | Top-center navigation bar | Stable for 600–800ms |
| Fallback | Footer (replaces disclaimer) | Always available |

**Rules:**
- Only ONE render location at a time
- Promotion delay: 600–800ms stability check
- Demotion delay: Brief delay to avoid flicker
- No visible transitions

### 3. Copy Interaction Model

| Interaction | Output |
|-------------|--------|
| Click | Conversation title only |
| Shift + Click | Project Name – Conversation Title |
| Cmd/Ctrl + Click | Markdown link |
| Cmd/Ctrl + Shift + Click | Raw URL |

**Markdown Format:**
```
[Project Name – Conversation Title](https://chatgpt.com/c/...)
```

### 4. Tooltip

Single-line on hover:
```
Click: title • Shift: context • Cmd/Ctrl: markdown • Cmd/Ctrl+Shift: link
```

### 5. Stability & Resilience

- Route detection + MutationObservers
- Handle navigation, re-renders, model switches
- Fail silently (no console spam, no blocking errors)
- No UI interference on failure

---

## Explicit Non-Goals (v1)

- Right-click menus
- Toolbar popup UI
- Keyboard-only shortcuts
- Analytics/tracking
- Account sync
- HTML copy format
- Delimiter customization

---

## Technical Constraints

1. No UI controls, buttons, menus, or popups
2. No right-click behavior
3. No HTML copy output
4. Single render location only
5. Promotion delay: 600–800ms
6. Demotion must be delayed
7. Footer disclaimer replacement required
8. Cmd and Ctrl must behave identically
9. All copy formats single-line
10. Silence preferred over errors
