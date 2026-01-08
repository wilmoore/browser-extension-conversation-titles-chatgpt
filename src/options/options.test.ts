import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import type { CopyPreferences } from '../types/index.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';

// Set up a minimal DOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head></head>
<body>
  <span id="mod-label"></span>
  <span id="mod-shift-label"></span>
  <span id="shift-label"></span>
  <span data-i18n="optionsTitle">Options</span>
  <select id="click">
    <option value="TITLE">Title</option>
    <option value="FULL_CONTEXT">Full Context</option>
    <option value="MARKDOWN">Markdown</option>
    <option value="URL">URL</option>
  </select>
  <select id="shiftClick">
    <option value="TITLE">Title</option>
    <option value="FULL_CONTEXT">Full Context</option>
    <option value="MARKDOWN">Markdown</option>
    <option value="URL">URL</option>
  </select>
  <select id="modClick">
    <option value="TITLE">Title</option>
    <option value="FULL_CONTEXT">Full Context</option>
    <option value="MARKDOWN">Markdown</option>
    <option value="URL">URL</option>
  </select>
  <select id="modShiftClick">
    <option value="TITLE">Title</option>
    <option value="FULL_CONTEXT">Full Context</option>
    <option value="MARKDOWN">Markdown</option>
    <option value="URL">URL</option>
  </select>
  <input type="checkbox" id="audioFeedback" />
  <div id="status"></div>
</body>
</html>
`);

// Set up global DOM environment
const { window } = dom;
global.document = window.document;
global.HTMLSelectElement = window.HTMLSelectElement;
global.HTMLInputElement = window.HTMLInputElement;

// Mock navigator for platform detection
const navigatorMock = {
  platform: 'MacIntel',
};
Object.defineProperty(global, 'navigator', {
  value: navigatorMock,
  writable: true,
  configurable: true,
});

// Mock chrome.storage.sync
const mockStorage: { [key: string]: CopyPreferences } = {};

const mockChrome = {
  storage: {
    sync: {
      get: vi.fn((key: string) =>
        Promise.resolve({ [key]: mockStorage[key] })
      ),
      set: vi.fn((data: { [key: string]: CopyPreferences }) => {
        Object.assign(mockStorage, data);
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  i18n: {
    getMessage: vi.fn((key: string) => {
      const messages: { [key: string]: string } = {
        optionsTitle: 'Options',
        shortcutCtrl: 'Ctrl',
        shortcutCtrlShift: 'Ctrl+Shift',
        shortcutShift: 'Shift',
      };
      return messages[key] || '';
    }),
  },
};

// Assign mock to global
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
  configurable: true,
});

// Re-usable test functions that mirror the options.ts implementation
// (testing the logic, not importing the module directly due to side effects)

const STORAGE_KEY = 'copyPreferences';

function detectIsMac(platform: string): boolean {
  return platform.toUpperCase().indexOf('MAC') >= 0;
}

function applyI18n(): void {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      const message = chrome.i18n.getMessage(key);
      if (message) {
        element.textContent = message;
      }
    }
  });
}

function updateModifierLabels(isMac: boolean): void {
  const modLabel = document.getElementById('mod-label');
  const modShiftLabel = document.getElementById('mod-shift-label');
  const shiftLabel = document.getElementById('shift-label');

  if (isMac) {
    if (modLabel) modLabel.textContent = '\u2318';
    if (modShiftLabel) modShiftLabel.textContent = '\u2318+\u21E7';
    if (shiftLabel) shiftLabel.textContent = '\u21E7';
  } else {
    const ctrlText = chrome.i18n.getMessage('shortcutCtrl') || 'Ctrl';
    const ctrlShiftText = chrome.i18n.getMessage('shortcutCtrlShift') || 'Ctrl+Shift';
    const shiftText = chrome.i18n.getMessage('shortcutShift') || 'Shift';

    if (modLabel) modLabel.textContent = ctrlText;
    if (modShiftLabel) modShiftLabel.textContent = ctrlShiftText;
    if (shiftLabel) shiftLabel.textContent = shiftText;
  }
}

async function loadPreferences(): Promise<CopyPreferences> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return { ...DEFAULT_PREFERENCES, ...result[STORAGE_KEY] };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

async function savePreferences(prefs: CopyPreferences): Promise<void> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

function getFormValues(): CopyPreferences {
  const click = document.getElementById('click') as HTMLSelectElement;
  const shiftClick = document.getElementById('shiftClick') as HTMLSelectElement;
  const modClick = document.getElementById('modClick') as HTMLSelectElement;
  const modShiftClick = document.getElementById('modShiftClick') as HTMLSelectElement;
  const audioFeedback = document.getElementById('audioFeedback') as HTMLInputElement;

  return {
    click: click.value as CopyPreferences['click'],
    shiftClick: shiftClick.value as CopyPreferences['shiftClick'],
    modClick: modClick.value as CopyPreferences['modClick'],
    modShiftClick: modShiftClick.value as CopyPreferences['modShiftClick'],
    audioFeedback: audioFeedback.checked,
  };
}

function setFormValues(prefs: CopyPreferences): void {
  const click = document.getElementById('click') as HTMLSelectElement;
  const shiftClick = document.getElementById('shiftClick') as HTMLSelectElement;
  const modClick = document.getElementById('modClick') as HTMLSelectElement;
  const modShiftClick = document.getElementById('modShiftClick') as HTMLSelectElement;
  const audioFeedback = document.getElementById('audioFeedback') as HTMLInputElement;

  if (click) click.value = prefs.click;
  if (shiftClick) shiftClick.value = prefs.shiftClick;
  if (modClick) modClick.value = prefs.modClick;
  if (modShiftClick) modShiftClick.value = prefs.modShiftClick;
  if (audioFeedback) audioFeedback.checked = prefs.audioFeedback;
}

describe('options page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

    // Reset form values to defaults
    setFormValues(DEFAULT_PREFERENCES);
  });

  describe('detectIsMac', () => {
    it('returns true for MacIntel platform', () => {
      expect(detectIsMac('MacIntel')).toBe(true);
    });

    it('returns true for MacPPC platform', () => {
      expect(detectIsMac('MacPPC')).toBe(true);
    });

    it('returns false for Windows platform', () => {
      expect(detectIsMac('Win32')).toBe(false);
    });

    it('returns false for Linux platform', () => {
      expect(detectIsMac('Linux x86_64')).toBe(false);
    });

    it('is case insensitive', () => {
      expect(detectIsMac('macintel')).toBe(true);
      expect(detectIsMac('MACINTEL')).toBe(true);
    });
  });

  describe('applyI18n', () => {
    it('applies i18n messages to elements with data-i18n attribute', () => {
      applyI18n();
      const element = document.querySelector('[data-i18n="optionsTitle"]');
      expect(element?.textContent).toBe('Options');
    });

    it('calls chrome.i18n.getMessage for each element', () => {
      applyI18n();
      expect(mockChrome.i18n.getMessage).toHaveBeenCalledWith('optionsTitle');
    });
  });

  describe('updateModifierLabels', () => {
    it('shows Mac symbols on macOS', () => {
      updateModifierLabels(true);
      expect(document.getElementById('mod-label')?.textContent).toBe('\u2318');
      expect(document.getElementById('mod-shift-label')?.textContent).toBe('\u2318+\u21E7');
      expect(document.getElementById('shift-label')?.textContent).toBe('\u21E7');
    });

    it('shows Ctrl text on Windows/Linux', () => {
      updateModifierLabels(false);
      expect(document.getElementById('mod-label')?.textContent).toBe('Ctrl');
      expect(document.getElementById('mod-shift-label')?.textContent).toBe('Ctrl+Shift');
      expect(document.getElementById('shift-label')?.textContent).toBe('Shift');
    });
  });

  describe('loadPreferences', () => {
    it('returns default preferences when storage is empty', async () => {
      const prefs = await loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });

    it('merges stored preferences with defaults', async () => {
      mockStorage[STORAGE_KEY] = { ...DEFAULT_PREFERENCES, audioFeedback: true };

      const prefs = await loadPreferences();
      expect(prefs.audioFeedback).toBe(true);
      expect(prefs.click).toBe(DEFAULT_PREFERENCES.click);
    });

    it('returns defaults when storage fails', async () => {
      mockChrome.storage.sync.get.mockRejectedValueOnce(new Error('Storage error'));

      const prefs = await loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('savePreferences', () => {
    it('saves preferences to chrome storage', async () => {
      const prefs: CopyPreferences = {
        ...DEFAULT_PREFERENCES,
        click: CopyFormat.TITLE,
      };

      await savePreferences(prefs);

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({
        [STORAGE_KEY]: prefs,
      });
    });

    it('handles storage errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockChrome.storage.sync.set.mockRejectedValueOnce(new Error('Storage full'));

      await savePreferences(DEFAULT_PREFERENCES);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getFormValues', () => {
    it('reads all form values correctly', () => {
      const click = document.getElementById('click') as HTMLSelectElement;
      const shiftClick = document.getElementById('shiftClick') as HTMLSelectElement;
      const modClick = document.getElementById('modClick') as HTMLSelectElement;
      const modShiftClick = document.getElementById('modShiftClick') as HTMLSelectElement;
      const audioFeedback = document.getElementById('audioFeedback') as HTMLInputElement;

      click.value = CopyFormat.TITLE;
      shiftClick.value = CopyFormat.FULL_CONTEXT;
      modClick.value = CopyFormat.MARKDOWN;
      modShiftClick.value = CopyFormat.URL;
      audioFeedback.checked = true;

      const values = getFormValues();

      expect(values).toEqual({
        click: CopyFormat.TITLE,
        shiftClick: CopyFormat.FULL_CONTEXT,
        modClick: CopyFormat.MARKDOWN,
        modShiftClick: CopyFormat.URL,
        audioFeedback: true,
      });
    });
  });

  describe('setFormValues', () => {
    it('sets all form values correctly', () => {
      const prefs: CopyPreferences = {
        click: CopyFormat.URL,
        shiftClick: CopyFormat.TITLE,
        modClick: CopyFormat.FULL_CONTEXT,
        modShiftClick: CopyFormat.MARKDOWN,
        audioFeedback: true,
      };

      setFormValues(prefs);

      const click = document.getElementById('click') as HTMLSelectElement;
      const shiftClick = document.getElementById('shiftClick') as HTMLSelectElement;
      const modClick = document.getElementById('modClick') as HTMLSelectElement;
      const modShiftClick = document.getElementById('modShiftClick') as HTMLSelectElement;
      const audioFeedback = document.getElementById('audioFeedback') as HTMLInputElement;

      expect(click.value).toBe(CopyFormat.URL);
      expect(shiftClick.value).toBe(CopyFormat.TITLE);
      expect(modClick.value).toBe(CopyFormat.FULL_CONTEXT);
      expect(modShiftClick.value).toBe(CopyFormat.MARKDOWN);
      expect(audioFeedback.checked).toBe(true);
    });
  });
});
