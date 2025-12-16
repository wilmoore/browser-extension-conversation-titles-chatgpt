# Selector Strategy

## Research Findings

Based on analysis of existing ChatGPT Chrome extensions and the nature of ChatGPT's interface:

1. **ChatGPT uses compiled CSS class names** - Non-human-readable, frequently change
2. **Selectors are inherently fragile** - Must design for graceful degradation
3. **Multiple fallback selectors** are essential for resilience

## Recommended Selector Approach

### Primary Strategy: Multi-Selector Cascade

Use a priority-ordered array of selectors, trying each until one succeeds.

### Conversation Title Detection

```typescript
const TITLE_SELECTORS = [
  // data-testid attributes (most stable if present)
  '[data-testid="conversation-title"]',

  // Sidebar active conversation (fallback)
  'nav [aria-selected="true"]',
  'nav .bg-token-sidebar-surface-secondary',

  // Document title as ultimate fallback
  // Parsed from: "Conversation Title - ChatGPT" or "ChatGPT"
];
```

### Project Name Detection

Project context appears in ChatGPT's "Projects" feature. Detection strategy:

```typescript
const PROJECT_SELECTORS = [
  // Project badge or indicator in header area
  '[data-testid="project-name"]',

  // Breadcrumb-style navigation (if present)
  'nav [data-project]',

  // URL pattern: /g/[project-id]/c/[conversation-id]
  // Extract from window.location
];
```

### Top Navigation Bar (Primary Placement)

```typescript
const NAV_CENTER_SELECTORS = [
  // Main content area header
  'main header',

  // Top bar container (model selector area)
  '[data-testid="model-selector"]',
  '.sticky.top-0',

  // Flex container in header
  'header .flex.justify-center',
];
```

### Footer Area (Fallback Placement)

```typescript
const FOOTER_SELECTORS = [
  // Disclaimer text element
  'form + div', // Element after input form
  '.text-token-text-secondary:has-text("ChatGPT can make mistakes")',

  // Bottom of main content area
  'main > div:last-child',

  // Input area container (to position relative to)
  '#prompt-textarea',
];

const DISCLAIMER_TEXT = 'ChatGPT can make mistakes';
```

## URL Parsing

### Conversation URL Pattern

```typescript
// Standard conversation
// https://chatgpt.com/c/[conversation-id]
// https://chat.openai.com/c/[conversation-id]

// Project conversation
// https://chatgpt.com/g/[project-id]/c/[conversation-id]

const CONVERSATION_URL_REGEX = /^https:\/\/(chatgpt\.com|chat\.openai\.com)(\/g\/[^\/]+)?\/c\/([a-zA-Z0-9-]+)/;
```

## MutationObserver Strategy

### Configuration

```typescript
const OBSERVER_CONFIG: MutationObserverInit = {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'aria-selected', 'data-testid'],
};
```

### Observation Targets

1. **Document body** - Catch major layout changes
2. **Navigation container** - Title/project changes
3. **Main content area** - Re-renders on navigation

## Graceful Degradation

### Failure Hierarchy

1. If title not found → Display "Untitled Conversation"
2. If project not found → Omit project portion entirely
3. If top nav not stable → Fall back to footer immediately
4. If footer not found → Extension becomes dormant (no error)

### Silent Failure

All DOM operations wrapped in try/catch. No console output in production.

```typescript
function safeQuery<T extends Element>(selector: string): T | null {
  try {
    return document.querySelector<T>(selector);
  } catch {
    return null;
  }
}
```

## Version Resilience

### Self-Healing Pattern

If primary selectors fail repeatedly:
1. Log failure count (dev mode only)
2. Increase fallback selector usage
3. Never block user interaction
4. Periodic retry with exponential backoff

### Update Strategy

When ChatGPT updates break selectors:
1. Extension continues with degraded functionality
2. Update extension with new selectors
3. Version selectors for easy maintenance
