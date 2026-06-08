# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React 18 + TypeScript + Vite + Radix UI interactive treasure box game.

## Dev & Build Commands

```bash
npm install        # first time only
npm run dev        # dev server at http://localhost:3000, opens browser automatically
npm run build      # outputs to build/ (not dist/)
```

## Known Config Gaps

- **No `tsconfig.json`** — Vite handles TypeScript transpilation, but there is no standalone type-check command. Take extra care with TypeScript correctness; errors won't surface until runtime or build.
- **No linting config** — No ESLint or similar. Apply extra scrutiny to code quality and style consistency.
- **No tests** — No test framework configured; verification is manual only.

## Conventions

- Path alias `@` resolves to `src/` (configured in `vite.config.ts`).
- `vite.config.ts` contains auto-generated version-pinned dependency aliases — do not modify them unless resolving a specific dependency resolution conflict.
- UI components live in `src/components/ui/` (Radix UI primitives) and `src/components/figma/`.
- Audio assets are in `src/audios/`; image assets in `src/assets/`.
