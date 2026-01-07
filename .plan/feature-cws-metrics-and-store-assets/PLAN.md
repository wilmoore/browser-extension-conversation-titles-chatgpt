# CWS Search Metrics Automation & Store Assets

**Status**: Complete
**Branch**: feature/cws-metrics-and-store-assets

## Overview

Build tooling to track Chrome Web Store search rankings and improve store listing assets.

## Part 1: Search Metrics Automation

### Keywords to Track
1. "Conversation" (broad, competitive)
2. "Conversation Title" (specific, high intent)
3. "Conversation Titles for ChatGPT" (exact match)

### Implementation
- Playwright script to search CWS and find extension position
- On-demand execution via `npm run cws:rank`
- JSONL storage for historical tracking

### Output Format (JSONL)
```jsonl
{"timestamp":"2026-01-05T20:00:00Z","keyword":"Conversation Title","position":1,"page":1,"totalResults":50}
```

## Part 2: Store Assets

### Directory Structure
```
store/
├── screenshots/     # Store listing screenshots
├── icons/          # Icon source files and exports
└── metrics/        # Search ranking history (JSONL)
```

### Screenshots
- Use AI image generators (Ideogram, etc.) for initial concepts
- Focus on clear value proposition, readable at thumbnail size

### Icon
- Design in Figma with pixel-perfect exports
- Sizes: 16x16, 48x48, 128x128 PNG
- Previous attempt (backlog-007) deferred due to rendering issues

## Files Created/Modified
- `scripts/cws-rank.ts` - Playwright ranking script
- `store/metrics/rankings.jsonl` - Historical data (JSONL format)
- `store/icons/DESIGN-REQUIREMENTS.md` - Icon design spec for Figma
- `store/screenshots/PROMPTS.md` - AI image generator prompts
- `package.json` - Added `cws:rank` script and `tsx` dependency
- `Makefile` - Added `cws-rank` and `rank` targets

## Usage

```bash
# Check search rankings
npm run cws:rank
# or
make rank

# Debug mode (saves screenshots)
npx tsx scripts/cws-rank.ts --debug
```

## Initial Results (2026-01-05)

| Keyword | Position |
|---------|----------|
| Conversation | Not in top 10 |
| Conversation Title | #1 |
| Conversation Titles for ChatGPT | #1 |
