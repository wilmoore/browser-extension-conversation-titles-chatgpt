import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getShortcutKey,
  getCopyFormat,
  setPreferences,
  formatTitleOnly,
  formatFullContext,
  formatMarkdownLink,
  formatRawUrl,
  getFormattedText,
} from './copy-handler.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';
import type { ConversationContext } from '../types/index.js';

// Mock the feedback module
vi.mock('./feedback.js', () => ({
  showCopyFeedback: vi.fn(),
  setAudioEnabled: vi.fn(),
}));

describe('copy-handler', () => {
  beforeEach(() => {
    setPreferences(DEFAULT_PREFERENCES);
  });

  describe('getShortcutKey', () => {
    it('returns "click" for plain click', () => {
      const event = new MouseEvent('click', {
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      });
      expect(getShortcutKey(event)).toBe('click');
    });

    it('returns "shift" for Shift+click', () => {
      const event = new MouseEvent('click', {
        metaKey: false,
        ctrlKey: false,
        shiftKey: true,
      });
      expect(getShortcutKey(event)).toBe('shift');
    });

    it('returns "mod" for Meta+click (macOS)', () => {
      const event = new MouseEvent('click', {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
      });
      expect(getShortcutKey(event)).toBe('mod');
    });

    it('returns "mod" for Ctrl+click (Windows/Linux)', () => {
      const event = new MouseEvent('click', {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
      });
      expect(getShortcutKey(event)).toBe('mod');
    });

    it('returns "mod-shift" for Meta+Shift+click (macOS)', () => {
      const event = new MouseEvent('click', {
        metaKey: true,
        ctrlKey: false,
        shiftKey: true,
      });
      expect(getShortcutKey(event)).toBe('mod-shift');
    });

    it('returns "mod-shift" for Ctrl+Shift+click (Windows/Linux)', () => {
      const event = new MouseEvent('click', {
        metaKey: false,
        ctrlKey: true,
        shiftKey: true,
      });
      expect(getShortcutKey(event)).toBe('mod-shift');
    });

    it('returns "mod" when both Meta and Ctrl are pressed (edge case)', () => {
      const event = new MouseEvent('click', {
        metaKey: true,
        ctrlKey: true,
        shiftKey: false,
      });
      expect(getShortcutKey(event)).toBe('mod');
    });
  });

  describe('getCopyFormat', () => {
    it('returns click format for plain click', () => {
      const event = new MouseEvent('click', {
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
      });
      expect(getCopyFormat(event)).toBe(DEFAULT_PREFERENCES.click);
    });

    it('returns shiftClick format for Shift+click', () => {
      const event = new MouseEvent('click', {
        shiftKey: true,
      });
      expect(getCopyFormat(event)).toBe(DEFAULT_PREFERENCES.shiftClick);
    });

    it('returns modClick format for Meta+click', () => {
      const event = new MouseEvent('click', {
        metaKey: true,
      });
      expect(getCopyFormat(event)).toBe(DEFAULT_PREFERENCES.modClick);
    });

    it('returns modShiftClick format for Meta+Shift+click', () => {
      const event = new MouseEvent('click', {
        metaKey: true,
        shiftKey: true,
      });
      expect(getCopyFormat(event)).toBe(DEFAULT_PREFERENCES.modShiftClick);
    });

    it('uses custom preferences when set', () => {
      setPreferences({
        click: CopyFormat.URL,
        shiftClick: CopyFormat.MARKDOWN,
        modClick: CopyFormat.FULL_CONTEXT,
        modShiftClick: CopyFormat.TITLE,
        audioFeedback: false,
      });

      const plainClick = new MouseEvent('click', {});
      expect(getCopyFormat(plainClick)).toBe(CopyFormat.URL);

      const shiftClick = new MouseEvent('click', { shiftKey: true });
      expect(getCopyFormat(shiftClick)).toBe(CopyFormat.MARKDOWN);

      const modClick = new MouseEvent('click', { metaKey: true });
      expect(getCopyFormat(modClick)).toBe(CopyFormat.FULL_CONTEXT);

      const modShiftClick = new MouseEvent('click', { metaKey: true, shiftKey: true });
      expect(getCopyFormat(modShiftClick)).toBe(CopyFormat.TITLE);
    });
  });

  describe('format functions', () => {
    const contextWithProject: ConversationContext = {
      title: 'Consulting firms and AI',
      projectName: 'Business Ideas',
      url: 'https://chatgpt.com/g/g-p-abc/c/123',
    };

    const contextWithoutProject: ConversationContext = {
      title: 'My Conversation',
      projectName: null,
      url: 'https://chatgpt.com/c/456',
    };

    describe('formatTitleOnly', () => {
      it('returns only the conversation title, excluding project name', () => {
        expect(formatTitleOnly(contextWithProject)).toBe('Consulting firms and AI');
      });

      it('returns title for non-project conversations', () => {
        expect(formatTitleOnly(contextWithoutProject)).toBe('My Conversation');
      });
    });

    describe('formatFullContext', () => {
      it('returns project name and title with delimiter for project conversations', () => {
        expect(formatFullContext(contextWithProject)).toBe('Business Ideas – Consulting firms and AI');
      });

      it('returns just title for non-project conversations', () => {
        expect(formatFullContext(contextWithoutProject)).toBe('My Conversation');
      });
    });

    describe('formatMarkdownLink', () => {
      it('formats as markdown link with full context', () => {
        expect(formatMarkdownLink(contextWithProject)).toBe(
          '[Business Ideas – Consulting firms and AI](https://chatgpt.com/g/g-p-abc/c/123)'
        );
      });

      it('escapes markdown special characters in title', () => {
        const contextWithBrackets: ConversationContext = {
          title: 'Using [Arrays] in JavaScript',
          projectName: null,
          url: 'https://chatgpt.com/c/789',
        };
        expect(formatMarkdownLink(contextWithBrackets)).toBe(
          '[Using \\[Arrays\\] in JavaScript](https://chatgpt.com/c/789)'
        );
      });
    });

    describe('formatRawUrl', () => {
      it('returns the raw URL', () => {
        expect(formatRawUrl(contextWithProject)).toBe('https://chatgpt.com/g/g-p-abc/c/123');
      });
    });

    describe('getFormattedText', () => {
      it('returns title only for TITLE format', () => {
        expect(getFormattedText(contextWithProject, CopyFormat.TITLE)).toBe('Consulting firms and AI');
      });

      it('returns full context for FULL_CONTEXT format', () => {
        expect(getFormattedText(contextWithProject, CopyFormat.FULL_CONTEXT)).toBe(
          'Business Ideas – Consulting firms and AI'
        );
      });

      it('returns markdown link for MARKDOWN format', () => {
        expect(getFormattedText(contextWithProject, CopyFormat.MARKDOWN)).toBe(
          '[Business Ideas – Consulting firms and AI](https://chatgpt.com/g/g-p-abc/c/123)'
        );
      });

      it('returns URL for URL format', () => {
        expect(getFormattedText(contextWithProject, CopyFormat.URL)).toBe(
          'https://chatgpt.com/g/g-p-abc/c/123'
        );
      });
    });
  });
});
