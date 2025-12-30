import { FOOTER_STRUCTURAL_SELECTOR, FOOTER_SELECTORS } from './selectors.js';

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
 * Find the footer/disclaimer area using structural detection
 * Works for both standard conversations and custom GPTs regardless of text content
 */
export function findFooter(): Element | null {
  // Primary: Use ChatGPT's semantic marker for the disclaimer/footer area
  // This works regardless of text content (standard disclaimer, GPT version message, etc.)
  const vtDisclaimer = document.querySelector(FOOTER_STRUCTURAL_SELECTOR);
  if (vtDisclaimer instanceof HTMLElement && isElementVisible(vtDisclaimer)) {
    return vtDisclaimer;
  }

  // Fallback: Try structural selectors within #thread-bottom-container
  const threadBottom = document.querySelector('#thread-bottom-container');
  if (threadBottom) {
    const textCenter = threadBottom.querySelector('.text-center');
    if (textCenter instanceof HTMLElement && isElementVisible(textCenter)) {
      return textCenter;
    }
  }

  // Last resort: Try other footer selectors (structural, no text matching)
  for (const selector of FOOTER_SELECTORS) {
    try {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement && isElementVisible(element)) {
        return element;
      }
    } catch {
      // Selector might be invalid, skip
    }
  }

  return null;
}
