/**
 * Centralized DOM selector definitions
 *
 * ChatGPT uses compiled CSS class names that frequently change.
 * These selectors are ordered by stability (most stable first).
 * The extension tries each selector in order until one succeeds.
 */

/**
 * Default delimiter for display and copy (en dash)
 */
export const DELIMITER = ' – ';

/**
 * Selectors for finding the conversation title
 */
export const TITLE_SELECTORS = [
  // data-testid attribute (most stable if present)
  '[data-testid="conversation-title"]',

  // Active conversation in sidebar navigation
  'nav [aria-selected="true"]',
  'nav a[aria-current="page"]',

  // Sidebar item with active styling
  'nav .bg-token-sidebar-surface-secondary',
  'nav li.relative.group a',
];

/**
 * Primary structural selector for the footer area
 * ChatGPT uses this view-transition-name as a semantic marker for the disclaimer/footer
 * regardless of text content (works for both standard disclaimer and custom GPT messages)
 */
export const FOOTER_STRUCTURAL_SELECTOR = '[class*="vt-disclaimer"]';

/**
 * Selectors for the footer area (title placement location)
 * Used as fallbacks if structural selector fails
 */
export const FOOTER_SELECTORS = [
  // Thread bottom container (most specific for ChatGPT)
  '#thread-bottom-container .text-token-text-secondary',
  '#thread-bottom-container .text-center',
  '#thread-bottom-container > div > div',

  // Disclaimer text container - various ChatGPT layouts
  '.text-token-text-secondary.text-center',
  '.text-xs.text-center.text-token-text-secondary',

  // Text after the composer/input area
  'form ~ .text-center',
  'form ~ .text-xs',

  // Bottom section containing disclaimer
  '[class*="text-center"][class*="text-xs"]',

  // Main content bottom area
  'main .text-xs.text-center',
];

/**
 * Text patterns for the standard disclaimer element
 * NOTE: These are used for original text restoration, NOT for element detection.
 * Element detection now uses structural selectors (FOOTER_STRUCTURAL_SELECTOR).
 */
export const DISCLAIMER_PATTERNS = [
  'ChatGPT can make mistakes',
  'Check important info',
];

/**
 * Regex pattern for extracting conversation ID from URL
 * Matches:
 * - https://chatgpt.com/c/[id]
 * - https://chatgpt.com/g/[project-id]/c/[id]
 */
export const CONVERSATION_URL_REGEX =
  /^https:\/\/chatgpt\.com(\/g\/[^/]+)?\/c\/([a-zA-Z0-9-]+)/;

/**
 * Extension element identifiers
 */
export const EXTENSION_ELEMENT_ID = 'conversation-title-ext-display';
export const EXTENSION_CLASS = 'conversation-title-ext';

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = {
  /** Debounce delay for MutationObserver updates */
  DEBOUNCE_DELAY: 100,
  /** Interval for URL polling fallback */
  URL_POLL_INTERVAL: 500,
  /** Maximum time to wait for title to update after URL change */
  TITLE_WAIT_TIMEOUT: 3000,
  /** Duration tooltip remains visible after copy feedback */
  TOOLTIP_FEEDBACK_DURATION: 800,
};

/**
 * Shortcut key identifiers for tooltip highlighting
 */
export type ShortcutKey = 'click' | 'shift' | 'mod' | 'mod-shift';

/**
 * Tooltip element identifier
 */
export const TOOLTIP_ID = 'conversation-title-ext-tooltip';
