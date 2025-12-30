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
 * MutationObserver for <title> element changes
 */
let titleObserver: MutationObserver | null = null;

/**
 * Flag to track if we're waiting for a title update after navigation
 */
let waitingForTitle: boolean = false;

/**
 * Timeout for title wait
 */
let titleWaitTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Guard to prevent concurrent update() calls (race condition prevention)
 */
let updateInProgress: boolean = false;

/**
 * Cleanup function for preference change listener (memory leak prevention)
 */
let cleanupPreferencesListener: (() => void) | null = null;

/**
 * Reference to the current display element (for detecting DOM replacement)
 * React may replace DOM nodes during re-renders, losing attached handlers.
 */
let currentElementRef: HTMLElement | null = null;

/**
 * Render the title with click handler attached
 * Updates currentElementRef to track the DOM element for replacement detection
 */
function renderWithHandler(): void {
  if (!currentContext) return;

  const target = findFooter();
  const success = render(currentContext, target);

  if (success) {
    const element = getDisplayElement();
    if (element) {
      attachClickHandler(element);
      currentElementRef = element;
    }
  } else {
    currentElementRef = null;
  }
}

/**
 * Full update cycle: extract context, find footer, render
 * Uses updateInProgress guard to prevent race conditions between
 * URL poll and title observer
 *
 * Detects both context changes AND DOM element replacement.
 * React may replace DOM nodes during re-renders, which loses attached
 * event handlers even if the context (title/URL) hasn't changed.
 */
function update(): void {
  // Prevent concurrent updates (race condition guard)
  if (updateInProgress) {
    return;
  }
  updateInProgress = true;

  try {
    // Only show on conversation pages
    if (!isConversationPage()) {
      removeElement();
      currentContext = null;
      currentElementRef = null;
      return;
    }

    // Extract fresh context (returns null if no valid title yet)
    const newContext = getFullContext();

    // If no valid context, remove element and restore disclaimer
    if (newContext === null) {
      if (currentContext !== null) {
        removeElement();
        currentContext = null;
        currentElementRef = null;
      }
      return;
    }

    // Check if context changed
    const contextChanged = !contextEquals(currentContext, newContext);

    // Check if element was replaced by React re-render
    // The element reference changes when React replaces the DOM node
    const currentElement = getDisplayElement();
    const elementReplaced =
      currentElementRef !== null &&
      (currentElement === null || currentElement !== currentElementRef);

    // Also detect if element is missing entirely (was removed from DOM)
    const elementMissing =
      currentContext !== null &&
      currentElementRef !== null &&
      !currentElementRef.isConnected;

    // Detect if we have context but failed to render (footer didn't exist initially)
    // This handles the case where streaming creates the footer after initial render attempt
    const needsInitialRender =
      currentContext !== null && currentElementRef === null;

    if (contextChanged || elementReplaced || elementMissing || needsInitialRender) {
      currentContext = newContext;
      renderWithHandler();
    }
  } finally {
    updateInProgress = false;
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

    // If no title after URL change, wait for title element to update
    if (currentContext === null && isConversationPage()) {
      waitingForTitle = true;

      // Clear any existing timeout
      if (titleWaitTimer) {
        clearTimeout(titleWaitTimer);
      }

      // Set timeout to stop waiting after TITLE_WAIT_TIMEOUT
      titleWaitTimer = setTimeout(() => {
        waitingForTitle = false;
        titleWaitTimer = null;
      }, TIMING.TITLE_WAIT_TIMEOUT);
    }
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
 * Callback when document title changes
 */
function onTitleChange(): void {
  // Only process if we're waiting for a title
  if (waitingForTitle) {
    update();

    // If we got a title, stop waiting
    if (currentContext !== null) {
      waitingForTitle = false;
      if (titleWaitTimer) {
        clearTimeout(titleWaitTimer);
        titleWaitTimer = null;
      }
    }
  }
}

/**
 * Initialize observer for <title> element
 */
function initTitleObserver(): void {
  const titleElement = document.querySelector('title');
  if (!titleElement) {
    return;
  }

  titleObserver = new MutationObserver(onTitleChange);

  titleObserver.observe(titleElement, {
    childList: true, // Text node changes
    characterData: true, // Direct text changes
    subtree: true, // Text nodes inside
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

  if (titleObserver) {
    titleObserver.disconnect();
    titleObserver = null;
  }

  if (urlPollInterval) {
    clearInterval(urlPollInterval);
    urlPollInterval = null;
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  if (titleWaitTimer) {
    clearTimeout(titleWaitTimer);
    titleWaitTimer = null;
  }

  waitingForTitle = false;

  // Clean up preference change listener (memory leak prevention)
  if (cleanupPreferencesListener) {
    cleanupPreferencesListener();
    cleanupPreferencesListener = null;
  }

  // Clear element reference (memory leak prevention)
  currentElementRef = null;

  removeElement();
}

/**
 * Main initialization
 */
async function init(): Promise<void> {
  // Load and apply preferences
  const prefs = await loadPreferences();
  applyPreferences(prefs);

  // Listen for preference changes (store cleanup function)
  cleanupPreferencesListener = onPreferencesChange(applyPreferences);

  // Initialize observers
  initObserver();
  initTitleObserver();
  initUrlPolling();

  // Initial update
  update();

  // Cleanup on page unload
  window.addEventListener('unload', cleanup);
}

// Start the extension
init();
