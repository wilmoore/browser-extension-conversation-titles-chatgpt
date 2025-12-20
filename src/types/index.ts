/**
 * Represents the extracted context from a ChatGPT conversation
 */
export interface ConversationContext {
  /** The conversation title */
  title: string;
  /** The project name, or null if not in a project */
  projectName: string | null;
  /** The canonical conversation URL */
  url: string;
}

/**
 * Copy format types
 */
export enum CopyFormat {
  /** Title only */
  TITLE = 'TITLE',
  /** Project name + title (full context) */
  FULL_CONTEXT = 'FULL_CONTEXT',
  /** Markdown link format */
  MARKDOWN = 'MARKDOWN',
  /** Raw URL */
  URL = 'URL',
}

/**
 * User preferences for copy shortcuts and feedback
 */
export interface CopyPreferences {
  /** Format for plain click */
  click: CopyFormat;
  /** Format for Shift+click */
  shiftClick: CopyFormat;
  /** Format for Cmd/Ctrl+click */
  modClick: CopyFormat;
  /** Format for Cmd/Ctrl+Shift+click */
  modShiftClick: CopyFormat;
  /** Play audio on copy */
  audioFeedback: boolean;
}

/**
 * Default preferences (markdown as default, audio off)
 */
export const DEFAULT_PREFERENCES: CopyPreferences = {
  click: CopyFormat.MARKDOWN,
  shiftClick: CopyFormat.FULL_CONTEXT,
  modClick: CopyFormat.TITLE,
  modShiftClick: CopyFormat.URL,
  audioFeedback: false,
};
