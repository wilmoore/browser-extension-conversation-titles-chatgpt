/**
 * Options page script
 */

import type { CopyPreferences } from '../types/index.js';
import { DEFAULT_PREFERENCES } from '../types/index.js';

const STORAGE_KEY = 'copyPreferences';

// Detect macOS for modifier key labels
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// Apply i18n to elements with data-i18n attribute
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

// Update modifier key labels based on platform
function updateModifierLabels(): void {
  const modLabel = document.getElementById('mod-label');
  const modShiftLabel = document.getElementById('mod-shift-label');
  const shiftLabel = document.getElementById('shift-label');

  if (isMac) {
    // Mac uses symbols
    if (modLabel) modLabel.textContent = '\u2318';
    if (modShiftLabel) modShiftLabel.textContent = '\u2318+\u21E7';
    if (shiftLabel) shiftLabel.textContent = '\u21E7';
  } else {
    // Windows/Linux uses localized text
    const ctrlText = chrome.i18n.getMessage('shortcutCtrl') || 'Ctrl';
    const ctrlShiftText = chrome.i18n.getMessage('shortcutCtrlShift') || 'Ctrl+Shift';
    const shiftText = chrome.i18n.getMessage('shortcutShift') || 'Shift';

    if (modLabel) modLabel.textContent = ctrlText;
    if (modShiftLabel) modShiftLabel.textContent = ctrlShiftText;
    if (shiftLabel) shiftLabel.textContent = shiftText;
  }
}

// Load preferences from storage
async function loadPreferences(): Promise<CopyPreferences> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return { ...DEFAULT_PREFERENCES, ...result[STORAGE_KEY] };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

// Save preferences to storage
async function savePreferences(prefs: CopyPreferences): Promise<void> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: prefs });
    showStatus();
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

// Show saved status
function showStatus(): void {
  const status = document.getElementById('status');
  if (status) {
    status.classList.add('visible');
    setTimeout(() => {
      status.classList.remove('visible');
    }, 1500);
  }
}

// Get current form values
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

// Set form values
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

// Handle form change
function handleChange(): void {
  const prefs = getFormValues();
  savePreferences(prefs);
}

// Initialize
async function init(): Promise<void> {
  applyI18n();
  updateModifierLabels();

  const prefs = await loadPreferences();
  setFormValues(prefs);

  // Add change listeners to selects
  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', handleChange);
  });

  // Add change listener to checkbox
  const audioCheckbox = document.getElementById('audioFeedback');
  if (audioCheckbox) {
    audioCheckbox.addEventListener('change', handleChange);
  }
}

init();
