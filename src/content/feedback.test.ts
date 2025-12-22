import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { showVisualFeedback, playAudioFeedback, setAudioEnabled, showCopyFeedback } from './feedback.js';
import type { ShortcutKey } from './selectors.js';

// Mock the title-renderer module
vi.mock('./title-renderer.js', () => ({
  showTooltipFeedback: vi.fn(),
}));

import { showTooltipFeedback } from './title-renderer.js';

describe('feedback', () => {
  let element: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    element = document.createElement('div');
    element.textContent = 'Test Title';
    document.body.appendChild(element);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    element.remove();
  });

  describe('showVisualFeedback', () => {
    it('applies green color to element', () => {
      showVisualFeedback(element);
      expect(element.style.color).toBe('rgb(16, 163, 127)');
    });

    it('applies transition for smooth animation', () => {
      showVisualFeedback(element);
      expect(element.style.transition).toBe('color 0.1s ease');
    });

    it('resets color after 200ms', () => {
      const originalColor = 'red';
      element.style.color = originalColor;

      showVisualFeedback(element);
      expect(element.style.color).toBe('rgb(16, 163, 127)');

      vi.advanceTimersByTime(200);
      expect(element.style.color).toBe(originalColor);
    });

    it('resets transition after color reset', () => {
      const originalTransition = 'opacity 0.5s';
      element.style.transition = originalTransition;

      showVisualFeedback(element);
      vi.advanceTimersByTime(200);
      vi.advanceTimersByTime(100);

      expect(element.style.transition).toBe(originalTransition);
    });
  });

  describe('playAudioFeedback', () => {
    it('does nothing when audio is disabled', () => {
      setAudioEnabled(false);

      // Should not throw
      expect(() => playAudioFeedback()).not.toThrow();
    });

    it('creates audio context when enabled', () => {
      // Mock AudioContext
      const mockOscillator = {
        connect: vi.fn(),
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        start: vi.fn(),
        stop: vi.fn(),
      };

      const mockGainNode = {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      };

      const mockAudioContext = {
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGainNode),
        destination: {},
        currentTime: 0,
      };

      vi.stubGlobal('AudioContext', vi.fn().mockReturnValue(mockAudioContext));

      setAudioEnabled(true);
      playAudioFeedback();

      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it('silently fails when AudioContext is not available', () => {
      vi.stubGlobal('AudioContext', undefined);
      vi.stubGlobal('webkitAudioContext', undefined);

      setAudioEnabled(true);
      expect(() => playAudioFeedback()).not.toThrow();
    });
  });

  describe('showCopyFeedback', () => {
    it('calls showVisualFeedback', () => {
      const shortcutKey: ShortcutKey = 'click';
      showCopyFeedback(element, shortcutKey);

      // Visual feedback applies color
      expect(element.style.color).toBe('rgb(16, 163, 127)');
    });

    it('calls showTooltipFeedback with correct shortcut key', () => {
      const shortcutKey: ShortcutKey = 'mod';
      showCopyFeedback(element, shortcutKey);

      expect(showTooltipFeedback).toHaveBeenCalledWith(element, shortcutKey);
    });

    it('passes correct shortcut key for each modifier', () => {
      const testCases: ShortcutKey[] = ['click', 'shift', 'mod', 'mod-shift'];

      testCases.forEach((shortcutKey) => {
        vi.clearAllMocks();
        showCopyFeedback(element, shortcutKey);
        expect(showTooltipFeedback).toHaveBeenCalledWith(element, shortcutKey);
      });
    });
  });
});
