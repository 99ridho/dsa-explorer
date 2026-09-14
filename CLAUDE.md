# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev`: Vite dev server (http://localhost:5173/)
- `npm run build`: `tsc -b && vite build`. Use this rather than bare `tsc`; it type-checks `src/` and the Vite/Vitest configs.
- `npm run lint`: ESLint flat config (`eslint.config.js`). `src/components/ui` and `src/hooks` are shadcn-generated and ignored.
- `npm test`: Vitest, `src/**/*.test.ts` only. Run a single file with `npx vitest run src/topics/bst/operations.test.ts`.
- `npm run test:e2e`: Playwright, `e2e/*.spec.ts`, against a Vite dev server it starts on port 5199 (it reuses one already running there). Needs Chromium once: `npx playwright install chromium`. Run one test with `npx playwright test -g "short listing"`.
- `npm run preview`: serve the production build with SPA fallback.
- `docker build -t dsa-explorer . && docker run -p 8080:80 dsa-explorer`: the production image (nginx, SPA fallback in `nginx.conf`).
- `node scripts/extract-content.mjs`: regenerate every `src/topics/*/content.ts` from `references/Week-*.md`.

## Source of truth

`SPEC.md` at the repo root is the binding spec. Treat these sections as contracts, not suggestions:

- **§7**: the types in `src/types/step-engine.ts` are copied verbatim. Don't extend `TopicModule` for one topic's convenience; extend the topic's own types.
- **§9**: playback semantics of `usePlayback` in `src/lib/step-engine.ts`.
- **§10.x**: per-topic snapshot shapes, canvas rules, pseudocode, and **step tables**. Every `run()` must emit exactly those steps, in that order, with those `highlightLine` values. `src/topics/bst/operations.test.ts` is the executable form of §10.1; write the equivalent for each new topic.
- **§11**: course content. The markdown in `references/` has been through the course's citation-integrity process.
- **§19**: case studies. Same rules as §10: every simulator `run()` emits the §19.x step table, and each case study's `operations.test.ts` is its executable form.

## Copy and text: antislop is mandatory

SPEC.md §18 makes the antislop rule set binding on every piece of text in this project. This is not optional and not a style preference.

- Before writing or editing any prose or UI string (narration templates, placeholders, errors, aria-labels, comments, docs, this file), load the skills with the Skill tool: `antislop:antislop` (core) and `antislop:antislop-copywriting`. For code comments also `antislop:antislop-code`.
- The usage-mode question is already answered: **DURING**. Apply the rules while writing. Do not ask the user again.
- Before delivering copy, run the copywriting skill checklist and Delivery Gate Block 1 and include the PASS lines with evidence in your report.
- `npm run lint:copy` is the mechanical floor (em dash U+2014, spaced double hyphen). It runs inside `npm run lint` and in CI. Passing it is necessary, not sufficient.
- Carve-outs: the en dash in numeric ranges (`Weeks 13–15`); the `←/→` glyphs in the keyboard hint, which name real keys; bold-label bullets in this file, which are a documentation convention.
- Narration house style (SPEC §18): one plain present-tense sentence per step, names the key or node, ends with a period; `so` for cause and effect, a colon for a result, never an arrow or a dash. The SPEC §10 tables are the canonical examples; write a new topic's table in that style first, then implement `run()` against it.
- The course references in `references/` are also under the standard, but only punctuation may change there; wording and citations are frozen (SPEC §11).
- Past audits live in `anti-slop/audit-NNN-YYYY-MM-DD.md`. A new audit gets the next number.

## Invariants

- **`src/index.css` is verbatim from SPEC.md §5.** Never edit it. Global CSS additions go in `src/app.css` (the actual Tailwind entry, which imports `index.css` and `tw-animate-css`).
- **`src/topics/*/content.ts` is generated, verbatim text.** Never rewrite, summarize, or "improve" it. If the reference markdown changes, re-run the extract script. If you need different prose on the page, change the page chrome (`TopicPage.tsx`), not the content.
- **Steps are precomputed in full.** `run()` returns the entire `steps[]` and a `finalSnapshot`; there is no partial-execution state. Scrubbing and step-backward are just index changes.
- **Snapshots are immutable values.** Each step's `snapshot` is a fresh deep copy with layout recomputed and highlights applied; the `finalSnapshot` carries no highlights. Never share node objects between steps.
- **Randomize and Reset bypass the step engine**: they set `state` directly and clear `steps` to `[]`. Changing a variant does the same.
- **v1 contract: `TState = TSnapshot`** for every topic (SPEC §10 defines them identically). `VisualizerShell` sets `state = result.finalSnapshot` after every operation. If a future topic needs a state that differs from its snapshot, that's a shell change, not a per-topic hack.
- **Canvases are `viewBox`-scaled SVG** with no fixed pixel width/height (§12). Compute the viewBox from node extents. The hash-table canvases are HTML flex/grid rather than SVG because they are tables of boxes, not diagrams; they still must not overflow at 400px.
- **Operations declare `variants`** when they only apply to one variant value (SPEC §7). `createInitialState(variant)` must honor the variant so Reset stays in the mode the student picked.
- **Graph positions live in the snapshot.** `buildGraph` runs `layoutGraph` (d3-force) once per vertex/edge set; algorithm steps copy positions and never re-run the simulation. Vertices are integers `0..V-1`, at most 10; undirected edges are stored once with `from < to`.
- **Heap pseudocode has no blank lines.** The SINK block is appended to the remove, build-heap, and heapsort listings so sub-steps highlight real lines; `highlightLine` values in `operations.ts` are per listing (see the `SinkLines` offsets).
- **BST node ids are `k${key}`** (`nodeId()` in `src/topics/bst/types.ts`), because keys are unique, so the id is stable across snapshots and Framer Motion can animate a node between positions.
- **Hash table `M` is fixed at 11** (`HASH_TABLE_M`); Framer Motion (`motion/react`) is the animation layer. Both were §17 open items, decided 2026-09-13.
- **Linked snapshots store real links** (`nodes` map + `firstId`/`lastId` + `nextId`, helpers in `src/lib/linked-nodes.ts`), never an ordered array: a step can show a node that exists but is not yet reachable, and `nextId` lives in the snapshot so `run()` stays pure. Node ids are `n${nextId}`.
- **Row canvases are shared.** `ArrayRow` and `LinkedRow` in `src/components/visualizer/canvas/` draw every array-backed and linked topic; highlight-kind classes live in `kinds.ts` there. A topic's `canvas.tsx` only maps its snapshot to cells.
- **`inputKind: 'text'`** is a free-form field (Stack's Evaluate expression). An operation may set `placeholder` to override the per-kind default in `input-parsing.ts`.
- **B-tree `M` is fixed at 4** (`BTREE_M`). Guide keys always equal their subtree's smallest key (one line beyond algs4, SPEC §10.12); `layoutMultiwayTree` in `tree-layout.ts` positions nodes by subtree width.
- **Counts pluralize in narration** (`plural()` in `linked-nodes.ts`): "1 item", never "1 items".
- **Live fields are computed, never stored.** `structure.liveFields(snapshot, variant)` returns at most six scalars read from the snapshot; `src/topics/structure.test.ts` runs it on the seed and on every step of every seed operation and caps each chip's `key = value` text at 14 characters so it fits one `LiveFields` track. Keep the key set constant per representation, so the row never changes shape while stepping.
- **Tree canvases render at a fixed height** (heap 200, BST 260, B-tree 300): a narrowing `viewBox` must not grow the card mid-operation, or the page moves on phones (scroll anchoring). The heap's empty message takes the same height.
- **Case study simulators are TopicModules outside `topics`.** `src/case-studies/registry.ts` holds them; `structure.test.ts` and `snippets.test.ts` run over topics and simulators alike. Their `content.ts` is hand-written (not generated), marks the story as illustrative, and quotes every cost from the week it names. A predict quiz question never draws a picture by hand: `predictStep()` in `src/lib/predict-step.ts` runs the operation on the seed.
- **A region with `data-shell-keys="off"`** (the quiz) keeps Space and the arrow keys for its own controls; `VisualizerShell`'s listener skips events from inside it.
- **Structure copy quotes the week reference.** A cost is an `O(...)` form or the reference's own sentence with its Property or Proposition name; a number the reference does not state is not shown. The B-tree entry follows SPEC §10.12 (up to `M` entries, split at `M`), not the reference's `M - 1` line. `representations` are keyed by variant value, or `default` alone when every variant shares one representation (complexity).

## Architecture

Single-page, client-only React app. No backend, no persistence beyond the dark-mode preference in `localStorage`.

- **Registry**: `src/topics/registry.ts` exports `topics: TopicModule[]`. It drives `AppSidebar` (grouped by `weekLabel`), `HomePage`, and `TopicPage`'s slug lookup. Adding a topic means adding one entry here and nothing else.
- **Routing**: `src/app-router.tsx`, `createBrowserRouter` with no loaders. `/` → `HomePage`, `/topic/:slug` → `TopicPage`, anything else redirects to `/`. Week numbers are metadata, never part of the URL.
- **`TopicPage`** looks up the slug and renders `<TopicView key={slug}>`, a two-column grid at `lg`: left is `VisualizerShell`, right is shadcn `Tabs` (Real-World Usage by default, Core Material, or Structure). The first two render `MarkdownContent`; Structure renders `StructurePanel` (`src/components/StructurePanel.tsx`, structured JSX because the markdown renderer has no tables) over `topic.structure`. `TopicView` mirrors the shell's variant through `onVariantChange` so the panel can mark the representation on the canvas; the shell still owns the variant and its resets. At `lg` the `<article>` is capped at `100svh` minus the 3.5rem header and `main`'s `py-6`, with `overflow-hidden`, so the document never scrolls; the Code listing and the active `TabsContent` are the scrollers (SPEC §6, §12). The visualizer section has `overflow-y-auto` only as a fallback for viewports too short for canvas + Operation + Playback. Narrow viewports stack, visualizer first, and the document scrolls. The `key` on `TopicView` is what resets visualizer state, the selected tab, and the variant mirror when navigating between topics. `e2e/topic-page-layout.spec.ts` is the executable form of this contract.
- **`VisualizerShell`** (`src/components/visualizer/`) owns the persistent `state`, the current `steps[]`, the selected operation, the variant value, and the input text. It composes `OperationBar`, the topic's `CanvasComponent` with `LiveFields` under it in the same card (chips in the `CodePanel` badge style, in a fixed-track grid so the row's height does not depend on the values), `CodePanel`, and `PlaybackControls` in a grid sized for the ~60 % column it lives in: canvas full width, then Operation + Playback stacked beside a tall Code card (`md` and up); below `md` the DOM order is the §12 mobile order. The rows are `auto auto 1fr` with the Playback card `self-start`, so Operation and Playback keep their content height and Code's surplus lands in the last row. At `lg` the Code card also `self-start`s with `max-h-full`, so it sizes to its listing and is capped at the column; `CodePanel`'s `<ol>` is the scroller and keeps the highlighted line in view by setting its own `scrollTop` (never `scrollIntoView`, which would move the page on narrower viewports). The canvas always renders `playback.currentStep?.snapshot ?? state`. Keyboard shortcuts (Space, ←, →) are a document-level listener that ignores events from form fields.
- **`usePlayback(steps)`** (`src/lib/step-engine.ts`): index + timer. A new `steps` array identity resets it and, with more than one step, starts playing (Go autoplays; `autoplay: false` opts out). Done via the adjust-state-during-render pattern, not an effect, to satisfy `react-hooks/set-state-in-effect`. Play at the last step replays from 0.
- **Layout helpers**: `src/lib/layout/tree-layout.ts` (`layoutBinaryTree`, in-order x / depth y, generic over a child accessor so heaps reuse it with indices) and `src/lib/layout/graph-layout.ts` (synchronous `d3-force` run; cache the result per vertex/edge set).
- **Code panel** (`src/components/visualizer/CodePanel.tsx`): tab strip Pseudocode | C++ | Java | Python, remembered in `localStorage`. Pseudocode highlights `highlightLine`; a language tab highlights every `SnippetLine` whose `pseudo` equals it. Lines soft-wrap with a hanging indent (`padding-left: (indent + 2)ch; text-indent: -2ch`); never reintroduce `overflow-x-auto` or `whitespace-pre` there.
- **Snippets** (`src/topics/<slug>/snippets.ts`): authored with `code([...])` from `src/lib/snippets.ts`, where a plain string is an unmapped line and `[text, pseudoLine]` is mapped. Shared listings (hash chaining and probing trios, heap remove max/min) are one object assigned to several ids. `src/topics/snippets.test.ts` runs every operation on its seed state and fails if any emitted `highlightLine` has no mapped line in one of the three languages; extend its `INPUTS` table when an operation gains a new branch.
- **Case studies** (`src/case-studies/<slug>/`, SPEC §19): `/case-study/:slug` renders `CaseStudyPage` on the `TopicPage` layout, with the simulator's `VisualizerShell` on the left and Scenario, Reasoning (`DecisionList`), and Quiz (`QuizPanel`) tabs on the right. Each module has `types.ts`, `operations.ts` + test, `pseudocode.ts`, `snippets.ts`, `structure.ts`, `canvas.tsx` (a `FocusCaption` view switch over existing topic canvases: the view follows the step's `focus`, and the student can open another part until the focus changes, via `useFollowedView`), `simulator.ts`, `content.ts`, `decisions.ts`, `quiz.ts`, `index.ts`. The simulator's variant is always chosen design first, naive design second, with a live-field counter for the naive cost. The sidebar and home page list them after the weeks.
- **Content rendering**: `src/components/MarkdownContent.tsx` wraps `react-markdown` with a Tailwind `components` map. No typography plugin (it would need edits to `index.css`).
- **Topic module layout**: each `src/topics/<slug>/` has `types.ts`, `operations.ts`, `pseudocode.ts`, `snippets.ts`, `structure.ts` (the ADT table, invariants, one declaration per representation, `liveFields`), `canvas.tsx`, `content.ts` (generated), `index.ts`. `src/topics/bst/` is the complete reference implementation; copy its shape.

## Current status

| Topic | Status |
|---|---|
| `bst` | Complete: insert / search / delete (Hibbard) / inorder, animated SVG tree, 14 tests. |
| `binary-heap` | Complete: insert / remove max or min / build heap / heapsort, tree + array dual view, 7 tests. Min mode flips every comparison and every narration word. |
| `hash-table` | Complete: insert / search / delete for chaining and for linear probing (six ops, three visible per variant), two canvases, 9 tests. Probing delete rehashes the cluster. |
| `graph` | Complete: add edge / BFS / DFS / connected components (undirected) / topological sort and Kosaraju-Sharir strong components (directed), force-layout SVG with arrowheads when directed, 10 tests. |
| `complexity` | Complete: doubling ratio test / count accesses for N on 1-sum, 2-sum, 3-sum (variant `problem`), exact brute-force counts, table plus ratio bars, 6 tests. |
| `arrays` | Complete: create / access / set / resize / memory cost, with length and byte badges on every step, 7 tests. |
| `queue` | Complete: enqueue / dequeue on a resizing array (wrap-around, doubling, halving narrated) or a linked list (variant `impl`), 12 tests. |
| `stack` | Complete: push / pop on a resizing array or a linked list, plus Evaluate expression (Dijkstra's two-stack algorithm, `inputKind: 'text'`), 11 tests. |
| `linked-list` | Complete: insert first / insert last / remove first / traverse, 8 tests. |
| `sorting` | Complete: load / selection sort / insertion sort / shellsort with compare and exchange counts as badges, 7 tests. |
| `searching` | Complete: get / put on an unordered list (sequential search) or an ordered array (binary search with rank), FrequencyCounter values, 9 tests. |
| `b-tree` | Complete: get / put with leaf, parent, and root splits (algs4 `BTree.java`, M = 4, guide keys kept equal to the subtree minimum), multiway SVG layout, 10 tests. |
| case study `canteen-orders` | Complete (Weeks 1–7): place / serve / find on a queue with a sorted resizing log, or a stack with an unsorted log (`skipped` counter), 8 tests, 8 quiz questions. |
| case study `er-triage` | Complete (Weeks 9–11): admit / treat on a max heap or an arrival queue (`bypassed` counter), record lookup in a B-tree archive (lifted §10.12 get steps), 10 tests, 8 quiz questions. |
| case study `study-plan` | Complete (Weeks 12–15): add course (string-hash index) / add prerequisite (typed `PR1 before PR2`) / build plan by topological sort with cycle report, or alphabetically with a violation count, 9 tests, 8 quiz questions. |

All twelve RPS topics are implemented (SPEC §10.1 to §10.12, expansion of 2026-09-13 and 2026-09-14) and each ships a `structure.ts`; `src/topics/structure.test.ts` and `src/topics/snippets.test.ts` share the seed inputs in `src/topics/test-inputs.ts`. Registry order is week order, so a new module goes at its week position. Row-shaped topics reuse `ArrayRow` / `LinkedRow`; trees reuse `layoutBinaryTree` / `layoutMultiwayTree`. Operations are scoped with `variants` (SPEC §7); `VisualizerShell` filters the list by the active variant and falls back to the first visible operation.

## Conventions

- **shadcn/ui, style `new-york`**, components in `src/components/ui/`, `cn` from the `cn` package (re-exported at `@/lib/utils`). Add components with `npx shadcn@latest add <name>`; `components.json` points the CSS at `src/index.css`, so check it's still verbatim afterwards (`git diff src/index.css`).
- **`@/` alias** → `src/` (configured in `tsconfig.app.json`, `vite.config.ts`, `vitest.config.ts`).
- **Animation**: import from `motion/react`. Give every `motion.*` SVG element a full `initial` for any attribute you `animate` (an undefined `x1`/`y1` throws a DOM warning).
- **Theme colors in SVG**: use `var(--color-accent)`, `var(--color-chart-5)`, etc. so canvases follow dark mode; never hard-code hex.
- **Step descriptions** are plain strings following the spec's templates (e.g. `` `${key} < ${node.key} → go left` ``). Extra runtime detail goes in `variables`, rendered as badges.
- **TypeScript**: `tsc -b` with `tsconfig.app.json` (`src/`, tests excluded) and `tsconfig.node.json` (Vite + Vitest configs). `baseUrl` is not used (deprecated in TS 6); `paths` alone resolves `@/`.

## Decisions log

- **React 19 + React Router v7** (spec said React 18). Current shadcn requires 19; Router is pinned `^7`; v8 exists, don't upgrade casually.
- **Vite 8 / Tailwind v4 / TS 6** with npm (not pnpm), matching the sibling `statprob-explorer` project.
- **Deployment**: GHCR image via `.github/workflows/deploy.yml`; Traefik labels and the Cloudflare Tunnel hostname live on the home server. The subdomain (`dsa.ridhopratama.net` proposed) is still an open item from §17.
- **Two-column topic page** (2026-09-13): visualizer left + sticky, materials right in tabs, replacing the spec's original usage → visualizer → material stack; SPEC §6 was amended to match. `main` is capped at `max-w-screen-2xl` to give the split room.
- **Viewport-locked topic page** (2026-09-14): replaces the sticky column. At `lg` the page never scrolls; only the Code listing and the materials panel do, and Operation, Playback, and Code size to their content. SPEC §3, §4, §6, §8, §12, §16 amended; Playwright added for the layout contract (`e2e/`, `npm run test:e2e`, runs in CI before the image build).
- **Code panel: wrapping + language tabs** (2026-09-13): lines no longer clip; every operation ships C++, Java (algs4 style), and Python with synced highlighting. SPEC §7, §8, §10 intro, §14, §16 amended.
- **Remaining visualizers completed** (2026-09-13): heap, hash table, graph implemented against SPEC §10.2 to §10.4; the spec gained `variants`, `createInitialState(variant)`, hash and graph step tables, `PROBE_DELETE`, `Add edge`, integer vertices, and cycle handling for topological sort. `PlaceholderCanvas` removed.
- **antislop mandated** (2026-09-13): SPEC §18 written, copy audited (`anti-slop/audit-001-2026-09-13.md`), `lint:copy` guard added to `lint` and CI, references scrubbed for punctuation only and `content.ts` regenerated.
- **Structure view** (2026-09-14): every topic declares `structure` (SPEC §7 `StructureSpec`): the ADT operations with costs quoted from the references, invariants, and a language-neutral declaration per representation, shown in a third materials tab, plus a live instance-fields row under the canvas. Chosen over per-language declarations (three times the authoring) and over a fifth Code tab (it would crowd the listing). Analysis of Algorithms and Sorting get an honest entry with an empty operation table.
- **Case studies** (2026-09-14): three scenarios, one per block of the semester, each with a naive-versus-chosen simulator, a Reasoning tab, and an 8-question quiz (6 multiple choice, 2 predict-the-next-step). SPEC §2 now allows a quiz on case study pages only; scores stay in memory. The empty text-input error became generic ("The field is empty. Type a value, then press Go.") because course codes use `inputKind: 'text'` too.
- **BST initial state** is a fixed seed tree (`50 30 70 20 40 60 80`) rather than empty, so the page is demo-ready on load. Reset returns to it.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, load the antislop core and then the skill for the task with the Skill tool (they ship as the `antislop` plugin, not as files in this repo):
- Core (always first): `antislop:antislop`
- UI / visual: `antislop:antislop-ui`
- Copy & text: `antislop:antislop-copywriting`
- People: `antislop:antislop-human`
- Mobile / responsive: `antislop:antislop-layoutmobile`
- Code comments: `antislop:antislop-code`
Usage mode for this project is DURING (already answered, see "Copy and text" above). Do not ask again.
<!-- antislop:end -->
