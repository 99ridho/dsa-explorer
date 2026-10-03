# Architecture Decision Records

This file records the decisions that changed or settled `SPEC.md`, one entry per decision, oldest first. `SPEC.md` states the current contract; this file says why it reads that way. Entries are append-only: a later decision that reverses an earlier one gets a new number, and the old entry's status changes to "Superseded by ADR-NNN". A change that records a decision here amends `SPEC.md` in the same commit.

Each entry has a date, a status, and three parts: the context that forced the decision, the decision, and its consequences for the spec and the code.

## ADR-001: React 19 and React Router v7

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** SPEC §3 originally named React 18. Current shadcn/ui requires React 19.

**Decision.** Use React 19 with React Router v7, pinned `^7`.

**Consequences.** SPEC §3 names React 19. React Router v8 exists; upgrading to it is a separate decision, not a routine dependency bump.

## ADR-002: Vite 8, Tailwind v4, TypeScript 6, npm

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** The sibling `statprob-explorer` project already runs this toolchain.

**Decision.** Vite 8, Tailwind CSS v4, TypeScript 6, with npm as the package manager (not pnpm), matching `statprob-explorer`.

**Consequences.** `baseUrl` is not used in the tsconfigs because TS 6 deprecates it; `paths` alone resolves `@/`.

## ADR-003: Deployment through GHCR and the home server

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** SPEC §13 follows the `dsa-online-judge` deployment pattern.

**Decision.** `.github/workflows/deploy.yml` builds the image and pushes it to GHCR. The Traefik labels and the Cloudflare Tunnel hostname live on the home server, not in this repository.

**Consequences.** The subdomain (`dsa.ridhopratama.net` proposed) is still open in SPEC §17.

## ADR-004: Framer Motion as the animation layer

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** SPEC §3 and §17 left open whether to use Framer Motion or fall back to CSS transitions.

**Decision.** Framer Motion, imported from `motion/react`, animates snapshot-to-snapshot transitions.

**Consequences.** BST node ids are stable (`k${key}`) so a node animates between positions. Every `motion.*` SVG element gives a full `initial` for each attribute it animates. SPEC §3 and §17 no longer list the question as open.

## ADR-005: Hash table size `M` fixed at 11

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** SPEC §10.3 and §17 left open whether `M` is fixed or set by the student.

**Decision.** `M` is fixed at 11 (`HASH_TABLE_M`), a small prime that keeps the table legible.

**Consequences.** The step tables in SPEC §10.3 assume `M = 11`. SPEC §10.3 and §17 no longer list the question as open.

## ADR-006: BST starts from a seed tree

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** An empty tree gives a student nothing to search or delete when the page loads.

**Decision.** The BST initial state is the fixed seed tree `50 30 70 20 40 60 80`. Reset returns to it.

**Consequences.** The page is ready for a demonstration on load, and the BST tests start from the same tree.

## ADR-007: Two-column topic page

**Date:** 2026-09-13. **Status:** Superseded by ADR-011 (the sticky column; the two columns and the tabs remain).

**Context.** The spec's original page stacked usage, then the visualizer, then the core material.

**Decision.** The visualizer sits on the left in a sticky column and the materials sit on the right in tabs. `main` is capped at `max-w-screen-2xl` to give the split room.

**Consequences.** SPEC §6 was amended to match.

## ADR-008: Code panel wraps lines and offers three languages

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** Long pseudocode lines clipped, and the panel showed pseudocode only.

**Decision.** Lines soft-wrap with a hanging indent and never scroll sideways. Every operation ships C++, Java (algs4 style), and Python, and the highlight stays in sync across tabs.

**Consequences.** SPEC §7, §8, the §10 intro, §14, and §16 were amended. `src/topics/snippets.test.ts` fails when an emitted `highlightLine` has no mapped line in one of the languages.

## ADR-009: Heap, hash table, and graph visualizers

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** Only the BST was implemented; SPEC §10.2 to §10.4 lacked the detail to implement the other three without inventing behavior.

**Decision.** Implement heap, hash table, and graph against SPEC §10.2 to §10.4, and extend the spec first: `variants`, `createInitialState(variant)`, the hash and graph step tables, `PROBE_DELETE`, `Add edge`, integer vertices, and cycle handling for topological sort.

**Consequences.** `PlaceholderCanvas` was removed.

## ADR-010: antislop is mandatory for all copy

**Date:** 2026-09-13. **Status:** Accepted.

**Context.** The project had no binding standard for its text.

**Decision.** SPEC §18 makes the antislop rule set binding on every piece of text, applied in DURING mode.

**Consequences.** The existing copy was audited (`anti-slop/audit-001-2026-09-13.md`). `npm run lint:copy` runs inside `lint` and in CI. The references were scrubbed for punctuation only and `content.ts` regenerated.

## ADR-011: Viewport-locked topic page

**Date:** 2026-09-14. **Status:** Accepted.

**Context.** With the sticky column from ADR-007, the document still scrolled at `lg`.

**Decision.** At `lg` the page never scrolls; only the Code listing and the materials panel do, and Operation, Playback, and Code size to their content.

**Consequences.** SPEC §3, §4, §6, §8, §12, and §16 were amended. Playwright tests the layout contract (`e2e/`, `npm run test:e2e`) and runs in CI before the image build.

## ADR-012: Structure view

**Date:** 2026-09-14. **Status:** Accepted.

**Context.** The visualizer showed operations but not the data structure's interface, costs, or fields.

**Decision.** Every topic declares `structure` (SPEC §7 `StructureSpec`): the ADT operations with costs quoted from the references, the invariants, and one language-neutral declaration per representation, shown in a third materials tab. A live instance-fields row sits under the canvas. This was chosen over per-language declarations, which triple the authoring, and over a fifth Code tab, which would crowd the listing.

**Consequences.** Analysis of Algorithms and Sorting have an entry with an empty operation table rather than an invented one. `src/topics/structure.test.ts` checks every module.

## ADR-013: Case studies with a quiz

**Date:** 2026-09-14. **Status:** Accepted.

**Context.** Each topic page teaches one structure, but no page showed a problem that needs several of them.

**Decision.** Three case studies, one per block of the semester, each with a simulator that runs a chosen design against a naive one, a Reasoning tab, and an 8-question quiz (6 multiple choice, 2 predict-the-next-step).

**Consequences.** SPEC §2 allows a quiz on case study pages only, with scores kept in memory. SPEC §19 holds the step tables. The empty text-input error became generic ("The field is empty. Type a value, then press Go.") because course codes also use `inputKind: 'text'`.
