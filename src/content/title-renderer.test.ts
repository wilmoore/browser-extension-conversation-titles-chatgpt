import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  render,
  removeElement,
  getDisplayElement,
  setTooltipPreferences,
  showTooltipFeedback,
} from './title-renderer.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';
import type { ConversationContext, CopyPreferences } from '../types/index.js';
import { EXTENSION_ELEMENT_ID, TOOLTIP_ID, TIMING } from './selectors.js';

// Mock chrome.i18n
vi.stubGlobal('chrome', {
  i18n: {
    getMessage: vi.fn((key: string) => {
      const messages: Record<string, string> = {
        tooltipMd: 'md',
        tooltipTitle: 'title',
        tooltipFull: 'full',
        tooltipUrl: 'url',
        shortcutClick: 'Click',
        shortcutCtrl: 'Ctrl',
      };
      return messages[key] || '';
    }),
  },
});

describe('title-renderer', () => {
  let container: HTMLElement;
  const disclaimerText = 'ChatGPT can make mistakes. Check important info.';

  const mockContext: ConversationContext = {
    title: 'Test Conversation',
    projectName: null,
    url: 'https://chatgpt.com/c/test-123',
  };

  const mockContextWithProject: ConversationContext = {
    title: 'Project Discussion',
    projectName: 'Business Ideas',
    url: 'https://chatgpt.com/g/g-p-abc/c/456',
  };

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

    // Create test container with disclaimer
    container = document.createElement('div');
    container.className = 'pointer-events-auto';

    const disclaimerElement = document.createElement('span');
    disclaimerElement.textContent = disclaimerText;
    container.appendChild(disclaimerElement);

    document.body.appendChild(container);

    // Reset preferences
    setTooltipPreferences(DEFAULT_PREFERENCES);

    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('render', () => {
    it('returns false when targetElement is null', () => {
      const result = render(mockContext, null);
      expect(result).toBe(false);
    });

    it('returns false when element is not an HTMLElement', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgElement.textContent = disclaimerText;
      const result = render(mockContext, svgElement);
      expect(result).toBe(false);
    });

    it('returns false when element does not contain disclaimer text', () => {
      const nonDisclaimer = document.createElement('div');
      nonDisclaimer.textContent = 'Some other text';
      const result = render(mockContext, nonDisclaimer);
      expect(result).toBe(false);
    });

    it('renders conversation title into disclaimer element', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      const result = render(mockContext, container);

      expect(result).toBe(true);
      expect(disclaimerSpan.textContent).toBe('Test Conversation');
      expect(disclaimerSpan.id).toBe(EXTENSION_ELEMENT_ID);
    });

    it('renders project name with title when present', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContextWithProject, container);

      expect(disclaimerSpan.textContent).toBe('Business Ideas – Project Discussion');
    });

    it('sets cursor to pointer on rendered element', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      expect(disclaimerSpan.style.cursor).toBe('pointer');
    });

    it('stores context data in data attributes', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContextWithProject, container);

      expect(disclaimerSpan.dataset.title).toBe('Project Discussion');
      expect(disclaimerSpan.dataset.url).toBe('https://chatgpt.com/g/g-p-abc/c/456');
      expect(disclaimerSpan.dataset.project).toBe('Business Ideas');
    });

    it('does not set project data attribute when projectName is null', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      expect(disclaimerSpan.dataset.title).toBe('Test Conversation');
      expect(disclaimerSpan.dataset.url).toBe('https://chatgpt.com/c/test-123');
      expect(disclaimerSpan.dataset.project).toBeUndefined();
    });

    it('removes existing element before rendering new one', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;

      // First render
      render(mockContext, container);
      expect(disclaimerSpan.textContent).toBe('Test Conversation');

      // Second render with different context
      render(mockContextWithProject, container);
      expect(disclaimerSpan.textContent).toBe('Business Ideas – Project Discussion');

      // Should only have one element with the ID
      const elements = document.querySelectorAll(`#${EXTENSION_ELEMENT_ID}`);
      expect(elements.length).toBe(1);
    });
  });

  describe('removeElement', () => {
    it('restores original disclaimer text', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;

      render(mockContext, container);
      expect(disclaimerSpan.textContent).toBe('Test Conversation');

      removeElement();
      expect(disclaimerSpan.textContent).toBe(disclaimerText);
    });

    it('removes ID from restored element', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;

      render(mockContext, container);
      expect(disclaimerSpan.id).toBe(EXTENSION_ELEMENT_ID);

      removeElement();
      expect(disclaimerSpan.id).toBe('');
    });

    it('resets cursor style', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;

      render(mockContext, container);
      expect(disclaimerSpan.style.cursor).toBe('pointer');

      removeElement();
      expect(disclaimerSpan.style.cursor).toBe('');
    });

    it('removes data attributes', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;

      render(mockContextWithProject, container);
      expect(disclaimerSpan.dataset.title).toBe('Project Discussion');
      expect(disclaimerSpan.dataset.project).toBe('Business Ideas');

      removeElement();
      expect(disclaimerSpan.dataset.title).toBeUndefined();
      expect(disclaimerSpan.dataset.project).toBeUndefined();
      expect(disclaimerSpan.dataset.url).toBeUndefined();
    });

    it('removes tooltip if present', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      // Simulate hover to create tooltip
      disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200); // Past the 150ms delay

      expect(document.getElementById(TOOLTIP_ID)).not.toBeNull();

      removeElement();
      expect(document.getElementById(TOOLTIP_ID)).toBeNull();
    });

    it('handles case when no element exists', () => {
      // Should not throw
      expect(() => removeElement()).not.toThrow();
    });
  });

  describe('getDisplayElement', () => {
    it('returns null when no element is rendered', () => {
      expect(getDisplayElement()).toBeNull();
    });

    it('returns the rendered element', () => {
      render(mockContext, container);
      const element = getDisplayElement();

      expect(element).not.toBeNull();
      expect(element?.id).toBe(EXTENSION_ELEMENT_ID);
    });
  });

  describe('tooltip', () => {
    describe('hover behavior', () => {
      it('shows tooltip after 150ms delay on mouseenter', () => {
        const disclaimerSpan = container.querySelector('span') as HTMLElement;
        render(mockContext, container);

        disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));

        // Tooltip should not be visible immediately
        expect(document.getElementById(TOOLTIP_ID)).toBeNull();

        // Advance timers past delay
        vi.advanceTimersByTime(150);

        // Tooltip should be visible now
        const tooltip = document.getElementById(TOOLTIP_ID);
        expect(tooltip).not.toBeNull();
        expect(tooltip?.style.opacity).toBe('1');
      });

      it('hides tooltip on mouseleave', () => {
        const disclaimerSpan = container.querySelector('span') as HTMLElement;
        render(mockContext, container);

        // Show tooltip
        disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
        vi.advanceTimersByTime(200);

        const tooltip = document.getElementById(TOOLTIP_ID);
        expect(tooltip).not.toBeNull();

        // Leave
        disclaimerSpan.dispatchEvent(new MouseEvent('mouseleave'));

        // Opacity should be 0 (fading)
        expect(tooltip?.style.opacity).toBe('0');

        // After fade animation, tooltip should be removed
        vi.advanceTimersByTime(200);
        expect(document.getElementById(TOOLTIP_ID)).toBeNull();
      });

      it('cancels show timer on quick mouseleave', () => {
        const disclaimerSpan = container.querySelector('span') as HTMLElement;
        render(mockContext, container);

        disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));

        // Leave before 150ms delay
        vi.advanceTimersByTime(100);
        disclaimerSpan.dispatchEvent(new MouseEvent('mouseleave'));

        // Advance past the original delay
        vi.advanceTimersByTime(100);

        // Tooltip should never have been created
        expect(document.getElementById(TOOLTIP_ID)).toBeNull();
      });
    });

    describe('content', () => {
      it('contains all shortcut configurations', () => {
        const disclaimerSpan = container.querySelector('span') as HTMLElement;
        render(mockContext, container);

        disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
        vi.advanceTimersByTime(200);

        const tooltip = document.getElementById(TOOLTIP_ID);
        expect(tooltip).not.toBeNull();

        const shortcuts = tooltip?.querySelectorAll('[data-shortcut]');
        expect(shortcuts?.length).toBe(4);

        const shortcutKeys = Array.from(shortcuts || []).map(
          (el) => (el as HTMLElement).dataset.shortcut
        );
        expect(shortcutKeys).toContain('click');
        expect(shortcutKeys).toContain('shift');
        expect(shortcutKeys).toContain('mod');
        expect(shortcutKeys).toContain('mod-shift');
      });

      it('uses correct format labels from preferences', () => {
        const customPrefs: CopyPreferences = {
          click: CopyFormat.URL,
          shiftClick: CopyFormat.TITLE,
          modClick: CopyFormat.FULL_CONTEXT,
          modShiftClick: CopyFormat.MARKDOWN,
          audioFeedback: false,
        };
        setTooltipPreferences(customPrefs);

        const disclaimerSpan = container.querySelector('span') as HTMLElement;
        render(mockContext, container);

        disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
        vi.advanceTimersByTime(200);

        const tooltip = document.getElementById(TOOLTIP_ID);
        expect(tooltip?.textContent).toContain('url');
        expect(tooltip?.textContent).toContain('title');
        expect(tooltip?.textContent).toContain('full');
        expect(tooltip?.textContent).toContain('md');
      });
    });
  });

  describe('showTooltipFeedback', () => {
    it('shows tooltip with highlighted shortcut', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      showTooltipFeedback(disclaimerSpan, 'click');

      const tooltip = document.getElementById(TOOLTIP_ID);
      expect(tooltip).not.toBeNull();
      expect(tooltip?.style.opacity).toBe('1');

      const clickSpan = tooltip?.querySelector('[data-shortcut="click"]') as HTMLElement;
      expect(clickSpan.style.backgroundColor).toBe('rgb(16, 163, 127)'); // #10a37f
      expect(clickSpan.style.color).toBe('white');
    });

    it('prepends checkmark to highlighted shortcut', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      showTooltipFeedback(disclaimerSpan, 'shift');

      const tooltip = document.getElementById(TOOLTIP_ID);
      const shiftSpan = tooltip?.querySelector('[data-shortcut="shift"]') as HTMLElement;
      expect(shiftSpan.textContent?.startsWith('\u2713 ')).toBe(true);
    });

    it('resets highlight after TOOLTIP_FEEDBACK_DURATION', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      showTooltipFeedback(disclaimerSpan, 'mod');

      vi.advanceTimersByTime(TIMING.TOOLTIP_FEEDBACK_DURATION);

      const tooltip = document.getElementById(TOOLTIP_ID);
      const modSpan = tooltip?.querySelector('[data-shortcut="mod"]') as HTMLElement;

      // Highlight should be removed
      expect(modSpan?.style.backgroundColor).toBe('');
      expect(modSpan?.style.color).toBe('');
      // Checkmark should be removed (original text restored)
      expect(modSpan?.textContent?.startsWith('\u2713 ')).toBe(false);
    });

    it('clears previous highlights before showing new', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      // Show first feedback
      showTooltipFeedback(disclaimerSpan, 'click');

      // Immediately show another feedback
      showTooltipFeedback(disclaimerSpan, 'shift');

      const tooltip = document.getElementById(TOOLTIP_ID);
      const clickSpan = tooltip?.querySelector('[data-shortcut="click"]') as HTMLElement;
      const shiftSpan = tooltip?.querySelector('[data-shortcut="shift"]') as HTMLElement;

      // Click should not be highlighted
      expect(clickSpan.style.backgroundColor).toBe('');

      // Shift should be highlighted
      expect(shiftSpan.style.backgroundColor).toBe('rgb(16, 163, 127)');
    });

    it('hides tooltip after feedback duration when not hovering', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      showTooltipFeedback(disclaimerSpan, 'click');

      // Wait for feedback duration
      vi.advanceTimersByTime(TIMING.TOOLTIP_FEEDBACK_DURATION);

      // Tooltip should start fading
      const tooltip = document.getElementById(TOOLTIP_ID);
      expect(tooltip?.style.opacity).toBe('0');

      // After fade duration, tooltip removed
      vi.advanceTimersByTime(200);
      expect(document.getElementById(TOOLTIP_ID)).toBeNull();
    });

    it('keeps tooltip visible if user is hovering after feedback', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      // Start hovering
      disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200);

      // Trigger feedback
      showTooltipFeedback(disclaimerSpan, 'click');

      // Wait for feedback duration
      vi.advanceTimersByTime(TIMING.TOOLTIP_FEEDBACK_DURATION);

      // Tooltip should still be visible (user is hovering)
      const tooltip = document.getElementById(TOOLTIP_ID);
      expect(tooltip?.style.opacity).not.toBe('0');
    });
  });

  describe('isDisclaimerElement (via render)', () => {
    it('detects disclaimer with "ChatGPT can make mistakes" pattern', () => {
      const element = document.createElement('span');
      element.textContent = 'ChatGPT can make mistakes. Check important info.';
      container.innerHTML = '';
      container.appendChild(element);

      const result = render(mockContext, container);
      expect(result).toBe(true);
    });

    it('rejects element without disclaimer pattern', () => {
      container.innerHTML = '<span>Random text here</span>';
      const result = render(mockContext, container);
      expect(result).toBe(false);
    });
  });

  describe('findDisclaimerTextElement (via render)', () => {
    it('finds direct text node child', () => {
      const wrapper = document.createElement('div');
      const textSpan = document.createElement('span');
      textSpan.textContent = disclaimerText;
      wrapper.appendChild(textSpan);
      document.body.appendChild(wrapper);

      render(mockContext, wrapper);
      expect(textSpan.id).toBe(EXTENSION_ELEMENT_ID);
    });

    it('finds nested text element', () => {
      const wrapper = document.createElement('div');
      const inner = document.createElement('div');
      const textSpan = document.createElement('span');
      textSpan.textContent = disclaimerText;
      inner.appendChild(textSpan);
      wrapper.appendChild(inner);
      document.body.appendChild(wrapper);

      render(mockContext, wrapper);
      expect(textSpan.id).toBe(EXTENSION_ELEMENT_ID);
    });

    it('returns false when disclaimer text is in non-leaf element', () => {
      // Create element with disclaimer but with child elements
      const wrapper = document.createElement('div');
      wrapper.textContent = disclaimerText;
      const child = document.createElement('span');
      wrapper.appendChild(child);
      document.body.appendChild(wrapper);

      // The disclaimer text is split across text nodes now, not in a single leaf
      // This scenario tests that we don't modify parent elements incorrectly
      const result = render(mockContext, wrapper);
      // This depends on implementation - may return false if no suitable leaf found
      // In this case, the wrapper itself has children so it won't be selected
      // and the child span doesn't contain the disclaimer
      expect(result).toBe(false);
    });
  });

  describe('platform detection', () => {
    const originalPlatform = navigator.platform;

    afterEach(() => {
      // Restore original platform after each test
      Object.defineProperty(navigator, 'platform', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
    });

    it('uses Command symbol on macOS', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
        configurable: true,
      });

      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200);

      const tooltip = document.getElementById(TOOLTIP_ID);
      expect(tooltip?.textContent).toContain('\u2318'); // Command symbol
    });

    it('uses Ctrl label on Windows/Linux', () => {
      Object.defineProperty(navigator, 'platform', {
        value: 'Win32',
        writable: true,
        configurable: true,
      });

      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200);

      const tooltip = document.getElementById(TOOLTIP_ID);
      expect(tooltip?.textContent).toContain('Ctrl');
    });
  });

  describe('setTooltipPreferences', () => {
    it('updates tooltip content when preferences change', () => {
      const disclaimerSpan = container.querySelector('span') as HTMLElement;
      render(mockContext, container);

      // Show tooltip with default preferences
      disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200);

      // Change preferences
      setTooltipPreferences({
        click: CopyFormat.URL,
        shiftClick: CopyFormat.URL,
        modClick: CopyFormat.URL,
        modShiftClick: CopyFormat.URL,
        audioFeedback: false,
      });

      // Remove and re-render to get new tooltip
      removeElement();
      render(mockContext, container);

      disclaimerSpan.dispatchEvent(new MouseEvent('mouseenter'));
      vi.advanceTimersByTime(200);

      const tooltip = document.getElementById(TOOLTIP_ID);
      // All shortcuts should show 'url' format
      const content = tooltip?.textContent || '';
      const urlCount = (content.match(/url/g) || []).length;
      expect(urlCount).toBe(4);
    });
  });
});
