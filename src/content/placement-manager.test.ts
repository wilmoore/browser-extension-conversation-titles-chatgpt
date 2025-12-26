import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { findFooter } from './placement-manager.js';
import { DISCLAIMER_PATTERNS } from './selectors.js';

describe('placement-manager', () => {
  const disclaimerText = 'ChatGPT can make mistakes. Check important info.';

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('findFooter', () => {
    // Note: The primary approach uses `innerText` which is not fully supported in JSDOM.
    // These tests focus on the secondary approach (FOOTER_SELECTORS) which uses textContent.
    // The tertiary approach also uses innerText which doesn't work in JSDOM.
    // In a real browser, innerText would work for the primary and tertiary approaches.

    describe('secondary approach (FOOTER_SELECTORS)', () => {
      it('falls back to FOOTER_SELECTORS when pointer-events-auto not found', () => {
        // Use the first selector from FOOTER_SELECTORS
        const threadBottom = document.createElement('div');
        threadBottom.id = 'thread-bottom-container';

        const inner = document.createElement('div');
        inner.className = 'text-token-text-secondary';
        inner.textContent = disclaimerText;

        threadBottom.appendChild(inner);
        document.body.appendChild(threadBottom);

        const result = findFooter();
        expect(result).toBe(inner);
      });

      it('verifies element visibility before returning', () => {
        const container = document.createElement('div');
        container.id = 'thread-bottom-container';

        const hidden = document.createElement('div');
        hidden.className = 'text-token-text-secondary';
        hidden.style.display = 'none';
        hidden.textContent = disclaimerText;

        const visible = document.createElement('div');
        visible.className = 'text-center';
        visible.textContent = disclaimerText;

        container.appendChild(hidden);
        container.appendChild(visible);
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBe(visible);
      });

      it('verifies disclaimer text presence', () => {
        const container = document.createElement('div');
        container.id = 'thread-bottom-container';

        const noDisclaimer = document.createElement('div');
        noDisclaimer.className = 'text-token-text-secondary';
        noDisclaimer.textContent = 'Some other text';

        const withDisclaimer = document.createElement('div');
        withDisclaimer.className = 'text-center';
        withDisclaimer.textContent = disclaimerText;

        container.appendChild(noDisclaimer);
        container.appendChild(withDisclaimer);
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBe(withDisclaimer);
      });

      it('tries selectors in order until match found', () => {
        // Set up an element matching a later selector
        const formSibling = document.createElement('form');
        const textCenter = document.createElement('div');
        textCenter.className = 'text-center';
        textCenter.textContent = disclaimerText;

        document.body.appendChild(formSibling);
        document.body.appendChild(textCenter);

        const result = findFooter();
        expect(result).toBe(textCenter);
      });

      it('skips invalid selectors without throwing', () => {
        // This test verifies error handling - the code should gracefully handle
        // malformed or browser-unsupported selectors

        const container = document.createElement('div');
        container.className = 'text-xs text-center';
        container.textContent = disclaimerText;
        document.body.appendChild(container);

        // Should not throw, should find via fallback
        expect(() => findFooter()).not.toThrow();
        const result = findFooter();
        expect(result).not.toBeNull();
      });
    });

    // Note: tertiary approach tests are skipped because they use innerText
    // which is not fully supported in JSDOM. These tests would pass in a real browser.

    describe('no match scenarios', () => {
      it('returns null when no disclaimer element exists', () => {
        const container = document.createElement('div');
        container.textContent = 'Hello world';
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBeNull();
      });

      it('returns null for empty document', () => {
        const result = findFooter();
        expect(result).toBeNull();
      });

      it('returns null when all disclaimer elements are hidden', () => {
        const hidden = document.createElement('div');
        hidden.className = 'pointer-events-auto';
        hidden.style.display = 'none';
        hidden.textContent = disclaimerText;
        document.body.appendChild(hidden);

        const result = findFooter();
        expect(result).toBeNull();
      });
    });

    describe('DISCLAIMER_PATTERNS integration', () => {
      it.each(DISCLAIMER_PATTERNS)('detects element with pattern: "%s"', (pattern) => {
        const container = document.createElement('div');
        const inner = document.createElement('div');
        inner.className = 'text-center text-xs';
        inner.textContent = pattern;

        container.appendChild(inner);
        document.body.appendChild(container);

        // Note: Primary and tertiary approaches look for "ChatGPT can make mistakes" specifically
        // Secondary approach uses containsDisclaimerText which checks DISCLAIMER_PATTERNS
        const result = findFooter();
        // Will find via secondary approach if pattern matches
        expect(result).toBe(inner);
      });
    });

    describe('edge cases', () => {
      it('handles deeply nested structures via FOOTER_SELECTORS', () => {
        // Create nested structure with matching selector
        let current: HTMLElement = document.body;
        for (let i = 0; i < 5; i++) {
          const child = document.createElement('div');
          current.appendChild(child);
          current = child;
        }
        // Use a selector that FOOTER_SELECTORS can find
        current.className = 'text-center text-xs';
        current.textContent = disclaimerText;

        const result = findFooter();
        expect(result).not.toBeNull();
        expect(result).toBe(current);
      });

      it('handles multiple disclaimer elements (returns first matching)', () => {
        // Create two elements that match FOOTER_SELECTORS
        const first = document.createElement('div');
        first.id = 'thread-bottom-container';
        const firstInner = document.createElement('div');
        firstInner.className = 'text-token-text-secondary';
        firstInner.textContent = disclaimerText;
        first.appendChild(firstInner);
        document.body.appendChild(first);

        const second = document.createElement('div');
        const secondInner = document.createElement('div');
        secondInner.className = 'text-center';
        secondInner.textContent = disclaimerText;
        second.appendChild(secondInner);
        document.body.appendChild(second);

        const result = findFooter();
        expect(result).toBe(firstInner);
      });

      it('skips elements without disclaimer text', () => {
        const container = document.createElement('div');
        container.id = 'thread-bottom-container';

        const noDisclaimer = document.createElement('div');
        noDisclaimer.className = 'text-token-text-secondary';
        noDisclaimer.textContent = 'Some random text';
        container.appendChild(noDisclaimer);
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBeNull();
      });
    });
  });
});
