import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { findFooter } from './placement-manager.js';

describe('placement-manager', () => {
  const disclaimerText = 'ChatGPT can make mistakes. Check important info.';
  const customGptText = 'New version of GPT available - Continue chatting to use the old version, or start a new chat for the latest version.';

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('findFooter', () => {
    describe('primary approach (vt-disclaimer structural selector)', () => {
      it('finds footer with vt-disclaimer class pattern', () => {
        const container = document.createElement('div');
        container.className = 'text-center [view-transition-name:var(--vt-disclaimer)]';
        container.textContent = disclaimerText;
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBe(container);
      });

      it('finds footer with standard disclaimer text', () => {
        const container = document.createElement('div');
        container.className = 'some-class [view-transition-name:var(--vt-disclaimer)]';
        container.textContent = disclaimerText;
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBe(container);
      });

      it('finds footer with custom GPT version message', () => {
        // This is the key test - custom GPT footer should be found
        const container = document.createElement('div');
        container.className = '-mt-4 text-token-text-secondary [view-transition-name:var(--vt-disclaimer)]';
        container.textContent = customGptText;
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBe(container);
      });

      it('finds footer with any text content', () => {
        const container = document.createElement('div');
        container.className = 'text-center [view-transition-name:var(--vt-disclaimer)]';
        container.textContent = 'Any random footer text';
        document.body.appendChild(container);

        const result = findFooter();
        expect(result).toBe(container);
      });

      it('verifies element visibility before returning', () => {
        const hidden = document.createElement('div');
        hidden.className = '[view-transition-name:var(--vt-disclaimer)]';
        hidden.style.display = 'none';
        hidden.textContent = disclaimerText;
        document.body.appendChild(hidden);

        const visible = document.createElement('div');
        visible.id = 'thread-bottom-container';
        const inner = document.createElement('div');
        inner.className = 'text-center';
        inner.textContent = disclaimerText;
        visible.appendChild(inner);
        document.body.appendChild(visible);

        const result = findFooter();
        // Should skip hidden vt-disclaimer and use fallback
        expect(result).toBe(inner);
      });
    });

    describe('fallback approach (#thread-bottom-container)', () => {
      it('falls back to thread-bottom-container when vt-disclaimer not found', () => {
        const threadBottom = document.createElement('div');
        threadBottom.id = 'thread-bottom-container';

        const inner = document.createElement('div');
        inner.className = 'text-center';
        inner.textContent = disclaimerText;

        threadBottom.appendChild(inner);
        document.body.appendChild(threadBottom);

        const result = findFooter();
        expect(result).toBe(inner);
      });

      it('finds footer in thread-bottom-container with custom GPT text', () => {
        const threadBottom = document.createElement('div');
        threadBottom.id = 'thread-bottom-container';

        const inner = document.createElement('div');
        inner.className = 'text-center';
        inner.textContent = customGptText;

        threadBottom.appendChild(inner);
        document.body.appendChild(threadBottom);

        const result = findFooter();
        expect(result).toBe(inner);
      });
    });

    describe('tertiary approach (FOOTER_SELECTORS)', () => {
      it('falls back to FOOTER_SELECTORS when other approaches fail', () => {
        const container = document.createElement('div');
        container.className = 'text-center text-xs';
        container.textContent = disclaimerText;
        document.body.appendChild(container);

        // Should not throw, should find via fallback
        expect(() => findFooter()).not.toThrow();
        const result = findFooter();
        expect(result).not.toBeNull();
      });

      it('skips invalid selectors without throwing', () => {
        const container = document.createElement('div');
        container.className = 'text-xs text-center';
        container.textContent = disclaimerText;
        document.body.appendChild(container);

        expect(() => findFooter()).not.toThrow();
        const result = findFooter();
        expect(result).not.toBeNull();
      });
    });

    describe('no match scenarios', () => {
      it('returns null for empty document', () => {
        const result = findFooter();
        expect(result).toBeNull();
      });

      it('returns null when all matching elements are hidden', () => {
        const hidden = document.createElement('div');
        hidden.className = '[view-transition-name:var(--vt-disclaimer)]';
        hidden.style.display = 'none';
        hidden.textContent = disclaimerText;
        document.body.appendChild(hidden);

        const result = findFooter();
        expect(result).toBeNull();
      });

      it('returns null when no structural matches exist', () => {
        // Random element without any matching selectors
        const random = document.createElement('div');
        random.className = 'some-random-class';
        random.textContent = 'Hello world';
        document.body.appendChild(random);

        const result = findFooter();
        expect(result).toBeNull();
      });
    });

    describe('edge cases', () => {
      it('handles deeply nested structures via FOOTER_SELECTORS', () => {
        let current: HTMLElement = document.body;
        for (let i = 0; i < 5; i++) {
          const child = document.createElement('div');
          current.appendChild(child);
          current = child;
        }
        current.className = 'text-center text-xs';
        current.textContent = disclaimerText;

        const result = findFooter();
        expect(result).not.toBeNull();
        expect(result).toBe(current);
      });

      it('prioritizes vt-disclaimer over thread-bottom-container', () => {
        // Add thread-bottom-container first
        const threadBottom = document.createElement('div');
        threadBottom.id = 'thread-bottom-container';
        const inner = document.createElement('div');
        inner.className = 'text-center';
        inner.textContent = 'Thread bottom text';
        threadBottom.appendChild(inner);
        document.body.appendChild(threadBottom);

        // Add vt-disclaimer second (but should be found first)
        const vtDisclaimer = document.createElement('div');
        vtDisclaimer.className = '[view-transition-name:var(--vt-disclaimer)]';
        vtDisclaimer.textContent = 'VT Disclaimer text';
        document.body.appendChild(vtDisclaimer);

        const result = findFooter();
        expect(result).toBe(vtDisclaimer);
      });

      it('handles multiple matching elements (returns first visible)', () => {
        const first = document.createElement('div');
        first.className = '[view-transition-name:var(--vt-disclaimer)]';
        first.textContent = 'First';
        document.body.appendChild(first);

        const second = document.createElement('div');
        second.className = '[view-transition-name:var(--vt-disclaimer)]';
        second.textContent = 'Second';
        document.body.appendChild(second);

        const result = findFooter();
        expect(result).toBe(first);
      });
    });
  });
});
