import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isConversationPage,
  isProjectConversation,
  getConversationTitle,
  getProjectName,
  getConversationUrl,
  getFullContext,
  formatDisplayText,
  contextEquals,
} from './context-extractor.js';

describe('context-extractor', () => {
  beforeEach(() => {
    // Reset document title
    document.title = '';
    // Reset URL - use Object.defineProperty since location.href is read-only
    vi.stubGlobal('location', {
      href: 'https://chatgpt.com/',
    });
  });

  describe('isConversationPage', () => {
    it('returns true when URL contains /c/', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      expect(isConversationPage()).toBe(true);
    });

    it('returns false when URL does not contain /c/', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/',
      });
      expect(isConversationPage()).toBe(false);
    });

    it('returns false on homepage', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/',
      });
      expect(isConversationPage()).toBe(false);
    });
  });

  describe('isProjectConversation', () => {
    it('returns true when URL contains both /g/ and /c/', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-my-project/c/def456',
      });
      expect(isProjectConversation()).toBe(true);
    });

    it('returns false when URL only contains /c/', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      expect(isProjectConversation()).toBe(false);
    });

    it('returns false when URL only contains /g/', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-abc123',
      });
      expect(isProjectConversation()).toBe(false);
    });
  });

  describe('getConversationTitle', () => {
    it('returns null when not on conversation page', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/',
      });
      document.title = 'ChatGPT';
      expect(getConversationTitle()).toBe(null);
    });

    it('extracts title from "Title - ChatGPT" format (non-project)', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'My Conversation Title - ChatGPT';
      expect(getConversationTitle()).toBe('My Conversation Title');
    });

    it('extracts title from "Title – ChatGPT" format (en-dash)', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'My Conversation Title – ChatGPT';
      expect(getConversationTitle()).toBe('My Conversation Title');
    });

    it('extracts title from "Title | ChatGPT" format', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'My Conversation Title | ChatGPT';
      expect(getConversationTitle()).toBe('My Conversation Title');
    });

    it('strips "ChatGPT - " prefix', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'ChatGPT - themeeting.fail';
      expect(getConversationTitle()).toBe('themeeting.fail');
    });

    it('strips both prefix and suffix', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'ChatGPT – themeeting.fail - ChatGPT';
      expect(getConversationTitle()).toBe('themeeting.fail');
    });

    it('returns null when title is just "ChatGPT"', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'ChatGPT';
      expect(getConversationTitle()).toBe(null);
    });

    it('returns null when title equals project name only (project conversation)', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      document.title = 'themeeting.fail - ChatGPT';
      expect(getConversationTitle()).toBe(null);
    });

    it('returns title when it contains "ChatGPT" but is not equal to it', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'How to use ChatGPT API - ChatGPT';
      expect(getConversationTitle()).toBe('How to use ChatGPT API');
    });

    it('handles empty document title', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = '';
      expect(getConversationTitle()).toBe(null);
    });

    it('handles whitespace-only title', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = '   ';
      expect(getConversationTitle()).toBe(null);
    });

    // Project conversation: extracts conversation-specific part only
    it('extracts conversation part only for project conversations (excludes project prefix)', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
      // Document title format: "ProjectName - ConversationTitle - ChatGPT"
      document.title = 'Business Ideas - Consulting firms and AI - ChatGPT';
      expect(getConversationTitle()).toBe('Consulting firms and AI');
    });

    it('extracts conversation part for domain-style project names', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      document.title = 'themeeting.fail - UI Design Discussion - ChatGPT';
      expect(getConversationTitle()).toBe('UI Design Discussion');
    });

    it('handles conversation titles that contain hyphens', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
      // Conversation title contains a hyphen
      document.title = 'Business Ideas - A/B testing - best practices - ChatGPT';
      expect(getConversationTitle()).toBe('A/B testing - best practices');
    });
  });

  describe('getProjectName', () => {
    it('returns null when not in project conversation', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'My Conversation - ChatGPT';
      expect(getProjectName()).toBe(null);
    });

    // Project name should come from document title (properly cased), not URL slug
    it('extracts project name from document title (properly cased)', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
      document.title = 'Business Ideas - Consulting firms and AI - ChatGPT';
      expect(getProjectName()).toBe('Business Ideas');
    });

    it('extracts domain-style project name from document title', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      document.title = 'themeeting.fail - UI Design Discussion - ChatGPT';
      expect(getProjectName()).toBe('themeeting.fail');
    });

    it('extracts project name with proper casing for multi-word names', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-my-awesome-project/c/def456',
      });
      document.title = 'My Awesome Project - Feature Discussion - ChatGPT';
      expect(getProjectName()).toBe('My Awesome Project');
    });

    it('returns null when document title has no conversation part yet', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
      // Only project name in title, no conversation title yet
      document.title = 'Business Ideas - ChatGPT';
      expect(getProjectName()).toBe(null);
    });
  });

  describe('getConversationUrl', () => {
    it('returns current URL', () => {
      const testUrl = 'https://chatgpt.com/c/abc123';
      vi.stubGlobal('location', {
        href: testUrl,
      });
      expect(getConversationUrl()).toBe(testUrl);
    });
  });

  describe('getFullContext', () => {
    it('returns null when no title available', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/',
      });
      document.title = 'ChatGPT';
      expect(getFullContext()).toBe(null);
    });

    it('returns context with title only for regular conversations', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      document.title = 'My Conversation - ChatGPT';

      const context = getFullContext();
      expect(context).toEqual({
        title: 'My Conversation',
        projectName: null,
        url: 'https://chatgpt.com/c/abc123',
      });
    });

    it('returns context with project name and conversation-specific title for project conversations', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
      // Document title format: "ProjectName - ConversationTitle - ChatGPT"
      document.title = 'Business Ideas - Consulting firms and AI - ChatGPT';

      const context = getFullContext();
      expect(context).toEqual({
        title: 'Consulting firms and AI', // conversation-specific part only
        projectName: 'Business Ideas', // from document title (properly cased)
        url: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
    });

    it('returns context for domain-style project names', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      document.title = 'themeeting.fail - UI Design Discussion - ChatGPT';

      const context = getFullContext();
      expect(context).toEqual({
        title: 'UI Design Discussion',
        projectName: 'themeeting.fail',
        url: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
    });
  });

  describe('formatDisplayText', () => {
    it('returns title only when no project name', () => {
      const result = formatDisplayText({
        title: 'My Conversation',
        projectName: null,
        url: 'https://chatgpt.com/c/abc123',
      });
      expect(result).toBe('My Conversation');
    });

    it('returns project and title with delimiter when project name exists', () => {
      const result = formatDisplayText({
        title: 'UI Design Discussion',
        projectName: 'themeeting.fail',
        url: 'https://chatgpt.com/c/abc123',
      });
      expect(result).toBe('themeeting.fail – UI Design Discussion');
    });

    // The locked requirement: display should be "Business Ideas – Consulting firms and AI"
    it('formats correctly with properly-cased project name', () => {
      const result = formatDisplayText({
        title: 'Consulting firms and AI',
        projectName: 'Business Ideas',
        url: 'https://chatgpt.com/g/g-p-abc123-business-ideas/c/def456',
      });
      expect(result).toBe('Business Ideas – Consulting firms and AI');
    });
  });

  describe('contextEquals', () => {
    it('returns true for two null contexts', () => {
      expect(contextEquals(null, null)).toBe(true);
    });

    it('returns false when one context is null', () => {
      const context = {
        title: 'Test',
        projectName: null,
        url: 'https://chatgpt.com/c/abc123',
      };
      expect(contextEquals(context, null)).toBe(false);
      expect(contextEquals(null, context)).toBe(false);
    });

    it('returns true for equal contexts', () => {
      const context1 = {
        title: 'Test',
        projectName: 'project',
        url: 'https://chatgpt.com/c/abc123',
      };
      const context2 = {
        title: 'Test',
        projectName: 'project',
        url: 'https://chatgpt.com/c/abc123',
      };
      expect(contextEquals(context1, context2)).toBe(true);
    });

    it('returns false when titles differ', () => {
      const context1 = {
        title: 'Test 1',
        projectName: null,
        url: 'https://chatgpt.com/c/abc123',
      };
      const context2 = {
        title: 'Test 2',
        projectName: null,
        url: 'https://chatgpt.com/c/abc123',
      };
      expect(contextEquals(context1, context2)).toBe(false);
    });

    it('returns false when project names differ', () => {
      const context1 = {
        title: 'Test',
        projectName: 'project1',
        url: 'https://chatgpt.com/c/abc123',
      };
      const context2 = {
        title: 'Test',
        projectName: 'project2',
        url: 'https://chatgpt.com/c/abc123',
      };
      expect(contextEquals(context1, context2)).toBe(false);
    });

    it('returns false when URLs differ', () => {
      const context1 = {
        title: 'Test',
        projectName: null,
        url: 'https://chatgpt.com/c/abc123',
      };
      const context2 = {
        title: 'Test',
        projectName: null,
        url: 'https://chatgpt.com/c/def456',
      };
      expect(contextEquals(context1, context2)).toBe(false);
    });
  });
});
