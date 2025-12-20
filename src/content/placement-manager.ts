import { FOOTER_SELECTORS, DISCLAIMER_PATTERNS } from './selectors.js';

/**
 * Manages finding the footer placement for the title display element
 */

/**
 * Check if an element is visible in the DOM
 */
function isElementVisible(element: Element): boolean {
  if (!element.isConnected) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

/**
 * Check if an element contains disclaimer text
 */
function containsDisclaimerText(element: Element): boolean {
  const text = element.textContent || '';
  return DISCLAIMER_PATTERNS.some((pattern) => text.includes(pattern));
}

/**
 * Find the footer/disclaimer area
 */
export function findFooter(): Element | null {
  // Primary approach: Find elements with pointer-events-auto that contain disclaimer
  const pointerAutoElements = document.querySelectorAll('.pointer-events-auto');
  for (const element of pointerAutoElements) {
    if (element instanceof HTMLElement &&
        isElementVisible(element) &&
        element.innerText?.includes('ChatGPT can make mistakes')) {
      // Return the parent element (the styled container)
      return element.parentElement || element;
    }
  }

  // Secondary: Try selectors that contain disclaimer text
  for (const selector of FOOTER_SELECTORS) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element && isElementVisible(element) && containsDisclaimerText(element)) {
          return element;
        }
      }
    } catch {
      // Selector might be invalid, skip
    }
  }

  // Third: search all elements for disclaimer text
  const allElements = document.querySelectorAll('div, span, p');
  for (const element of allElements) {
    if (element instanceof HTMLElement && isElementVisible(element)) {
      // Check if this element's direct text contains the disclaimer
      if (element.innerText === 'ChatGPT can make mistakes. Check important info.') {
        return element.parentElement || element;
      }
    }
  }

  // No disclaimer found
  return null;
}
