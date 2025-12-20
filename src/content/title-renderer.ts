import type { ConversationContext, CopyPreferences } from '../types/index.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';
import { EXTENSION_ELEMENT_ID, DISCLAIMER_PATTERNS } from './selectors.js';
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
 * Get format label for tooltip
 */
function getFormatLabel(format: CopyFormat): string {
  switch (format) {
    case CopyFormat.MARKDOWN:
      return 'md';
    case CopyFormat.TITLE:
      return 'title';
    case CopyFormat.FULL_CONTEXT:
      return 'full';
    case CopyFormat.URL:
      return 'url';
  }
}

/**
 * Generate tooltip text based on preferences
 */
function generateTooltip(prefs: CopyPreferences): string {
  const mod = isMac() ? '\u2318' : 'Ctrl';
  const shift = '\u21E7';

  const parts = [
    `Click: ${getFormatLabel(prefs.click)}`,
    `${shift}: ${getFormatLabel(prefs.shiftClick)}`,
    `${mod}: ${getFormatLabel(prefs.modClick)}`,
    `${mod}${shift}: ${getFormatLabel(prefs.modShiftClick)}`,
  ];

  return parts.join(' \u2022 ');
}

/**
 * Tooltip element ID
 */
const TOOLTIP_ID = 'conversation-title-ext-tooltip';

/**
 * Current preferences for tooltip generation
 */
let currentPrefs: CopyPreferences = DEFAULT_PREFERENCES;

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
 * Create the custom tooltip element
 */
function createTooltip(): HTMLElement {
  const tooltip = document.createElement('div');
  tooltip.id = TOOLTIP_ID;
  tooltip.textContent = generateTooltip(currentPrefs);
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
 * Attach hover handlers for custom tooltip
 */
function attachTooltipHandlers(element: HTMLElement): void {
  let tooltip: HTMLElement | null = null;
  let showTimer: ReturnType<typeof setTimeout> | null = null;

  element.addEventListener('mouseenter', () => {
    // Fast tooltip appearance (150ms delay)
    showTimer = setTimeout(() => {
      if (!tooltip) {
        tooltip = createTooltip();
        // Position relative to element
        const rect = element.getBoundingClientRect();
        tooltip.style.bottom = 'auto';
        tooltip.style.top = `${rect.top - 8}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
        document.body.appendChild(tooltip);
      }
      tooltip.style.opacity = '1';
    }, 150);
  });

  element.addEventListener('mouseleave', () => {
    if (showTimer) {
      clearTimeout(showTimer);
      showTimer = null;
    }
    if (tooltip) {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip) {
          tooltip.remove();
          tooltip = null;
        }
      }, 150);
    }
  });
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
