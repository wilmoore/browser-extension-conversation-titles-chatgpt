/**
 * Visual and audio feedback for copy actions
 */

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
 * Show a brief "Copied!" indicator near the element
 */
export function showCopiedIndicator(element: HTMLElement): void {
  const indicator = document.createElement('div');
  indicator.textContent = 'Copied!';
  indicator.style.cssText = `
    position: fixed;
    background: #10a37f;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease, transform 0.15s ease;
    z-index: 10001;
  `;

  // Position above the element
  const rect = element.getBoundingClientRect();
  indicator.style.left = `${rect.left + rect.width / 2}px`;
  indicator.style.top = `${rect.top - 8}px`;
  indicator.style.transform = 'translateX(-50%) translateY(-100%)';

  document.body.appendChild(indicator);

  // Animate in
  requestAnimationFrame(() => {
    indicator.style.opacity = '1';
  });

  // Animate out and remove
  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.style.transform = 'translateX(-50%) translateY(-100%) translateY(-4px)';
    setTimeout(() => {
      indicator.remove();
    }, 150);
  }, 800);
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
export function showCopyFeedback(element: HTMLElement): void {
  showVisualFeedback(element);
  showCopiedIndicator(element);
  playAudioFeedback();
}
