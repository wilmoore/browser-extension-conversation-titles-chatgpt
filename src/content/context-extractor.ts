import type { ConversationContext } from '../types/index.js';
import { TITLE_SELECTORS, DELIMITER } from './selectors.js';

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
 * Check if URL indicates a project conversation
 */
function isProjectUrl(): boolean {
  const url = window.location.href;
  return /\/g\/g-p-[^/]+\/c\//.test(url);
}

/**
 * Parsed title result for project conversations
 */
interface ParsedProjectTitle {
  projectName: string;
  conversationTitle: string;
}

/**
 * Parse document title for project conversations
 * Document title format: "ProjectName - ConversationTitle - ChatGPT"
 * Returns null if not a valid project conversation title
 */
function parseProjectTitle(): ParsedProjectTitle | null {
  if (!isProjectUrl()) return null;

  const docTitle = document.title?.trim();
  if (!docTitle) return null;

  // Remove " - ChatGPT" suffix first
  const suffixPattern = /\s*[-–|]\s*ChatGPT$/i;
  const withoutSuffix = docTitle.replace(suffixPattern, '').trim();

  if (!withoutSuffix || withoutSuffix.toLowerCase() === 'chatgpt') {
    return null;
  }

  // Split by " - " to get [ProjectName, ConversationTitle]
  // Use regex to handle both hyphen (-) and en-dash (–)
  const parts = withoutSuffix.split(/\s*[-–]\s*/);

  // Need at least 2 parts for project + conversation
  if (parts.length < 2) {
    return null;
  }

  const projectName = parts[0].trim();
  // Join remaining parts in case conversation title contains hyphens
  const conversationTitle = parts.slice(1).join(' - ').trim();

  if (!projectName || !conversationTitle) {
    return null;
  }

  return { projectName, conversationTitle };
}

/**
 * Parse simple title from document (non-project conversations)
 * Document title format: "ConversationTitle - ChatGPT"
 */
function parseSimpleTitle(): string | null {
  const docTitle = document.title?.trim();
  if (!docTitle) return null;

  // Remove " - ChatGPT" or " | ChatGPT" suffix
  const suffixPattern = /\s*[-–|]\s*ChatGPT$/i;
  let cleaned = docTitle.replace(suffixPattern, '').trim();

  // Also remove "ChatGPT - " or "ChatGPT | " prefix
  const prefixPattern = /^ChatGPT\s*[-–|]\s*/i;
  cleaned = cleaned.replace(prefixPattern, '').trim();

  // If empty or exactly "ChatGPT", no title
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
 * Check if we're in a project
 */
export function isProjectConversation(): boolean {
  const url = window.location.href;
  return url.includes('/g/') && url.includes('/c/');
}

/**
 * Get the current conversation title
 * For project conversations: returns conversation-specific part only (excludes project prefix)
 * For non-project conversations: returns full title
 * Returns null if no title can be determined (don't render in this case)
 */
export function getConversationTitle(): string | null {
  // Only try to get title on conversation pages
  if (!isConversationPage()) {
    return null;
  }

  // For project conversations, extract just the conversation-specific part
  if (isProjectConversation()) {
    const parsed = parseProjectTitle();
    if (parsed) {
      return parsed.conversationTitle;
    }
    // No valid project title yet
    return null;
  }

  // For non-project conversations, use simple parsing
  const simpleTitle = parseSimpleTitle();
  if (simpleTitle) {
    return simpleTitle;
  }

  // Fallback to DOM selectors (sidebar active item)
  const element = queryWithFallbacks(TITLE_SELECTORS);
  const domTitle = getTextContent(element);

  if (domTitle) {
    // Skip if it's exactly "ChatGPT"
    if (domTitle.toLowerCase() === 'chatgpt') {
      return null;
    }
    return domTitle;
  }

  // No title found yet - return null to skip rendering
  return null;
}

/**
 * Get the current project name from document title (properly cased)
 * Returns null if not in a project conversation or no valid title
 */
export function getProjectName(): string | null {
  if (!isProjectConversation()) {
    return null;
  }

  // Get project name from document title (properly cased)
  const parsed = parseProjectTitle();
  if (parsed) {
    return parsed.projectName;
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
 * Returns null if we don't have a valid title yet
 */
export function getFullContext(): ConversationContext | null {
  const title = getConversationTitle();

  // Don't return context if we don't have a real title
  if (title === null) {
    return null;
  }

  return {
    title,
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
