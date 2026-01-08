import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CopyPreferences } from '../types/index.js';
import { CopyFormat, DEFAULT_PREFERENCES } from '../types/index.js';
import { loadPreferences, savePreferences, onPreferencesChange } from './preferences.js';

const STORAGE_KEY = 'copyPreferences';

// Mock storage data
let mockStorage: { [key: string]: CopyPreferences } = {};
const mockListeners: Array<(
  changes: { [key: string]: chrome.storage.StorageChange },
  area: string
) => void> = [];

// Mock chrome.storage.sync
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
      addListener: vi.fn((listener) => {
        mockListeners.push(listener);
      }),
      removeListener: vi.fn((listener) => {
        const index = mockListeners.indexOf(listener);
        if (index > -1) {
          mockListeners.splice(index, 1);
        }
      }),
    },
  },
};

// Assign mock to global
Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
  configurable: true,
});

describe('preferences storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage
    mockStorage = {};
    // Clear listeners
    mockListeners.length = 0;
  });

  describe('loadPreferences', () => {
    it('returns default preferences when storage is empty', async () => {
      const prefs = await loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });

    it('returns stored preferences when available', async () => {
      const storedPrefs: CopyPreferences = {
        click: CopyFormat.URL,
        shiftClick: CopyFormat.TITLE,
        modClick: CopyFormat.MARKDOWN,
        modShiftClick: CopyFormat.FULL_CONTEXT,
        audioFeedback: true,
      };
      mockStorage[STORAGE_KEY] = storedPrefs;

      const prefs = await loadPreferences();
      expect(prefs).toEqual(storedPrefs);
    });

    it('merges partial stored preferences with defaults', async () => {
      mockStorage[STORAGE_KEY] = { audioFeedback: true } as CopyPreferences;

      const prefs = await loadPreferences();
      expect(prefs.audioFeedback).toBe(true);
      expect(prefs.click).toBe(DEFAULT_PREFERENCES.click);
      expect(prefs.shiftClick).toBe(DEFAULT_PREFERENCES.shiftClick);
    });

    it('returns defaults when storage throws an error', async () => {
      mockChrome.storage.sync.get.mockRejectedValueOnce(new Error('Storage unavailable'));

      const prefs = await loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });

    it('returns defaults when storage result is undefined', async () => {
      mockChrome.storage.sync.get.mockResolvedValueOnce({});

      const prefs = await loadPreferences();
      expect(prefs).toEqual(DEFAULT_PREFERENCES);
    });
  });

  describe('savePreferences', () => {
    it('saves preferences to chrome storage and returns true', async () => {
      const prefs: CopyPreferences = {
        click: CopyFormat.TITLE,
        shiftClick: CopyFormat.FULL_CONTEXT,
        modClick: CopyFormat.MARKDOWN,
        modShiftClick: CopyFormat.URL,
        audioFeedback: false,
      };

      const result = await savePreferences(prefs);

      expect(result).toBe(true);
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({
        [STORAGE_KEY]: prefs,
      });
    });

    it('returns false when storage fails', async () => {
      mockChrome.storage.sync.set.mockRejectedValueOnce(new Error('Quota exceeded'));

      const result = await savePreferences(DEFAULT_PREFERENCES);

      expect(result).toBe(false);
    });

    it('stores the correct storage key', async () => {
      await savePreferences(DEFAULT_PREFERENCES);

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({
        copyPreferences: DEFAULT_PREFERENCES,
      });
    });
  });

  describe('onPreferencesChange', () => {
    it('registers a listener with chrome.storage.onChanged', () => {
      const callback = vi.fn();
      onPreferencesChange(callback);

      expect(mockChrome.storage.onChanged.addListener).toHaveBeenCalled();
      expect(mockListeners.length).toBe(1);
    });

    it('calls callback when preferences change', () => {
      const callback = vi.fn();
      onPreferencesChange(callback);

      const newPrefs: CopyPreferences = {
        ...DEFAULT_PREFERENCES,
        audioFeedback: true,
      };

      // Simulate storage change
      const listener = mockListeners[0];
      listener(
        {
          [STORAGE_KEY]: {
            oldValue: DEFAULT_PREFERENCES,
            newValue: newPrefs,
          },
        },
        'sync'
      );

      expect(callback).toHaveBeenCalledWith(newPrefs);
    });

    it('does not call callback for changes in other storage areas', () => {
      const callback = vi.fn();
      onPreferencesChange(callback);

      const listener = mockListeners[0];
      listener(
        {
          [STORAGE_KEY]: {
            oldValue: DEFAULT_PREFERENCES,
            newValue: { ...DEFAULT_PREFERENCES, audioFeedback: true },
          },
        },
        'local' // Different storage area
      );

      expect(callback).not.toHaveBeenCalled();
    });

    it('does not call callback for changes to other keys', () => {
      const callback = vi.fn();
      onPreferencesChange(callback);

      const listener = mockListeners[0];
      listener(
        {
          someOtherKey: {
            oldValue: 'old',
            newValue: 'new',
          },
        },
        'sync'
      );

      expect(callback).not.toHaveBeenCalled();
    });

    it('returns a cleanup function that removes the listener', () => {
      const callback = vi.fn();
      const cleanup = onPreferencesChange(callback);

      expect(mockListeners.length).toBe(1);

      cleanup();

      expect(mockChrome.storage.onChanged.removeListener).toHaveBeenCalled();
      expect(mockListeners.length).toBe(0);
    });

    it('multiple listeners can be registered and cleaned up independently', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const cleanup1 = onPreferencesChange(callback1);
      const cleanup2 = onPreferencesChange(callback2);

      expect(mockListeners.length).toBe(2);

      // Trigger change
      const newPrefs = { ...DEFAULT_PREFERENCES, audioFeedback: true };
      mockListeners.forEach(listener =>
        listener(
          { [STORAGE_KEY]: { oldValue: DEFAULT_PREFERENCES, newValue: newPrefs } },
          'sync'
        )
      );

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Clean up first listener
      cleanup1();
      expect(mockListeners.length).toBe(1);

      // Reset mocks and trigger again
      callback1.mockClear();
      callback2.mockClear();

      mockListeners.forEach(listener =>
        listener(
          { [STORAGE_KEY]: { oldValue: newPrefs, newValue: DEFAULT_PREFERENCES } },
          'sync'
        )
      );

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Clean up second listener
      cleanup2();
      expect(mockListeners.length).toBe(0);
    });
  });
});
