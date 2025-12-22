import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getShortcutKey, getCopyFormat, setPreferences } from './copy-handler.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';

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
});
