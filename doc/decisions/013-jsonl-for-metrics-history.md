# 013. JSONL for Metrics History

Date: 2026-01-05

## Status

Accepted

## Context

The CWS search ranking tracker needs to store historical data to track position changes over time. Each check produces 3 results (one per keyword), and the system should support indefinite historical data accumulation.

## Decision

Use JSONL (JSON Lines) format instead of a JSON array for storing ranking history.

```jsonl
{"timestamp":"2026-01-05T07:09:05Z","keyword":"Conversation","position":null,"page":null,"found":false}
{"timestamp":"2026-01-05T07:09:14Z","keyword":"Conversation Title","position":1,"page":1,"found":true}
```

## Consequences

**Positive:**
- Append-only writes: new results add a single line without parsing/rewriting the file
- No corruption risk: partial writes don't break existing data
- Clean git diffs: additions show as single line changes
- Memory efficient: can process large history files line-by-line
- Unix-friendly: works with `tail`, `grep`, `head` for quick analysis

**Negative:**
- Some JSON tools expect arrays (minor - easy to convert if needed)
- Less "pretty" when viewing in editors without JSONL support

## Alternatives Considered

1. **JSON Array** - Rejected because:
   - Must read entire file, modify array, rewrite entire file to append
   - Partial write during append corrupts the entire file
   - Noisy git diffs (closing bracket moves, indentation changes)

2. **SQLite** - Rejected as overkill for simple time-series data

## Related

- Planning: `.plan/.done/feature-cws-metrics-and-store-assets/`
- Implementation: `scripts/cws-rank.ts`
