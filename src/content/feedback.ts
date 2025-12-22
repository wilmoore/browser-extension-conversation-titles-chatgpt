/**
 * Visual and audio feedback for copy actions
 */

import type { ShortcutKey } from './selectors.js';
import { showTooltipFeedback } from './title-renderer.js';

/**
 * Audio feedback enabled state
 */
let audioEnabled = false;

/**
 * Set audio feedback preference
 */
export function setAudioEnabled(enabled: boolean): void {
  audioEnabled = enabled;
}

/**
 * Show visual feedback on the element (brief flash)
 */
export function showVisualFeedback(element: HTMLElement): void {
  // Store original styles
  const originalColor = element.style.color;
  const originalTransition = element.style.transition;

  // Apply flash effect
  element.style.transition = 'color 0.1s ease';
  element.style.color = '#10a37f'; // ChatGPT green

  // Reset after animation
  setTimeout(() => {
    element.style.color = originalColor || '';
    setTimeout(() => {
      element.style.transition = originalTransition || '';
    }, 100);
  }, 200);
}

/**
 * Play a subtle copy sound
 */
export function playAudioFeedback(): void {
  if (!audioEnabled) return;

  try {
    // Create a subtle "pop" sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Short, subtle pop sound
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch {
    // Silent failure - audio not supported or blocked
  }
}

/**
 * Show all feedback for a successful copy
 */
export function showCopyFeedback(element: HTMLElement, shortcutKey: ShortcutKey): void {
  showVisualFeedback(element);
  showTooltipFeedback(element, shortcutKey);
  playAudioFeedback();
}
