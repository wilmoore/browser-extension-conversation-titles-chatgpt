import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TIMING } from './selectors.js';

/**
 * Tests for SPA navigation title display behavior.
 *
 * These tests verify the title observer and waiting state logic
 * that handles the timing issue during SPA navigation.
 */
describe('index (SPA navigation)', () => {
  // Mock state for tracking observers
  let titleObserverCallback: MutationCallback | null = null;
  let observerCalls: Array<{ target: Node; options: MutationObserverInit }> = [];
  let disconnectCalls = 0;

  // Mock location and title
  let mockLocationHref: string;
  let mockDocumentTitle: string;

  // Mock Chrome API
  const mockChrome = {
    storage: {
      sync: {
        get: vi.fn().mockResolvedValue({}),
        set: vi.fn().mockResolvedValue(undefined),
      },
      onChanged: {
        addListener: vi.fn(),
      },
    },
    runtime: {
      id: 'test-extension-id',
    },
  };

  beforeEach(() => {
    vi.resetModules();

    mockLocationHref = 'https://chatgpt.com/';
    mockDocumentTitle = 'ChatGPT';
    observerCalls = [];
    titleObserverCallback = null;
    disconnectCalls = 0;

    // Mock chrome global
    vi.stubGlobal('chrome', mockChrome);

    // Mock location
    vi.stubGlobal('location', {
      get href() {
        return mockLocationHref;
      },
    });

    // Mock document.title
    Object.defineProperty(document, 'title', {
      get: () => mockDocumentTitle,
      set: (val: string) => {
        mockDocumentTitle = val;
      },
      configurable: true,
    });

    // Create a real title element for querySelector to find
    const titleElement = document.createElement('title');
    titleElement.textContent = mockDocumentTitle;
    document.head.appendChild(titleElement);

    // Mock MutationObserver that tracks calls
    const MockMutationObserver = vi.fn().mockImplementation((callback: MutationCallback) => {
      return {
        observe: (target: Node, options: MutationObserverInit) => {
          observerCalls.push({ target, options });
          // Track title observer callback
          if ((target as Element).tagName === 'TITLE') {
            titleObserverCallback = callback;
          }
        },
        disconnect: () => {
          disconnectCalls++;
        },
      };
    });

    vi.stubGlobal('MutationObserver', MockMutationObserver);
  });

  afterEach(() => {
    // Clean up title element
    const titleElement = document.querySelector('title');
    if (titleElement) {
      titleElement.remove();
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('TIMING constants', () => {
    it('has TITLE_WAIT_TIMEOUT defined', () => {
      expect(TIMING.TITLE_WAIT_TIMEOUT).toBe(3000);
    });

    it('has DEBOUNCE_DELAY defined', () => {
      expect(TIMING.DEBOUNCE_DELAY).toBe(100);
    });

    it('has URL_POLL_INTERVAL defined', () => {
      expect(TIMING.URL_POLL_INTERVAL).toBe(500);
    });
  });

  describe('title observer initialization', () => {
    it('creates a MutationObserver for the title element', async () => {
      await import('./index.js');

      // Find the title observer call
      const titleObserverCall = observerCalls.find(
        (call) => (call.target as Element).tagName === 'TITLE'
      );

      expect(titleObserverCall).toBeDefined();
    });

    it('observes childList, characterData, and subtree changes on title element', async () => {
      await import('./index.js');

      // Find the title observer call
      const titleObserverCall = observerCalls.find(
        (call) => (call.target as Element).tagName === 'TITLE'
      );

      expect(titleObserverCall).toBeDefined();
      expect(titleObserverCall?.options).toMatchObject({
        childList: true,
        characterData: true,
        subtree: true,
      });
    });

    it('also creates a body observer for DOM changes', async () => {
      await import('./index.js');

      // Find the body observer call
      const bodyObserverCall = observerCalls.find((call) => call.target === document.body);

      expect(bodyObserverCall).toBeDefined();
      expect(bodyObserverCall?.options).toMatchObject({
        childList: true,
        subtree: true,
        attributes: true,
      });
    });
  });

  describe('waiting state behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('title observer callback triggers update when waiting for title', async () => {
      // Start on homepage
      mockLocationHref = 'https://chatgpt.com/';
      mockDocumentTitle = 'ChatGPT';

      await import('./index.js');

      // Navigate to conversation (title not ready)
      mockLocationHref = 'https://chatgpt.com/c/abc123';

      // Trigger URL poll to detect change
      vi.advanceTimersByTime(TIMING.URL_POLL_INTERVAL);

      // At this point, waitingForTitle should be true internally
      // Now update the title
      mockDocumentTitle = 'My Conversation - ChatGPT';

      // Trigger the title observer callback
      if (titleObserverCallback) {
        titleObserverCallback([], {} as MutationObserver);
      }

      // Should complete without throwing
      vi.advanceTimersByTime(TIMING.TITLE_WAIT_TIMEOUT);
    });

    it('timeout clears waiting state after TITLE_WAIT_TIMEOUT', async () => {
      mockLocationHref = 'https://chatgpt.com/';
      mockDocumentTitle = 'ChatGPT';

      await import('./index.js');

      // Navigate to conversation (title never updates)
      mockLocationHref = 'https://chatgpt.com/c/abc123';
      vi.advanceTimersByTime(TIMING.URL_POLL_INTERVAL);

      // Fast-forward past the timeout
      vi.advanceTimersByTime(TIMING.TITLE_WAIT_TIMEOUT);

      // Further time advances should not cause issues
      vi.advanceTimersByTime(TIMING.TITLE_WAIT_TIMEOUT);
    });
  });

  describe('rapid navigation handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('handles rapid navigation between conversations', async () => {
      mockLocationHref = 'https://chatgpt.com/';
      mockDocumentTitle = 'ChatGPT';

      await import('./index.js');

      // Navigate to first conversation
      mockLocationHref = 'https://chatgpt.com/c/abc123';
      vi.advanceTimersByTime(TIMING.URL_POLL_INTERVAL);

      // Immediately navigate to second conversation (before title updates)
      mockLocationHref = 'https://chatgpt.com/c/def456';
      vi.advanceTimersByTime(TIMING.URL_POLL_INTERVAL);

      // Update title for second conversation
      mockDocumentTitle = 'Second Conversation - ChatGPT';

      // Trigger title observer
      if (titleObserverCallback) {
        titleObserverCallback([], {} as MutationObserver);
      }

      // Should handle gracefully without errors
      vi.advanceTimersByTime(TIMING.TITLE_WAIT_TIMEOUT);
    });
  });

  describe('cleanup behavior', () => {
    it('disconnects observers on unload', async () => {
      vi.useFakeTimers();

      mockLocationHref = 'https://chatgpt.com/c/abc123';
      mockDocumentTitle = 'ChatGPT';

      await import('./index.js');

      // Trigger URL change to set waiting state
      vi.advanceTimersByTime(TIMING.URL_POLL_INTERVAL);

      const disconnectsBefore = disconnectCalls;

      // Trigger unload
      window.dispatchEvent(new Event('unload'));

      // Should have called disconnect on observers
      expect(disconnectCalls).toBeGreaterThan(disconnectsBefore);
    });

    it('clears timers on unload without throwing', async () => {
      vi.useFakeTimers();

      mockLocationHref = 'https://chatgpt.com/c/abc123';
      mockDocumentTitle = 'ChatGPT';

      await import('./index.js');

      // Trigger URL change to set waiting state
      vi.advanceTimersByTime(TIMING.URL_POLL_INTERVAL);

      // Trigger unload
      window.dispatchEvent(new Event('unload'));

      // Fast-forward past any pending timers - should not throw
      vi.advanceTimersByTime(TIMING.TITLE_WAIT_TIMEOUT * 2);
    });
  });
});
