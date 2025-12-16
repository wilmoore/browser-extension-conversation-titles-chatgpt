import { PlacementLocation, PlacementState } from '../types/index.js';
import {
  NAV_CENTER_SELECTORS,
  FOOTER_SELECTORS,
  DISCLAIMER_PATTERNS,
  TIMING,
} from './selectors.js';

/**
 * Manages the placement location for the title display element
 * Implements a state machine for promotion/demotion with stability delays
 */

let currentState: PlacementState = PlacementState.IDLE;
let promotionTimer: ReturnType<typeof setTimeout> | null = null;
let demotionTimer: ReturnType<typeof setTimeout> | null = null;
let lastNavElement: Element | null = null;
let lastFooterElement: Element | null = null;

/**
 * Safely query for an element
 */
function safeQuery(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * Find the top navigation center area
 */
function findNavCenter(): Element | null {
  for (const selector of NAV_CENTER_SELECTORS) {
    const element = safeQuery(selector);
    if (element && isElementVisible(element)) {
      return element;
    }
  }
  return null;
}

/**
 * Find the footer/disclaimer area
 */
function findFooter(): Element | null {
  // First try selectors
  for (const selector of FOOTER_SELECTORS) {
    const element = safeQuery(selector);
    if (element && isElementVisible(element)) {
      // Verify it contains disclaimer text
      if (containsDisclaimerText(element)) {
        return element;
      }
    }
  }

  // Fallback: search by text content
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent || '';
    for (const pattern of DISCLAIMER_PATTERNS) {
      if (text.includes(pattern)) {
        // Return the parent element
        const parent = node.parentElement;
        if (parent && isElementVisible(parent)) {
          return parent;
        }
      }
    }
  }

  return null;
}

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
 * Clear all timers
 */
function clearTimers(): void {
  if (promotionTimer) {
    clearTimeout(promotionTimer);
    promotionTimer = null;
  }
  if (demotionTimer) {
    clearTimeout(demotionTimer);
    demotionTimer = null;
  }
}

/**
 * State change callback type
 */
type StateChangeCallback = (location: PlacementLocation) => void;

let onStateChange: StateChangeCallback | null = null;

/**
 * Set the callback for state changes
 */
export function setStateChangeCallback(callback: StateChangeCallback): void {
  onStateChange = callback;
}

/**
 * Notify listeners of state change
 */
function notifyStateChange(location: PlacementLocation): void {
  if (onStateChange) {
    onStateChange(location);
  }
}

/**
 * Get the current placement location
 */
export function getCurrentPlacement(): PlacementLocation {
  switch (currentState) {
    case PlacementState.IN_TOP_NAV:
      return PlacementLocation.TOP_NAV;
    case PlacementState.IN_FOOTER:
      return PlacementLocation.FOOTER;
    default:
      return PlacementLocation.NONE;
  }
}

/**
 * Get the target element for the current placement
 */
export function getTargetElement(): Element | null {
  switch (currentState) {
    case PlacementState.IN_TOP_NAV:
      return lastNavElement;
    case PlacementState.IN_FOOTER:
      return lastFooterElement;
    default:
      return null;
  }
}

/**
 * Update placement based on current DOM state
 * Call this on initialization and after DOM changes
 */
export function updatePlacement(): void {
  const navElement = findNavCenter();
  const footerElement = findFooter();

  // Cache footer reference
  if (footerElement) {
    lastFooterElement = footerElement;
  }

  switch (currentState) {
    case PlacementState.IDLE:
      handleIdleState(navElement, footerElement);
      break;

    case PlacementState.CHECKING_NAV:
      handleCheckingNavState(navElement);
      break;

    case PlacementState.IN_TOP_NAV:
      handleInTopNavState(navElement);
      break;

    case PlacementState.CHECKING_DEMOTION:
      handleCheckingDemotionState(navElement);
      break;

    case PlacementState.IN_FOOTER:
      handleInFooterState(navElement);
      break;
  }
}

/**
 * Handle IDLE state
 */
function handleIdleState(
  navElement: Element | null,
  footerElement: Element | null
): void {
  if (navElement) {
    // Start checking nav stability
    currentState = PlacementState.CHECKING_NAV;
    lastNavElement = navElement;
    startPromotionTimer();
  } else if (footerElement) {
    // Go directly to footer
    currentState = PlacementState.IN_FOOTER;
    notifyStateChange(PlacementLocation.FOOTER);
  }
  // If neither found, stay idle
}

/**
 * Handle CHECKING_NAV state
 */
function handleCheckingNavState(navElement: Element | null): void {
  if (!navElement || navElement !== lastNavElement) {
    // Nav disappeared or changed, cancel promotion
    clearTimers();
    currentState = PlacementState.IDLE;

    // Try to go to footer instead
    if (lastFooterElement && isElementVisible(lastFooterElement)) {
      currentState = PlacementState.IN_FOOTER;
      notifyStateChange(PlacementLocation.FOOTER);
    }
  }
  // If nav is still there and same element, let timer continue
}

/**
 * Handle IN_TOP_NAV state
 */
function handleInTopNavState(navElement: Element | null): void {
  if (!navElement) {
    // Nav disappeared, start demotion check
    currentState = PlacementState.CHECKING_DEMOTION;
    startDemotionTimer();
  } else {
    // Update reference if element changed but nav still exists
    lastNavElement = navElement;
  }
}

/**
 * Handle CHECKING_DEMOTION state
 */
function handleCheckingDemotionState(navElement: Element | null): void {
  if (navElement) {
    // Nav came back, cancel demotion
    clearTimers();
    currentState = PlacementState.IN_TOP_NAV;
    lastNavElement = navElement;
  }
  // If nav still gone, let demotion timer continue
}

/**
 * Handle IN_FOOTER state
 */
function handleInFooterState(navElement: Element | null): void {
  if (navElement) {
    // Nav appeared, start promotion check
    currentState = PlacementState.CHECKING_NAV;
    lastNavElement = navElement;
    startPromotionTimer();
  }
}

/**
 * Start the promotion timer
 */
function startPromotionTimer(): void {
  clearTimers();
  promotionTimer = setTimeout(() => {
    promotionTimer = null;

    // Verify nav is still there
    const navElement = findNavCenter();
    if (navElement) {
      currentState = PlacementState.IN_TOP_NAV;
      lastNavElement = navElement;
      notifyStateChange(PlacementLocation.TOP_NAV);
    } else {
      // Nav gone, fall back to footer
      currentState = PlacementState.IDLE;
      updatePlacement();
    }
  }, TIMING.PROMOTION_DELAY);
}

/**
 * Start the demotion timer
 */
function startDemotionTimer(): void {
  clearTimers();
  demotionTimer = setTimeout(() => {
    demotionTimer = null;

    // Demote to footer
    if (lastFooterElement && isElementVisible(lastFooterElement)) {
      currentState = PlacementState.IN_FOOTER;
      notifyStateChange(PlacementLocation.FOOTER);
    } else {
      currentState = PlacementState.IDLE;
      notifyStateChange(PlacementLocation.NONE);
    }
  }, TIMING.DEMOTION_DELAY);
}

/**
 * Reset the placement manager state
 */
export function resetPlacement(): void {
  clearTimers();
  currentState = PlacementState.IDLE;
  lastNavElement = null;
  lastFooterElement = null;
}
