# Known Issues & Future Improvements

These items were identified during code review but are out of scope for this PR.

## Deferred Improvements

### 1. Accessibility (ARIA attributes)
**Issue:** Tooltip lacks ARIA attributes for screen reader support.
**Recommendation:** Add `role="status"`, `aria-live="polite"`, and `aria-atomic="true"` to the tooltip for better accessibility.
**Priority:** Medium
**Tracking:** Future PR

### 2. Tooltip Positioning Fallbacks
**Issue:** Tooltip always positions above the element; no collision detection for viewport edges.
**Recommendation:** Implement positioning algorithm that falls back to below/inline when near viewport top.
**Priority:** Low (edge case - footer element is typically at bottom of viewport)
**Tracking:** Future PR if user reports issues

### 3. Z-index Strategy for Modals
**Issue:** Current z-index (10000) may not be sufficient if ChatGPT adds modals.
**Recommendation:** Consider dynamic z-index or portal attachment strategy.
**Priority:** Low (current value works with existing ChatGPT UI)
**Tracking:** Monitor for issues

### 4. Minimum Gap for Rapid Clicks
**Issue:** No enforced minimum gap between successive tooltip highlights to prevent visual flicker.
**Current behavior:** Each click resets the 800ms timer and updates highlight immediately.
**Recommendation:** Add 200ms minimum gap between highlight starts.
**Priority:** Low (current behavior is acceptable UX)
**Tracking:** Consider if users report visual issues

### 5. Audio Feedback Debouncing
**Issue:** Rapid clicks could theoretically cause audio overlap.
**Current behavior:** Web Audio API handles this gracefully (sounds layer).
**Recommendation:** Add 300ms debounce guard for audio playback.
**Priority:** Low (not noticeable in practice)
**Tracking:** Consider if users report audio issues

## Addressed Issues (from CodeRabbit)

1. ✅ **Duplicate event listeners** - Added `handlersAttached` guard in `attachTooltipHandlers()`
2. ✅ **hideTooltip race condition** - Added `hideTimer` tracking and reference comparison before clearing state
3. ✅ **Timer tracking** - Added proper timer cleanup to prevent orphaned tooltips
