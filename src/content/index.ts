/**
 * Conversation Titles for ChatGPT
 *
 * A minimal Chrome extension that displays the current conversation title
 * and enables quick copying in multiple formats.
 *
 * Entry point for the content script.
 */

import type { ConversationContext, CopyPreferences } from '../types/index.js';
import {
  getFullContext,
  isConversationPage,
  contextEquals,
} from './context-extractor.js';
import { findFooter } from './placement-manager.js';
import {
  render,
  removeElement,
  getDisplayElement,
  setTooltipPreferences,
} from './title-renderer.js';
import { attachClickHandler, setPreferences } from './copy-handler.js';
import { loadPreferences, onPreferencesChange } from '../storage/preferences.js';
import { TIMING } from './selectors.js';

/**
 * Current cached context
 */
let currentContext: ConversationContext | null = null;

/**
 * Last known URL for route change detection
 */
let lastUrl: string = '';

/**
 * Debounce timer for DOM changes
 */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * URL polling interval
 */
let urlPollInterval: ReturnType<typeof setInterval> | null = null;

/**
 * MutationObserver instance
 */
let observer: MutationObserver | null = null;

/**
 * Render the title with click handler attached
 */
function renderWithHandler(): void {
  if (!currentContext) return;

  const target = findFooter();
  const success = render(currentContext, target);

  if (success) {
    const element = getDisplayElement();
    if (element) {
      attachClickHandler(element);
    }
  }
}

/**
 * Full update cycle: extract context, find footer, render
 */
function update(): void {
  // Only show on conversation pages
  if (!isConversationPage()) {
    removeElement();
    currentContext = null;
    return;
  }

  // Extract fresh context (returns null if no valid title yet)
  const newContext = getFullContext();

  // If no valid context, remove element and restore disclaimer
  if (newContext === null) {
    if (currentContext !== null) {
      removeElement();
      currentContext = null;
    }
    return;
  }

  // Check if context changed
  const contextChanged = !contextEquals(currentContext, newContext);

  if (contextChanged) {
    currentContext = newContext;
    renderWithHandler();
  }
}

/**
 * Debounced update for DOM changes
 */
function debouncedUpdate(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    update();
  }, TIMING.DEBOUNCE_DELAY);
}

/**
 * Check for URL changes (route navigation)
 */
function checkUrlChange(): void {
  const currentUrl = window.location.href;

  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Full update on navigation
    update();
  }
}

/**
 * MutationObserver callback
 */
function onMutation(): void {
  debouncedUpdate();
}

/**
 * Initialize the MutationObserver
 */
function initObserver(): void {
  observer = new MutationObserver(onMutation);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'aria-selected', 'data-testid'],
  });
}

/**
 * Initialize URL polling for route changes
 */
function initUrlPolling(): void {
  lastUrl = window.location.href;

  // Listen for popstate (back/forward)
  window.addEventListener('popstate', checkUrlChange);

  // Poll for URL changes (handles programmatic navigation)
  urlPollInterval = setInterval(checkUrlChange, TIMING.URL_POLL_INTERVAL);
}

/**
 * Handle preference updates
 */
function applyPreferences(prefs: CopyPreferences): void {
  setPreferences(prefs);
  setTooltipPreferences(prefs);
}

/**
 * Cleanup on unload
 */
function cleanup(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (urlPollInterval) {
    clearInterval(urlPollInterval);
    urlPollInterval = null;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  removeElement();
}

/**
 * Main initialization
 */
async function init(): Promise<void> {
  // Load and apply preferences
  const prefs = await loadPreferences();
  applyPreferences(prefs);

  // Listen for preference changes
  onPreferencesChange(applyPreferences);

  // Initialize observers
  initObserver();
  initUrlPolling();

  // Initial update
  update();

  // Cleanup on page unload
  window.addEventListener('unload', cleanup);
}

// Start the extension
init();
