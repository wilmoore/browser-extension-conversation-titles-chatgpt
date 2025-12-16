/**
 * Conversation Titles for ChatGPT
 *
 * A minimal Chrome extension that displays the current conversation title
 * and enables quick copying in multiple formats.
 *
 * Entry point for the content script.
 */

import type { ConversationContext } from '../types/index.js';
import { PlacementLocation } from '../types/index.js';
import {
  getFullContext,
  isConversationPage,
  contextEquals,
} from './context-extractor.js';
import {
  updatePlacement,
  getCurrentPlacement,
  getTargetElement,
  setStateChangeCallback,
  resetPlacement,
} from './placement-manager.js';
import {
  render,
  removeElement,
  getDisplayElement,
} from './title-renderer.js';
import { attachClickHandler } from './copy-handler.js';
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

  const placement = getCurrentPlacement();
  const target = getTargetElement();

  const success = render(currentContext, placement, target);

  if (success) {
    const element = getDisplayElement();
    if (element) {
      attachClickHandler(element);
    }
  }
}

/**
 * Full update cycle: extract context, update placement, render
 */
function update(): void {
  // Only show on conversation pages
  if (!isConversationPage()) {
    removeElement();
    currentContext = null;
    return;
  }

  // Extract fresh context
  const newContext = getFullContext();

  // Check if context changed
  const contextChanged = !contextEquals(currentContext, newContext);

  if (contextChanged) {
    currentContext = newContext;
  }

  // Update placement state machine
  updatePlacement();

  // Only re-render if context changed
  // (placement changes trigger via callback)
  if (contextChanged) {
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
 * Handle placement state changes
 */
function onPlacementChange(location: PlacementLocation): void {
  if (location === PlacementLocation.NONE) {
    removeElement();
  } else {
    renderWithHandler();
  }
}

/**
 * Check for URL changes (route navigation)
 */
function checkUrlChange(): void {
  const currentUrl = window.location.href;

  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    // Reset placement on navigation
    resetPlacement();
    // Full update
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
function init(): void {
  // Set up placement state change callback
  setStateChangeCallback(onPlacementChange);

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
