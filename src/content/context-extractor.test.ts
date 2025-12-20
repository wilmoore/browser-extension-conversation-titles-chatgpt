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

    it('extracts title from "Title - ChatGPT" format', () => {
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

    it('returns null when title equals project name only', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      document.title = 'themeeting fail - ChatGPT';
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
  });

  describe('getProjectName', () => {
    it('returns null when not in project conversation', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/c/abc123',
      });
      expect(getProjectName()).toBe(null);
    });

    it('extracts project name with dots for domain-like names', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      expect(getProjectName()).toBe('themeeting.fail');
    });

    it('extracts project name with dots for .com domains', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-example-com/c/def456',
      });
      expect(getProjectName()).toBe('example.com');
    });

    it('extracts project name with dots for .io domains', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-myapp-io/c/def456',
      });
      expect(getProjectName()).toBe('myapp.io');
    });

    it('extracts project name with spaces for non-domain names', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-my-awesome-project/c/def456',
      });
      expect(getProjectName()).toBe('my awesome project');
    });

    it('handles single-word project names', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-projectname/c/def456',
      });
      expect(getProjectName()).toBe('projectname');
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

    it('returns context with project name for project conversations', () => {
      vi.stubGlobal('location', {
        href: 'https://chatgpt.com/g/g-p-abc123-themeeting-fail/c/def456',
      });
      document.title = 'UI Design Discussion - ChatGPT';

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
