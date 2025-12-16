import type { ConversationContext } from '../types/index.js';
import {
  TITLE_SELECTORS,
  PROJECT_SELECTORS,
  PROJECT_URL_REGEX,
  UNTITLED_CONVERSATION,
  DELIMITER,
} from './selectors.js';

/**
 * Safely query the DOM for an element
 */
function safeQuery<T extends Element>(selector: string): T | null {
  try {
    return document.querySelector<T>(selector);
  } catch {
    return null;
  }
}

/**
 * Try multiple selectors in order, return first match
 */
function queryWithFallbacks(selectors: string[]): Element | null {
  for (const selector of selectors) {
    const element = safeQuery(selector);
    if (element) {
      return element;
    }
  }
  return null;
}

/**
 * Extract text content from an element, cleaned up
 */
function getTextContent(element: Element | null): string | null {
  if (!element) return null;

  const text = element.textContent?.trim();
  if (!text || text.length === 0) return null;

  return text;
}

/**
 * Parse conversation title from document title
 * Format: "Conversation Title - ChatGPT" or just "ChatGPT"
 */
function parseTitleFromDocument(): string | null {
  const docTitle = document.title?.trim();
  if (!docTitle) return null;

  // Remove " - ChatGPT" or " | ChatGPT" suffix
  const suffixPattern = /\s*[-|]\s*ChatGPT$/i;
  const cleaned = docTitle.replace(suffixPattern, '').trim();

  // If we just have "ChatGPT" or empty, no title
  if (!cleaned || cleaned.toLowerCase() === 'chatgpt') {
    return null;
  }

  return cleaned;
}

/**
 * Check if we're on a conversation page
 */
export function isConversationPage(): boolean {
  const url = window.location.href;
  return url.includes('/c/');
}

/**
 * Get the current conversation title
 */
export function getConversationTitle(): string {
  // Only try to get title on conversation pages
  if (!isConversationPage()) {
    return UNTITLED_CONVERSATION;
  }

  // Try DOM selectors first
  const element = queryWithFallbacks(TITLE_SELECTORS);
  const domTitle = getTextContent(element);

  if (domTitle) {
    return domTitle;
  }

  // Fallback to document title parsing
  const docTitle = parseTitleFromDocument();
  if (docTitle) {
    return docTitle;
  }

  return UNTITLED_CONVERSATION;
}

/**
 * Get the current project name (if in a project)
 */
export function getProjectName(): string | null {
  // Check URL for project pattern first
  const url = window.location.href;
  const urlMatch = url.match(PROJECT_URL_REGEX);

  // URL indicates we're in a project context
  if (urlMatch) {
    // Try to find the project name in DOM
    const element = queryWithFallbacks(PROJECT_SELECTORS);
    const projectName = getTextContent(element);

    if (projectName) {
      return projectName;
    }

    // If we have a project URL but can't find the name, return null
    // (better than showing an ID)
    return null;
  }

  return null;
}

/**
 * Get the canonical conversation URL
 */
export function getConversationUrl(): string {
  return window.location.href;
}

/**
 * Get the full conversation context
 */
export function getFullContext(): ConversationContext {
  return {
    title: getConversationTitle(),
    projectName: getProjectName(),
    url: getConversationUrl(),
  };
}

/**
 * Format the display text for the title element
 */
export function formatDisplayText(context: ConversationContext): string {
  if (context.projectName) {
    return `${context.projectName}${DELIMITER}${context.title}`;
  }
  return context.title;
}

/**
 * Check if two contexts are equal
 */
export function contextEquals(
  a: ConversationContext | null,
  b: ConversationContext | null
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;

  return (
    a.title === b.title &&
    a.projectName === b.projectName &&
    a.url === b.url
  );
}
