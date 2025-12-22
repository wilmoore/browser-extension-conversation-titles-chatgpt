import type { ConversationContext, CopyPreferences } from '../types/index.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';
import { DELIMITER } from './selectors.js';
import { showCopyFeedback, setAudioEnabled } from './feedback.js';

/**
 * Current preferences (loaded from storage)
 */
let currentPrefs: CopyPreferences = DEFAULT_PREFERENCES;

/**
 * Set preferences (called when loaded or changed)
 */
export function setPreferences(prefs: CopyPreferences): void {
  currentPrefs = prefs;
  setAudioEnabled(prefs.audioFeedback);
}

/**
 * Get current preferences
 */
export function getPreferences(): CopyPreferences {
  return currentPrefs;
}

/**
 * Determine the copy format based on modifier keys and preferences
 */
export function getCopyFormat(event: MouseEvent): CopyFormat {
  const hasModifier = event.metaKey || event.ctrlKey;
  const hasShift = event.shiftKey;

  if (hasModifier && hasShift) {
    return currentPrefs.modShiftClick;
  } else if (hasModifier) {
    return currentPrefs.modClick;
  } else if (hasShift) {
    return currentPrefs.shiftClick;
  } else {
    return currentPrefs.click;
  }
}

/**
 * Format: Title only (includes project name if available)
 */
export function formatTitleOnly(context: ConversationContext): string {
  if (context.projectName) {
    return `${context.projectName}${DELIMITER}${context.title}`;
  }
  return context.title;
}

/**
 * Format: Project – Title (full context)
 */
export function formatFullContext(context: ConversationContext): string {
  if (context.projectName) {
    return `${context.projectName}${DELIMITER}${context.title}`;
  }
  return context.title;
}

/**
 * Format: Markdown link
 * [Project – Title](url) or [Title](url)
 */
export function formatMarkdownLink(context: ConversationContext): string {
  const displayText = formatFullContext(context);
  // Escape special markdown characters in the display text
  const escapedText = displayText
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
  return `[${escapedText}](${context.url})`;
}

/**
 * Format: Raw URL
 */
export function formatRawUrl(context: ConversationContext): string {
  return context.url;
}

/**
 * Get the formatted text for the given format
 */
export function getFormattedText(
  context: ConversationContext,
  format: CopyFormat
): string {
  switch (format) {
    case CopyFormat.TITLE:
      return formatTitleOnly(context);
    case CopyFormat.FULL_CONTEXT:
      return formatFullContext(context);
    case CopyFormat.MARKDOWN:
      return formatMarkdownLink(context);
    case CopyFormat.URL:
      return formatRawUrl(context);
  }
}

/**
 * Copy text to clipboard
 * Returns true on success, false on failure (silent)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Silent failure
    return false;
  }
}

/**
 * Handle click on the title element
 */
export async function handleClick(
  event: MouseEvent,
  context: ConversationContext,
  element: HTMLElement
): Promise<boolean> {
  // Prevent default behavior
  event.preventDefault();
  event.stopPropagation();

  const format = getCopyFormat(event);
  const text = getFormattedText(context, format);

  const success = await copyToClipboard(text);

  if (success) {
    showCopyFeedback(element);
  }

  return success;
}

/**
 * Extract context from element data attributes
 * (Used when handling clicks on the rendered element)
 */
export function extractContextFromElement(
  element: HTMLElement
): ConversationContext | null {
  const title = element.dataset.title;
  const url = element.dataset.url;

  if (!title || !url) {
    return null;
  }

  return {
    title,
    url,
    projectName: element.dataset.project || null,
  };
}

/**
 * Create a click handler bound to the current element
 */
export function createClickHandler(
  element: HTMLElement
): (event: MouseEvent) => void {
  return async (event: MouseEvent) => {
    const context = extractContextFromElement(element);
    if (context) {
      await handleClick(event, context, element);
    }
  };
}

/**
 * Attach click handler to element
 */
export function attachClickHandler(element: HTMLElement): void {
  const handler = createClickHandler(element);
  element.addEventListener('click', handler);
}
