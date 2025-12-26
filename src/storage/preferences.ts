import type { CopyPreferences } from '../types/index.js';
import { DEFAULT_PREFERENCES } from '../types/index.js';

const STORAGE_KEY = 'copyPreferences';

/**
 * Load preferences from Chrome storage
 */
export async function loadPreferences(): Promise<CopyPreferences> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
      return { ...DEFAULT_PREFERENCES, ...result[STORAGE_KEY] };
    }
  } catch {
    // Storage not available (e.g., in content script without permission)
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Save preferences to Chrome storage
 */
export async function savePreferences(prefs: CopyPreferences): Promise<boolean> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
    return true;
  } catch {
    return false;
  }
}

/**
 * Listen for preference changes
 * Returns a cleanup function to remove the listener (prevents memory leaks)
 */
export function onPreferencesChange(
  callback: (prefs: CopyPreferences) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ): void => {
    if (area === 'sync' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue as CopyPreferences);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}
