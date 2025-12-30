# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions.

## What is an ADR?

An ADR captures the context, decision, and consequences of an architecturally significant choice.

## Format

We use the [Michael Nygard format](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Naming Convention

- Filename: `NNN-kebab-case-title.md` (e.g., `001-use-localStorage-for-tracking.md`)
- NNN = zero-padded sequence number (001, 002, 003...)
- Title in heading must match: `# NNN. Title` (e.g., `# 001. Use localStorage for Tracking`)

## Index

<!-- New ADRs added below -->
- [001. Footer-Only Title Placement](001-footer-only-title-placement.md)
- [002. Configurable Copy Shortcuts with Chrome Storage](002-configurable-copy-shortcuts.md)
- [003. Document Title Parsing Strategy](003-document-title-parsing-strategy.md)
- [004. Extract Project Name from Document Title](004-project-name-from-document-title.md)
- [005. Title Observer for SPA Navigation](005-title-observer-for-spa-navigation.md)
- [006. In-Tooltip Copy Feedback](006-tooltip-copy-feedback.md)
- [007. Race Condition Guards](007-race-condition-guards.md)
- [008. Memory Leak Prevention](008-memory-leak-prevention.md)
- [009. Playwright E2E Testing](009-playwright-e2e-testing.md)
- [010. DOM Element Reference Tracking](010-dom-element-reference-tracking.md)
