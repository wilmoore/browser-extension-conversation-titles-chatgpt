import type { ConversationContext, CopyPreferences } from '../types/index.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';
import { EXTENSION_ELEMENT_ID, DISCLAIMER_PATTERNS, TOOLTIP_ID, TIMING } from './selectors.js';
import type { ShortcutKey } from './selectors.js';
import { formatDisplayText } from './context-extractor.js';

/**
 * Check if element contains disclaimer text
 */
function isDisclaimerElement(element: Element): boolean {
  const text = element.textContent || '';
  return DISCLAIMER_PATTERNS.some(pattern => text.includes(pattern));
}

/**
 * Detect if user is on macOS
 */
function isMac(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Get format label for tooltip (localized)
 */
function getFormatLabel(format: CopyFormat): string {
  switch (format) {
    case CopyFormat.MARKDOWN:
      return chrome.i18n.getMessage('tooltipMd') || 'md';
    case CopyFormat.TITLE:
      return chrome.i18n.getMessage('tooltipTitle') || 'title';
    case CopyFormat.FULL_CONTEXT:
      return chrome.i18n.getMessage('tooltipFull') || 'full';
    case CopyFormat.URL:
      return chrome.i18n.getMessage('tooltipUrl') || 'url';
  }
}

/**
 * Shortcut configuration for tooltip generation
 */
interface ShortcutConfig {
  key: ShortcutKey;
  label: string;
  format: CopyFormat;
}

/**
 * Get shortcut configurations based on preferences (localized)
 */
function getShortcutConfigs(prefs: CopyPreferences): ShortcutConfig[] {
  const mod = isMac() ? '\u2318' : (chrome.i18n.getMessage('shortcutCtrl') || 'Ctrl');
  const shift = '\u21E7';
  const clickLabel = chrome.i18n.getMessage('shortcutClick') || 'Click';

  return [
    { key: 'click', label: clickLabel, format: prefs.click },
    { key: 'shift', label: shift, format: prefs.shiftClick },
    { key: 'mod', label: mod, format: prefs.modClick },
    { key: 'mod-shift', label: `${mod}${shift}`, format: prefs.modShiftClick },
  ];
}

/**
 * Generate tooltip HTML with highlightable spans for each shortcut
 */
function generateTooltipHTML(prefs: CopyPreferences): string {
  const configs = getShortcutConfigs(prefs);

  const spans = configs.map(
    (config) =>
      `<span data-shortcut="${config.key}" style="padding: 1px 3px; border-radius: 2px; transition: background-color 0.1s ease, color 0.1s ease;">${config.label}: ${getFormatLabel(config.format)}</span>`
  );

  return spans.join(' <span style="opacity: 0.6;">\u2022</span> ');
}

/**
 * Current preferences for tooltip generation
 */
let currentPrefs: CopyPreferences = DEFAULT_PREFERENCES;

/**
 * Timer for auto-hiding tooltip after feedback
 */
let feedbackHideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Update preferences for tooltip
 */
export function setTooltipPreferences(prefs: CopyPreferences): void {
  currentPrefs = prefs;
}

/**
 * Get the existing title element if present
 */
function getExistingElement(): HTMLElement | null {
  return document.getElementById(EXTENSION_ELEMENT_ID);
}

/**
 * Track if we replaced disclaimer text (for restoration)
 */
let replacedDisclaimerElement: HTMLElement | null = null;
let originalText: string | null = null;

/**
 * Remove the existing title element (and restore disclaimer if needed)
 */
export function removeElement(): void {
  const existing = getExistingElement();

  // Remove tooltip if present
  const tooltip = document.getElementById(TOOLTIP_ID);
  if (tooltip) {
    tooltip.remove();
  }

  // If we replaced disclaimer text, restore it
  if (existing && originalText !== null) {
    // Check if our reference is still valid and in DOM
    if (replacedDisclaimerElement &&
        replacedDisclaimerElement.isConnected &&
        existing === replacedDisclaimerElement) {
      existing.textContent = originalText;
      existing.style.cursor = '';
      existing.removeAttribute('id');
      // Remove ARIA accessibility attributes
      existing.removeAttribute('role');
      existing.removeAttribute('aria-label');
      existing.removeAttribute('tabindex');
      // Remove data attributes
      delete existing.dataset.title;
      delete existing.dataset.url;
      delete existing.dataset.project;
    }
    // Always reset our tracking state
    replacedDisclaimerElement = null;
    originalText = null;
    return;
  }

  // Only remove elements we created (not ChatGPT's elements)
  // Check if this is an element we added vs one we modified
  if (existing && !existing.closest('form') && existing.parentElement === document.body) {
    existing.remove();
  }

  // Reset state even if we didn't find the element
  replacedDisclaimerElement = null;
  originalText = null;
}

/**
 * Create the custom tooltip element with ARIA attributes
 */
function createTooltip(): HTMLElement {
  const tooltip = document.createElement('div');
  tooltip.id = TOOLTIP_ID;
  tooltip.innerHTML = generateTooltipHTML(currentPrefs);

  // ARIA accessibility attributes
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-live', 'polite');

  tooltip.style.cssText = `
    position: fixed;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 10000;
    margin-bottom: 4px;
  `;
  return tooltip;
}

/**
 * Track tooltip state per element (using WeakMap for cleanup)
 */
const tooltipState = new WeakMap<
  HTMLElement,
  {
    tooltip: HTMLElement | null;
    showTimer: ReturnType<typeof setTimeout> | null;
    hideTimer: ReturnType<typeof setTimeout> | null;
    isHovering: boolean;
    handlersAttached: boolean;
  }
>();

/**
 * Get or create tooltip for an element
 */
function getOrCreateTooltip(element: HTMLElement): HTMLElement {
  const state = tooltipState.get(element);

  // Clear any pending hide timer when creating/showing tooltip
  if (state?.hideTimer) {
    clearTimeout(state.hideTimer);
    state.hideTimer = null;
  }

  const existing = document.getElementById(TOOLTIP_ID);
  if (existing) {
    if (state) {
      state.tooltip = existing;
    }
    return existing;
  }

  const tooltip = createTooltip();
  const rect = element.getBoundingClientRect();
  tooltip.style.bottom = 'auto';
  tooltip.style.top = `${rect.top - 8}px`;
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
  document.body.appendChild(tooltip);

  if (state) {
    state.tooltip = tooltip;
  }

  return tooltip;
}

/**
 * Hide tooltip with fade animation
 */
function hideTooltip(element: HTMLElement): void {
  const state = tooltipState.get(element);
  if (!state?.tooltip) return;

  // Don't hide if user is hovering
  if (state.isHovering) return;

  // Clear any existing hide timer
  if (state.hideTimer) {
    clearTimeout(state.hideTimer);
  }

  state.tooltip.style.opacity = '0';
  const tooltipRef = state.tooltip;

  // Track the hide timer to prevent race conditions
  state.hideTimer = setTimeout(() => {
    if (tooltipRef && tooltipRef.parentNode) {
      tooltipRef.remove();
    }
    // Only clear state if this tooltip is still the current one
    if (state && state.tooltip === tooltipRef) {
      state.tooltip = null;
    }
    if (state) {
      state.hideTimer = null;
    }
  }, 150);
}

/**
 * Attach hover handlers for custom tooltip
 */
function attachTooltipHandlers(element: HTMLElement): void {
  // Guard: don't attach handlers twice
  const existingState = tooltipState.get(element);
  if (existingState?.handlersAttached) {
    return;
  }

  // Initialize state for this element
  tooltipState.set(element, {
    tooltip: null,
    showTimer: null,
    hideTimer: null,
    isHovering: false,
    handlersAttached: true,
  });

  element.addEventListener('mouseenter', () => {
    const state = tooltipState.get(element);
    if (!state) return;

    state.isHovering = true;

    // Clear any pending feedback hide timer
    if (feedbackHideTimer) {
      clearTimeout(feedbackHideTimer);
      feedbackHideTimer = null;
    }

    // Fast tooltip appearance (150ms delay)
    state.showTimer = setTimeout(() => {
      const tooltip = getOrCreateTooltip(element);
      tooltip.style.opacity = '1';
    }, 150);
  });

  element.addEventListener('mouseleave', () => {
    const state = tooltipState.get(element);
    if (!state) return;

    state.isHovering = false;

    if (state.showTimer) {
      clearTimeout(state.showTimer);
      state.showTimer = null;
    }

    // Only hide if no feedback is active
    if (!feedbackHideTimer) {
      hideTooltip(element);
    }
  });
}

/**
 * Checkmark prefix for copy success feedback
 */
const CHECKMARK = '\u2713 ';

/**
 * Show tooltip with copy feedback highlighting
 */
export function showTooltipFeedback(element: HTMLElement, shortcutKey: ShortcutKey): void {
  // Clear any existing feedback timer
  if (feedbackHideTimer) {
    clearTimeout(feedbackHideTimer);
    feedbackHideTimer = null;
  }

  // Get or create tooltip (auto-show even if not hovering)
  const tooltip = getOrCreateTooltip(element);

  // Reset any previous highlights and restore original text
  const allShortcuts = tooltip.querySelectorAll('[data-shortcut]');
  allShortcuts.forEach((span) => {
    const el = span as HTMLElement;
    el.style.backgroundColor = '';
    el.style.color = '';
    // Restore original text if it was modified
    if (el.dataset.originalText) {
      el.textContent = el.dataset.originalText;
      delete el.dataset.originalText;
    }
  });

  // Show tooltip
  tooltip.style.opacity = '1';

  // Highlight the specific shortcut and add checkmark
  const targetSpan = tooltip.querySelector(`[data-shortcut="${shortcutKey}"]`) as HTMLElement | null;
  if (targetSpan) {
    // Store original text and prepend checkmark
    targetSpan.dataset.originalText = targetSpan.textContent || '';
    targetSpan.textContent = CHECKMARK + targetSpan.textContent;
    targetSpan.style.backgroundColor = '#10a37f';
    targetSpan.style.color = 'white';
  }

  // Schedule hide after duration
  feedbackHideTimer = setTimeout(() => {
    feedbackHideTimer = null;

    // Reset highlight and restore text
    if (targetSpan) {
      targetSpan.style.backgroundColor = '';
      targetSpan.style.color = '';
      if (targetSpan.dataset.originalText) {
        targetSpan.textContent = targetSpan.dataset.originalText;
        delete targetSpan.dataset.originalText;
      }
    }

    // Hide tooltip if not hovering
    const state = tooltipState.get(element);
    if (!state?.isHovering) {
      hideTooltip(element);
    }
  }, TIMING.TOOLTIP_FEEDBACK_DURATION);
}

/**
 * Render the title element into the DOM (footer only)
 */
export function render(
  context: ConversationContext,
  targetElement: Element | null
): boolean {
  // Always remove existing element first (prevent duplicates)
  removeElement();

  if (!targetElement) {
    return false;
  }

  // Only render if this is the actual disclaimer element
  if (!(targetElement instanceof HTMLElement) || !isDisclaimerElement(targetElement)) {
    return false;
  }

  // Find the innermost text element
  const textElement = findDisclaimerTextElement(targetElement);

  if (!textElement) {
    return false;
  }

  // Store original text for restoration (only once)
  if (originalText === null) {
    originalText = textElement.textContent;
    replacedDisclaimerElement = textElement;
  }

  // Replace text content directly (preserves all styling)
  textElement.textContent = formatDisplayText(context);
  textElement.style.cursor = 'pointer';
  textElement.id = EXTENSION_ELEMENT_ID;

  // ARIA accessibility attributes for interactive element
  textElement.setAttribute('role', 'button');
  textElement.setAttribute(
    'aria-label',
    chrome.i18n.getMessage('ariaClickToCopy') || 'Click to copy conversation title'
  );
  textElement.setAttribute('tabindex', '0');

  // Store data attributes for click handler
  textElement.dataset.title = context.title;
  textElement.dataset.url = context.url;
  if (context.projectName) {
    textElement.dataset.project = context.projectName;
  }

  // Attach custom tooltip
  attachTooltipHandlers(textElement);

  return true;
}

/**
 * Find the innermost element containing the disclaimer text
 */
function findDisclaimerTextElement(container: HTMLElement): HTMLElement | null {
  // If this element directly contains the disclaimer text (no child elements with text)
  if (container.children.length === 0 && container.textContent?.includes('ChatGPT can make mistakes')) {
    return container;
  }

  // Search children for leaf nodes containing the disclaimer
  for (const child of container.querySelectorAll('*')) {
    if (child instanceof HTMLElement &&
        child.children.length === 0 &&
        child.textContent?.includes('ChatGPT can make mistakes')) {
      return child;
    }
  }

  // No suitable element found - don't return container as fallback
  // This prevents modifying the wrong element
  return null;
}

/**
 * Get the displayed element (for attaching event handlers)
 */
export function getDisplayElement(): HTMLElement | null {
  return getExistingElement();
}
