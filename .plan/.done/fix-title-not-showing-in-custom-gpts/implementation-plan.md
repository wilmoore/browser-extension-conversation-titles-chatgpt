# Implementation Plan: Structural Footer Detection

## Key Discovery

Both regular conversations AND custom GPTs use the same structural pattern:

```
DIV.[view-transition-name:var(--vt-disclaimer)]
└── (contains leaf text nodes with footer content)
```

**Selector**: `[class*="vt-disclaimer"]`

This is ChatGPT's semantic marker for the disclaimer/footer area, regardless of text content.

### Regular Conversation Footer
```
DIV.vt-disclaimer
└── SPAN "ChatGPT can make mistakes. Check important info."
```

### Custom GPT Footer (version notification)
```
DIV.vt-disclaimer
└── SPAN.text-token-secondary "New version of GPT available"
    (+ other text nodes for the full message)
```

## Implementation Steps

### 1. Update `selectors.ts`

Add new structural selector constant:
```typescript
export const FOOTER_STRUCTURAL_SELECTOR = '[class*="vt-disclaimer"]';
```

Keep `DISCLAIMER_PATTERNS` for backwards compatibility (restoration) but not for detection.

### 2. Update `placement-manager.ts` - `findFooter()`

**Current**: Searches for text patterns ("ChatGPT can make mistakes")
**New**: Use structural detection first

```typescript
export function findFooter(): Element | null {
  // Primary: Use ChatGPT's semantic marker for disclaimer area
  const vtDisclaimer = document.querySelector('[class*="vt-disclaimer"]');
  if (vtDisclaimer && isElementVisible(vtDisclaimer)) {
    return vtDisclaimer;
  }

  // Fallback: #thread-bottom-container (still structural, no text matching)
  const threadBottom = document.querySelector('#thread-bottom-container');
  if (threadBottom) {
    const textCenter = threadBottom.querySelector('.text-center');
    if (textCenter && isElementVisible(textCenter)) {
      return textCenter;
    }
  }

  return null;
}
```

Remove `containsDisclaimerText()` function and its usage.

### 3. Update `title-renderer.ts`

#### 3a. Update `render()` - Remove `isDisclaimerElement()` check

**Current** (line 405):
```typescript
if (!(targetElement instanceof HTMLElement) || !isDisclaimerElement(targetElement)) {
  return false;
}
```

**New**:
```typescript
if (!(targetElement instanceof HTMLElement)) {
  return false;
}
```

#### 3b. Update `findDisclaimerTextElement()` → rename to `findFooterTextElement()`

**Current**: Searches for "ChatGPT can make mistakes" text
**New**: Find innermost text-containing element (any content)

```typescript
function findFooterTextElement(container: HTMLElement): HTMLElement | null {
  // If container has no children and has text, use it directly
  if (container.children.length === 0 && container.textContent?.trim()) {
    return container;
  }

  // Find the first leaf node with text content
  for (const child of container.querySelectorAll('*')) {
    if (child instanceof HTMLElement &&
        child.children.length === 0 &&
        child.textContent?.trim()) {
      return child;
    }
  }

  return null;
}
```

#### 3c. Remove `isDisclaimerElement()` function (no longer needed)

### 4. Update Tests

#### `placement-manager.test.ts`
- Remove tests that check for specific disclaimer text matching
- Add tests for structural detection with `vt-disclaimer` class
- Test both regular and custom GPT footer structures

#### `title-renderer.test.ts`
- Remove `isDisclaimerElement` tests
- Update `findFooterTextElement` tests to not require specific text
- Test rendering works with any footer text content

### 5. Update `selectors.ts` - Consider deprecating `DISCLAIMER_PATTERNS`

The patterns may still be useful for:
- Original text restoration on cleanup
- Identifying if we're in a "standard" conversation

For now, keep but add comment that it's not used for detection.

## Risk Assessment

### Low Risk
- Structural selector `[class*="vt-disclaimer"]` is ChatGPT's own semantic pattern
- It's more stable than text patterns (text can be localized, changed, etc.)
- Fallback to `#thread-bottom-container` provides additional safety

### Potential Issues
- If ChatGPT removes the vt-disclaimer class → fallback kicks in
- If footer structure changes significantly → both approaches fail (but same as current)

## Test Plan

1. Build extension locally
2. Load in Chrome
3. Test in:
   - Regular conversation (should still work)
   - Custom GPT with "New version" message (should now work)
   - New conversation during streaming (should still work)
   - Project conversation (should still work)
4. Verify click handlers work in all cases
5. Run automated tests
