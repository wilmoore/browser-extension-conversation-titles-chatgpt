# Fix: Title Display Duplication

## Issue Summary

The conversation title display shows duplicate/incorrect project name formatting.

### Current Behavior (WRONG)

**URL:** `https://chatgpt.com/g/g-p-684034aced208191b0aded1293101979-business-ideas/c/...`
**Document Title:** `Business Ideas - Consulting firms and AI - ChatGPT`

| Component | Current Value |
|-----------|---------------|
| Project name (from URL slug) | `business ideas` (lowercase) |
| Extracted title | `Business Ideas - Consulting firms and AI` |
| **Display (actual)** | `business ideas – Business Ideas - Consulting firms and AI` |

### Expected Behavior (LOCKED)

| Component | Expected Value |
|-----------|----------------|
| Project name | `Business Ideas` (from document title, properly cased) |
| Conversation title | `Consulting firms and AI` (project prefix removed) |
| **Display** | `Business Ideas – Consulting firms and AI` |
| **Copy TITLE** | `Consulting firms and AI` (excludes project prefix) |

## Locked Requirements

### Q1: Canonical Display Title
**Answer:** `Business Ideas – Consulting firms and AI`
- Derived from `document.title`
- URL slugs and inferred casing are **explicitly invalid**
- Status: Resolved, non-configurable

### Q2: Copy Behavior for TITLE
**Answer:** Exclude project prefix
- Copied TITLE = `Consulting firms and AI`
- Status: Resolved, configurable but locked for v1

## Root Cause

The current implementation extracts project name from URL slug:
- URL: `/g/g-p-xxx-business-ideas/c/...`
- Extracted: `business ideas` (lowercase, hyphens → spaces)

But ChatGPT's document title already contains the properly-cased project name:
- Document title: `Business Ideas - Consulting firms and AI - ChatGPT`
- Format: `{ProjectName} - {ConversationTitle} - ChatGPT`

## Implementation Plan

### 1. Update Title Parsing in `context-extractor.ts`

For project conversations, parse document title to extract:
- **Project name**: First segment before ` - ` (properly cased)
- **Conversation title**: Second segment (conversation-specific part)

```typescript
// Document title: "Business Ideas - Consulting firms and AI - ChatGPT"
// Returns: { projectName: "Business Ideas", title: "Consulting firms and AI" }
```

### 2. Update Data Model

The `ConversationContext` interface remains the same, but:
- `projectName`: Now from document title (not URL slug)
- `title`: Now the conversation-specific part only (not the full title)

### 3. Update `formatDisplayText()`

```typescript
// With project: "Business Ideas – Consulting firms and AI"
// Without project: "My Conversation Title"
```

### 4. Update Copy Handlers

| Format | Output |
|--------|--------|
| TITLE | `Consulting firms and AI` (conversation part only) |
| FULL_CONTEXT | `Business Ideas – Consulting firms and AI` |
| MARKDOWN | `[Business Ideas – Consulting firms and AI](url)` |
| URL | `https://chatgpt.com/g/.../c/...` |

## Files to Modify

1. `src/content/context-extractor.ts`
   - `parseTitleFromDocument()` - Extract both project name and title
   - `getProjectName()` - Use parsed project name from doc title
   - `getConversationTitle()` - Return conversation-specific part only

2. `src/content/context-extractor.test.ts` - Update tests

3. `src/content/copy-handler.ts` - Verify TITLE format uses `context.title` only

## Acceptance Criteria

- [ ] Display: `Business Ideas – Consulting firms and AI`
- [ ] Copy TITLE: `Consulting firms and AI`
- [ ] Copy FULL_CONTEXT: `Business Ideas – Consulting firms and AI`
- [ ] Project name uses proper casing from document title
- [ ] Non-project conversations unchanged
- [ ] All tests pass
- [ ] No regressions
