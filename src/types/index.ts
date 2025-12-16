/**
 * Represents the extracted context from a ChatGPT conversation
 */
export interface ConversationContext {
  /** The conversation title, or "Untitled Conversation" if not found */
  title: string;
  /** The project name, or null if not in a project */
  projectName: string | null;
  /** The canonical conversation URL */
  url: string;
}

/**
 * Placement locations for the title display
 */
export enum PlacementLocation {
  /** Title displayed in top navigation bar */
  TOP_NAV = 'TOP_NAV',
  /** Title displayed in footer area */
  FOOTER = 'FOOTER',
  /** No placement (extension dormant) */
  NONE = 'NONE',
}

/**
 * Internal placement state for the state machine
 */
export enum PlacementState {
  /** Initial state, no placement determined */
  IDLE = 'IDLE',
  /** Checking if top nav is stable */
  CHECKING_NAV = 'CHECKING_NAV',
  /** Placed in top nav */
  IN_TOP_NAV = 'IN_TOP_NAV',
  /** Checking before demotion to footer */
  CHECKING_DEMOTION = 'CHECKING_DEMOTION',
  /** Placed in footer */
  IN_FOOTER = 'IN_FOOTER',
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
