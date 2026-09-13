# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (http://localhost:5173/)
- `npm run build` — `tsc -b && vite build`. Use this rather than bare `tsc`; it type-checks `src/` and the Vite/Vitest configs.
- `npm run lint` — ESLint flat config (`eslint.config.js`). `src/components/ui` and `src/hooks` are shadcn-generated and ignored.
- `npm test` — Vitest, `src/**/*.test.ts` only. Run a single file with `npx vitest run src/topics/bst/operations.test.ts`.
- `npm run preview` — serve the production build with SPA fallback.
- `docker build -t dsa-explorer . && docker run -p 8080:80 dsa-explorer` — the production image (nginx, SPA fallback in `nginx.conf`).
- `node scripts/extract-content.mjs` — regenerate every `src/topics/*/content.ts` from `references/Week-*.md`.

## Source of truth

`SPEC.md` at the repo root is the binding spec. Treat these sections as contracts, not suggestions:

- **§7** — the types in `src/types/step-engine.ts` are copied verbatim. Don't extend `TopicModule` for one topic's convenience; extend the topic's own types.
- **§9** — playback semantics of `usePlayback` in `src/lib/step-engine.ts`.
- **§10.x** — per-topic snapshot shapes, canvas rules, pseudocode, and **step tables**. Every `run()` must emit exactly those steps, in that order, with those `highlightLine` values. `src/topics/bst/operations.test.ts` is the executable form of §10.1 — write the equivalent for each new topic.
- **§11** — course content. The markdown in `references/` has been through the course's citation-integrity process.

## Invariants

- **`src/index.css` is verbatim from SPEC.md §5.** Never edit it. Global CSS additions go in `src/app.css` (the actual Tailwind entry, which imports `index.css` and `tw-animate-css`).
- **`src/topics/*/content.ts` is generated, verbatim text.** Never rewrite, summarize, or "improve" it. If the reference markdown changes, re-run the extract script. If you need different prose on the page, change the page chrome (`TopicPage.tsx`), not the content.
- **Steps are precomputed in full.** `run()` returns the entire `steps[]` and a `finalSnapshot`; there is no partial-execution state. Scrubbing and step-backward are just index changes.
- **Snapshots are immutable values.** Each step's `snapshot` is a fresh deep copy with layout recomputed and highlights applied; the `finalSnapshot` carries no highlights. Never share node objects between steps.
- **Randomize and Reset bypass the step engine** — they set `state` directly and clear `steps` to `[]`. Changing a variant does the same.
- **v1 contract: `TState = TSnapshot`** for every topic (SPEC §10 defines them identically). `VisualizerShell` sets `state = result.finalSnapshot` after every operation. If a future topic needs a state that differs from its snapshot, that's a shell change, not a per-topic hack.
- **Canvases are `viewBox`-scaled SVG** with no fixed pixel width/height (§12). Compute the viewBox from node extents.
- **BST node ids are `k${key}`** (`nodeId()` in `src/topics/bst/types.ts`) — keys are unique, so the id is stable across snapshots and Framer Motion can animate a node between positions.
- **Hash table `M` is fixed at 11** (`HASH_TABLE_M`); Framer Motion (`motion/react`) is the animation layer. Both were §17 open items, decided 2026-09-13.

## Architecture

Single-page, client-only React app. No backend, no persistence beyond the dark-mode preference in `localStorage`.

- **Registry** — `src/topics/registry.ts` exports `topics: TopicModule[]`. It drives `AppSidebar` (grouped by `weekLabel`), `HomePage`, and `TopicPage`'s slug lookup. Adding a topic means adding one entry here and nothing else.
- **Routing** — `src/app-router.tsx`, `createBrowserRouter` with no loaders. `/` → `HomePage`, `/topic/:slug` → `TopicPage`, anything else redirects to `/`. Week numbers are metadata, never part of the URL.
- **`TopicPage`** renders `realWorldUsage` → `<VisualizerShell key={slug}>` → `coreMaterial`. The `key` is what resets visualizer state when navigating between topics.
- **`VisualizerShell`** (`src/components/visualizer/`) owns the persistent `state`, the current `steps[]`, the selected operation, the variant value, and the input text. It composes `OperationBar`, the topic's `CanvasComponent`, `CodePanel`, and `PlaybackControls`. The canvas always renders `playback.currentStep?.snapshot ?? state`. Keyboard shortcuts (Space, ←, →) are a document-level listener that ignores events from form fields.
- **`usePlayback(steps)`** (`src/lib/step-engine.ts`) — index + timer. A new `steps` array identity resets it (done via the adjust-state-during-render pattern, not an effect, to satisfy `react-hooks/set-state-in-effect`). Play at the last step replays from 0.
- **Layout helpers** — `src/lib/layout/tree-layout.ts` (`layoutBinaryTree`, in-order x / depth y, generic over a child accessor so heaps reuse it with indices) and `src/lib/layout/graph-layout.ts` (synchronous `d3-force` run; cache the result per vertex/edge set).
- **Content rendering** — `src/components/MarkdownContent.tsx` wraps `react-markdown` with a Tailwind `components` map. No typography plugin (it would need edits to `index.css`).
- **Topic module layout** — each `src/topics/<slug>/` has `types.ts`, `operations.ts`, `pseudocode.ts`, `canvas.tsx`, `content.ts` (generated), `index.ts`. `src/topics/bst/` is the complete reference implementation; copy its shape.

## Current status

| Topic | Status |
|---|---|
| `bst` | Complete — insert / search / delete (Hibbard) / inorder, animated canvas, tests. |
| `binary-heap` | Stub — content, pseudocode, variant (`max`/`min`) wired; `operations = []`, placeholder canvas. |
| `hash-table` | Stub — content, pseudocode, variant (`chaining`/`probing`); `operations = []`, placeholder canvas. |
| `graph` | Stub — content, pseudocode, variant (`undirected`/`directed`); `operations = []`, placeholder canvas. |

Un-stubbing a topic = implementing `operations.ts` against its §10 step table, replacing the placeholder in `canvas.tsx`, writing `operations.test.ts`, and (for hash-table/graph) filtering `operations` by the active variant — the shell passes `variant` to the canvas but does not yet filter the operation list; add that in `VisualizerShell`/`OperationBar` when the first variant-dependent operation set lands.

## Conventions

- **shadcn/ui, style `new-york`**, components in `src/components/ui/`, `cn` from the `cn` package (re-exported at `@/lib/utils`). Add components with `npx shadcn@latest add <name>`; `components.json` points the CSS at `src/index.css` — check it's still verbatim afterwards (`git diff src/index.css`).
- **`@/` alias** → `src/` (configured in `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`).
- **Animation** — import from `motion/react`. Give every `motion.*` SVG element a full `initial` for any attribute you `animate` (an undefined `x1`/`y1` throws a DOM warning).
- **Theme colors in SVG** — use `var(--color-accent)`, `var(--color-chart-5)`, etc. so canvases follow dark mode; never hard-code hex.
- **Step descriptions** are plain strings following the spec's templates (e.g. `` `${key} < ${node.key} → go left` ``). Extra runtime detail goes in `variables`, rendered as badges.
- **TypeScript** — `tsc -b` with `tsconfig.app.json` (`src/`, tests excluded) and `tsconfig.node.json` (Vite + Vitest configs). `baseUrl` is not used (deprecated in TS 6); `paths` alone resolves `@/`.

## Decisions log

- **React 19 + React Router v7** (spec said React 18). Current shadcn requires 19; Router is pinned `^7` — v8 exists, don't upgrade casually.
- **Vite 8 / Tailwind v4 / TS 6** with npm (not pnpm), matching the sibling `statprob-explorer` project.
- **Deployment** — GHCR image via `.github/workflows/deploy.yml`; Traefik labels and the Cloudflare Tunnel hostname live on the home server. The subdomain (`dsa.ridhopratama.net` proposed) is still an open item from §17.
- **BST initial state** is a fixed seed tree (`50 30 70 20 40 60 80`) rather than empty, so the page is demo-ready on load. Reset returns to it.
