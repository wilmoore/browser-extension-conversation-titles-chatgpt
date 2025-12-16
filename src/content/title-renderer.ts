import type { ConversationContext } from '../types/index.js';
import { PlacementLocation } from '../types/index.js';
import {
  EXTENSION_ELEMENT_ID,
  EXTENSION_CLASS,
} from './selectors.js';
import { formatDisplayText } from './context-extractor.js';

/**
 * Tooltip text for hover discoverability
 */
const TOOLTIP_TEXT =
  'Click: title \u2022 Shift: context \u2022 Cmd/Ctrl: markdown \u2022 Cmd/Ctrl+Shift: link';

/**
 * Get the existing title element if present
 */
function getExistingElement(): HTMLElement | null {
  return document.getElementById(EXTENSION_ELEMENT_ID);
}

/**
 * Remove the existing title element
 */
export function removeElement(): void {
  const existing = getExistingElement();
  if (existing) {
    existing.remove();
  }
}

/**
 * Create the title display element
 */
function createElement(
  context: ConversationContext,
  location: PlacementLocation
): HTMLElement {
  const element = document.createElement('span');
  element.id = EXTENSION_ELEMENT_ID;
  element.className = EXTENSION_CLASS;
  element.textContent = formatDisplayText(context);
  element.title = TOOLTIP_TEXT;

  // Add location-specific class
  if (location === PlacementLocation.TOP_NAV) {
    element.classList.add(`${EXTENSION_CLASS}--top-nav`);
  } else if (location === PlacementLocation.FOOTER) {
    element.classList.add(`${EXTENSION_CLASS}--footer`);
  }

  // Store context data for click handler
  element.dataset.title = context.title;
  element.dataset.url = context.url;
  if (context.projectName) {
    element.dataset.project = context.projectName;
  }

  return element;
}

/**
 * Find or create a container element for top nav placement
 */
function getNavContainer(navElement: Element): Element {
  // Try to find or create a suitable container
  // For now, we'll insert after the nav element
  return navElement;
}

/**
 * Render the title element into the DOM
 */
export function render(
  context: ConversationContext,
  location: PlacementLocation,
  targetElement: Element | null
): boolean {
  // Always remove existing element first (prevent duplicates)
  removeElement();

  // Don't render if no location
  if (location === PlacementLocation.NONE || !targetElement) {
    return false;
  }

  const element = createElement(context, location);

  try {
    if (location === PlacementLocation.TOP_NAV) {
      return renderInTopNav(element, targetElement);
    } else if (location === PlacementLocation.FOOTER) {
      return renderInFooter(element, targetElement);
    }
  } catch {
    // Silent failure
    return false;
  }

  return false;
}

/**
 * Render element in top navigation
 */
function renderInTopNav(element: HTMLElement, navElement: Element): boolean {
  const container = getNavContainer(navElement);

  // Try to insert as a child at the center
  // or after the element if that's more appropriate
  const parent = container.parentElement;

  if (parent) {
    // Insert after the nav element
    container.insertAdjacentElement('afterend', element);
    return true;
  }

  // Fallback: append to container
  container.appendChild(element);
  return true;
}

/**
 * Render element in footer (replacing disclaimer)
 */
function renderInFooter(element: HTMLElement, footerElement: Element): boolean {
  // Hide the original disclaimer text
  if (footerElement instanceof HTMLElement) {
    footerElement.style.display = 'none';
  }

  // Insert our element in its place
  const parent = footerElement.parentElement;
  if (parent) {
    parent.insertBefore(element, footerElement);
    return true;
  }

  return false;
}

/**
 * Update the content of an existing element without re-rendering
 */
export function updateContent(context: ConversationContext): boolean {
  const element = getExistingElement();
  if (!element) {
    return false;
  }

  element.textContent = formatDisplayText(context);
  element.dataset.title = context.title;
  element.dataset.url = context.url;

  if (context.projectName) {
    element.dataset.project = context.projectName;
  } else {
    delete element.dataset.project;
  }

  return true;
}

/**
 * Get the displayed element (for attaching event handlers)
 */
export function getDisplayElement(): HTMLElement | null {
  return getExistingElement();
}
