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
 * Fallback title when no title is detected
 */
export const UNTITLED_CONVERSATION = 'Untitled Conversation';

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
 * Selectors for finding the project name
 */
export const PROJECT_SELECTORS = [
  // data-testid for project indicator
  '[data-testid="project-name"]',
  '[data-testid="project-indicator"]',

  // Project breadcrumb or header
  '[data-project-name]',

  // Dropdown or badge showing project context
  '.project-badge',
  '.project-name',
];

/**
 * Selectors for the top navigation area (primary placement)
 * These must NOT match the sidebar nav
 */
export const NAV_CENTER_SELECTORS = [
  // Main content header (not sidebar)
  'main > div > header',
  'main header:not([aria-label="Chat history"])',

  // Sticky header in main content area
  'main .sticky.top-0',

  // Model selector button's parent container
  '[data-testid="model-selector"]',
];

/**
 * Selectors for the footer area (fallback placement)
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
 * Selector for the main chat area (for appending our element)
 */
export const MAIN_CONTENT_SELECTORS = [
  'main',
  '#__next main',
  '[role="main"]',
];

/**
 * Text patterns to identify the disclaimer element
 */
export const DISCLAIMER_PATTERNS = [
  'ChatGPT can make mistakes',
  'Check important info',
];

/**
 * Regex pattern for extracting conversation ID from URL
 * Matches:
 * - https://chatgpt.com/c/[id]
 * - https://chat.openai.com/c/[id]
 * - https://chatgpt.com/g/[project-id]/c/[id]
 */
export const CONVERSATION_URL_REGEX =
  /^https:\/\/(chatgpt\.com|chat\.openai\.com)(\/g\/[^/]+)?\/c\/([a-zA-Z0-9-]+)/;

/**
 * Regex pattern for extracting project ID from URL
 */
export const PROJECT_URL_REGEX =
  /^https:\/\/(chatgpt\.com|chat\.openai\.com)\/g\/([^/]+)\/c\//;

/**
 * Extension element identifiers
 */
export const EXTENSION_ELEMENT_ID = 'conversation-title-ext-display';
export const EXTENSION_CLASS = 'conversation-title-ext';

/**
 * Timing constants (in milliseconds)
 */
export const TIMING = {
  /** How long top nav must be stable before promotion */
  PROMOTION_DELAY: 700,
  /** Delay before demoting from top nav to footer */
  DEMOTION_DELAY: 200,
  /** Debounce delay for MutationObserver updates */
  DEBOUNCE_DELAY: 100,
  /** Interval for URL polling fallback */
  URL_POLL_INTERVAL: 500,
};
