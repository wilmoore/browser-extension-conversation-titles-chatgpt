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
 * Extract project slug from URL
 * URL format: https://chatgpt.com/g/g-p-xxx-project-slug/c/xxx
 */
function getProjectSlugFromUrl(): string | null {
  const url = window.location.href;
  // Match: /g/g-p-xxxxx-project-name/c/
  const match = url.match(/\/g\/g-p-[^-]+-([^/]+)\/c\//);
  if (match && match[1]) {
    // Convert slug to readable form: "themeeting-fail" -> "themeeting.fail" or "themeeting fail"
    return match[1].replace(/-/g, ' ').toLowerCase();
  }
  return null;
}

/**
 * Normalize text for comparison (lowercase, remove special chars)
 */
function normalizeForComparison(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a string is just the project name (not a real conversation title)
 */
function isJustProjectName(text: string, projectSlug: string | null): boolean {
  if (!projectSlug) return false;

  const normalizedText = normalizeForComparison(text);
  const normalizedSlug = normalizeForComparison(projectSlug);

  // Check if the text matches the project slug
  return normalizedText === normalizedSlug;
}

/**
 * Parse conversation title from document title
 * Handles various formats:
 * - "Conversation Title - ChatGPT"
 * - "ChatGPT - Project Name" (returns null - no conversation title yet)
 * - "ChatGPT" (returns null)
 */
function parseTitleFromDocument(): string | null {
  const docTitle = document.title?.trim();
  if (!docTitle) return null;

  const projectSlug = getProjectSlugFromUrl();

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

  // If the cleaned title is just the project name, no real title yet
  if (isJustProjectName(cleaned, projectSlug)) {
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
 * Returns null if no title can be determined (don't render in this case)
 */
export function getConversationTitle(): string | null {
  // Only try to get title on conversation pages
  if (!isConversationPage()) {
    return null;
  }

  const projectSlug = getProjectSlugFromUrl();

  // Try document title parsing first (most reliable)
  const docTitle = parseTitleFromDocument();
  if (docTitle) {
    return docTitle;
  }

  // Fallback to DOM selectors (sidebar active item)
  const element = queryWithFallbacks(TITLE_SELECTORS);
  const domTitle = getTextContent(element);

  if (domTitle) {
    // Skip if it's exactly "ChatGPT"
    if (domTitle.toLowerCase() === 'chatgpt') {
      return null;
    }
    // Skip if it's just the project name
    if (isJustProjectName(domTitle, projectSlug)) {
      return null;
    }
    return domTitle;
  }

  // No title found yet - return null to skip rendering
  return null;
}

/**
 * Get the current project name from URL
 */
export function getProjectName(): string | null {
  if (!isProjectConversation()) {
    return null;
  }

  const slug = getProjectSlugFromUrl();
  if (!slug) return null;

  // Convert slug to display format: "themeeting fail" -> "themeeting.fail"
  // Try to preserve the original format by checking common patterns
  const url = window.location.href;
  const match = url.match(/\/g\/g-p-[^-]+-([^/]+)\/c\//);
  if (match && match[1]) {
    // Keep the slug format but replace hyphens with dots for domain-like names
    // or spaces for regular names
    const rawSlug = match[1];
    // If it looks like a domain (has common TLD pattern), use dots
    if (/fail$|com$|org$|net$|io$|app$|dev$/i.test(rawSlug)) {
      return rawSlug.replace(/-/g, '.');
    }
    // Otherwise use the raw slug with hyphens converted to spaces
    return rawSlug.replace(/-/g, ' ');
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
