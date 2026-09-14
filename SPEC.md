# DSA Interactive Explorer: Technical Specification (v1)

**Course:** Algoritma dan Struktur Data (1519630013), Universitas Negeri Jakarta
**Author:** Muhammad Ridho Kurniawan Pratama
**Scope:** v1 covered Binary Search Tree, Binary Heap, Hash Table, Graph (Weeks 9 to 15); the 2026-09-13 expansion adds Weeks 1 to 7 and B-Tree, so every RPS week has a topic
**Reference:** Sedgewick, R. & Wayne, K., *Algorithms, 4th Edition* (https://algs4.cs.princeton.edu)
**Style reference:** visualgo.net, contextualized to this course's RPS

### How to use this document

This spec is written for two readers at once. A human reader can read top to bottom for the shape of the product. An AI coding agent implementing this should treat Sections 6–10 as authoritative contracts: type shapes, file paths, and step tables are specified precisely enough to implement without needing to invent behavior. Where a decision is genuinely open, it's marked **[OPEN]** rather than left ambiguous.

---

## 1. Overview

An in-browser, single-page app that lets students interactively build and operate on the data structures and algorithms covered in Weeks 1–15 of the course, watching each operation animate step by step: a VisualGO-style tool, scoped to exactly what this RPS teaches, with the visualization paired against the real-world usage and core material content already written for the course.

## 2. Goals and Non-Goals

**Goals**
- Step-by-step animated visualization of BST, Binary Heap, Hash Table, and Graph operations, with synced pseudocode highlighting.
- Custom and randomized input for every structure.
- A architecture that lets future topics (queue, stack, sorting, linked list, B-tree, the rest of the RPS) be added as self-contained modules without touching existing code.

**Non-Goals (v1)**
- No backend, no persistence, no user accounts. Everything is client-side, in-memory, reset on page reload.
- No quiz/scoring/practice-mode features on topic pages. This is a visualization tool, not an assessment tool. The one exception is the short trivia quiz at the end of each case study (Section 19), scored in memory and reset on reload.
- No BST rank/select/floor/ceiling, no heap index-priority-queue. Both are deferred past v1 (see Section 14).

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + React Router v7 (SPA/client-only mode: no SSR, no loaders that hit a server) |
| Build tool | Vite |
| Styling | Tailwind CSS v4 (CSS-first config, theme provided in Section 5) |
| Components | shadcn/ui (Sidebar, Button, Slider, Tabs, Select, Input, Badge, Card) |
| Animation | Framer Motion (`motion/react`) for snapshot-to-snapshot transitions. **[OPEN]**: confirm acceptable, else fall back to CSS transitions |
| Graph layout | `d3-force` only (not full d3) |
| Tests | Vitest for the Section 10 step tables (`src/**/*.test.ts`); Playwright (Chromium) for the topic page layout in Section 12 (`e2e/`) |
| Language | TypeScript throughout |

## 4. Repository Structure

```
dsa-explorer/
├── src/
│   ├── main.tsx
│   ├── app-router.tsx
│   ├── index.css                     # theme from Section 5, verbatim
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx        # topic nav, grouped by week range
│   │   │   └── AppLayout.tsx
│   │   ├── visualizer/
│   │   │   ├── VisualizerShell.tsx   # composes OperationBar + Canvas + CodePanel + PlaybackControls
│   │   │   ├── OperationBar.tsx      # operation select, key input, Go/Randomize/Reset
│   │   │   ├── PlaybackControls.tsx  # play/pause/step/speed/scrub
│   │   │   ├── CodePanel.tsx         # pseudocode with highlighted line
│   │   │   └── LiveFields.tsx        # the structure's instance fields for the snapshot on the canvas
│   │   ├── StructurePanel.tsx        # the Structure tab: ADT table, invariants, representations
│   │   └── ui/                       # shadcn generated components
│   ├── topics/
│   │   ├── registry.ts               # TopicModule[], single source of truth for nav + routes
│   │   ├── bst/
│   │   │   ├── index.ts              # exports the TopicModule
│   │   │   ├── operations.ts         # insert, search, delete, traverse
│   │   │   ├── canvas.tsx            # TreeCanvas
│   │   │   ├── pseudocode.ts
│   │   │   ├── snippets.ts           # C++ / Java / Python per operation, mapped to pseudocode lines
│   │   │   ├── structure.ts          # ADT, representations, live fields (Section 7 `structure`)
│   │   │   └── content.ts            # real-world usage + core material text
│   │   ├── binary-heap/  (same shape)
│   │   ├── hash-table/   (same shape)
│   │   └── graph/        (same shape)
│   ├── lib/
│   │   ├── step-engine.ts            # usePlayback() hook, see Section 9
│   │   └── layout/
│   │       ├── tree-layout.ts        # shared by bst + binary-heap
│   │       └── graph-layout.ts       # wraps d3-force
│   ├── pages/
│   │   ├── HomePage.tsx              # landing / topic index
│   │   └── TopicPage.tsx             # generic page, driven by TopicModule
│   └── types/
│       └── step-engine.ts            # Step<T>, OperationResult<T>, TopicModule
├── e2e/
│   └── topic-page-layout.spec.ts     # Playwright: the Section 12 layout contract at lg, md, and phone widths
├── public/
├── index.html
├── vite.config.ts
├── playwright.config.ts
├── package.json
├── Dockerfile
└── .github/workflows/deploy.yml
```

## 5. Theming

Drop the provided `index.css` in verbatim (it's already Tailwind v4 CSS-first syntax with `@theme inline`). Load `DM Sans` and `Space Mono` from Google Fonts (or self-host) in `index.html`; the CSS references them as `--font-sans` / `--font-mono` but does not load them itself. Respect the existing `.dark` class toggle for dark mode; shadcn components should be installed with the "new-york" style to match the given `--radius: 1rem`.

## 6. Routing

Topic-slug routes are canonical. Week is metadata shown in the sidebar and on the topic page header, not part of the URL.

| Path | Renders |
|---|---|
| `/` | `HomePage`, topic index grouped by week range |
| `/topic/complexity` | `TopicPage` for Analysis of Algorithms (Week 1) |
| `/topic/arrays` | `TopicPage` for Arrays and Data Representation (Week 2) |
| `/topic/queue` | `TopicPage` for Queue (Week 3) |
| `/topic/stack` | `TopicPage` for Stack (Week 4) |
| `/topic/sorting` | `TopicPage` for Sorting (Week 5) |
| `/topic/linked-list` | `TopicPage` for Linked List (Week 6) |
| `/topic/searching` | `TopicPage` for Searching (Week 7) |
| `/topic/bst` | `TopicPage` for Binary Search Tree (Week 9) |
| `/topic/b-tree` | `TopicPage` for B-Tree (Week 10) |
| `/topic/binary-heap` | `TopicPage` for Binary Heap (Week 11) |
| `/topic/hash-table` | `TopicPage` for Hash Table (Week 12) |
| `/topic/graph` | `TopicPage` for Graph (Weeks 13–15) |
| `/case-study/canteen-orders` | `CaseStudyPage` for the canteen order counter (Weeks 1–7), Section 19.3 |
| `/case-study/er-triage` | `CaseStudyPage` for the ER triage desk (Weeks 9–11), Section 19.2 |
| `/case-study/study-plan` | `CaseStudyPage` for the study plan builder (Weeks 12–15), Section 19.1 |

`TopicPage` is generic: it looks up the current topic from `registry.ts` by the `:slug` param and renders a two-column layout on desktop: `VisualizerShell` in the left column and the course materials in the right column as tabs, `content.realWorldUsage` (default) | `content.coreMaterial` | Structure (`StructurePanel` over `structure`, marking the representation on the canvas). The page mirrors the shell's variant through `onVariantChange` so the Structure tab follows the Operation card's toggle. At `lg` and up the page is locked to the viewport: the document never scrolls, and only two regions do, the Code listing inside the visualizer and the active materials panel. The title, canvas, Operation, Playback, and both tab strips stay where they are while a student reads or steps. If the viewport is too short for the canvas plus Operation plus Playback, the visualizer column scrolls as a fallback. Below `lg` the columns stack, visualizer first, and the document scrolls normally. CPMK is deliberately omitted; refer students to the RPS for that.

## 7. Core Domain Types

```ts
// types/step-engine.ts

export interface Step<TSnapshot> {
  id: number;
  description: string;              // human-readable narration of this step
  highlightLine: number;            // 1-indexed line number in the operation's pseudocode
  snapshot: TSnapshot;              // full structure state AFTER this step is applied
  variables?: Record<string, string | number>; // e.g. { comparing: "12 vs 7" }
}

export interface OperationResult<TSnapshot> {
  steps: Step<TSnapshot>[];
  finalSnapshot: TSnapshot;
}

export type OperationFn<TState, TInput, TSnapshot> = (
  state: TState,
  input: TInput
) => OperationResult<TSnapshot>;

export interface OperationDefinition<TState = unknown, TInput = unknown, TSnapshot = unknown> {
  id: string;                       // e.g. "insert"
  label: string;                    // e.g. "Insert"
  inputKind: "key" | "edge" | "array" | "none" | "text";
  placeholder?: string;             // overrides the placeholder OperationBar shows for this inputKind
  variants?: string[];              // variant values this operation applies to; absent means all
  run: OperationFn<TState, TInput, TSnapshot>;
}

export interface VariantConfig {
  id: string;                       // e.g. "collision-strategy"
  label: string;                    // e.g. "Collision Strategy"
  options: { value: string; label: string }[];
  default: string;
}

export type SnippetLanguage = "cpp" | "java" | "python";

export interface SnippetLine {
  text: string;
  pseudo?: number;                  // 1-indexed pseudocode line this code line implements
}

export type OperationSnippets = Record<SnippetLanguage, SnippetLine[]>;

export interface AdtOperation {
  name: string;                     // e.g. "push"
  signature: string;                // e.g. "push(item)"
  cost: string | Record<string, string>; // one cost, or one per representation key
  note?: string;                    // one sentence, house style (Section 18)
  operationIds?: string[];          // visualizer operations that demonstrate it (one per variant when scoped)
}

export interface StructureField {
  name: string;                     // e.g. "first"
  type: string;                     // e.g. "Node"
  role: string;                     // e.g. "top of the stack, null when empty"
}

export interface Representation {
  label: string;                    // e.g. "Resizing array"
  declaration: string[];            // language-neutral pseudo-declaration, one line each
  fields: StructureField[];
  invariants?: string[];            // invariants this representation adds to the ADT's
}

export interface StructureSpec<TSnapshot = unknown> {
  adt: {
    name: string;                   // e.g. "Stack"
    summary: string;                // one sentence; for algorithm topics it says there is no ADT to call
    operations: AdtOperation[];     // empty for algorithm topics
    invariants: string[];
  };
  representations: Record<string, Representation>; // key = variant value, or "default" alone when every variant shares one
  algorithms?: string[];            // operation ids that run an algorithm over the structure rather than an ADT operation
  liveFields: (snapshot: TSnapshot, variant?: string) => Record<string, string | number>; // scalars only, at most six
}

export interface TopicModule<TState = unknown, TSnapshot = unknown> {
  slug: string;
  title: string;
  weekLabel: string;                // e.g. "Week 9" or "Weeks 10–11"
  operations: OperationDefinition<TState, unknown, TSnapshot>[];
  pseudocode: Record<string, string[]>;  // operationId -> lines of pseudocode
  snippets: Record<string, OperationSnippets>; // operationId -> C++ / Java / Python with a pseudocode line map
  CanvasComponent: React.ComponentType<{ snapshot: TSnapshot; variant?: string }>;
  content: { realWorldUsage: string; coreMaterial: string };
  structure: StructureSpec<TSnapshot>; // ADT, representations, live instance fields (Section 8)
  variant?: VariantConfig;
  createInitialState: (variant?: string) => TState; // Reset uses the active variant
  randomize: (state: TState, variant?: string) => TState; // instant, no animation
}
```

`registry.ts` exports `const topics: TopicModule[]`, which drives both `AppSidebar` and `TopicPage`'s lookup. `VisualizerShell` shows only the operations whose `variants` include the active variant (or that declare none), and re-selects the first visible operation when the variant changes. **Adding a new topic later means adding one entry here, with no other file changes.**

`structure` describes the data structure itself, beside the operations that animate it. `adt` is the abstract interface: each operation's signature, its cost (one string, or one per representation when the cost differs by variant), and the invariants every representation keeps. `representations` holds one entry per variant value (or `default` alone when every variant shares one representation, as the complexity topic's problem choice does) with a language-neutral declaration of the class and its node type, the fields, and the invariants that representation adds. `operationIds` links an ADT operation to the visualizer operations that demonstrate it; `algorithms` lists the operations that are algorithms over the structure rather than part of its interface (traversals, sorts, the two-stack evaluator). Every operation id of the module appears in exactly one of the two. `liveFields` reads the snapshot being shown and returns the instance fields as scalars (`n`, `first`, `root`, `M`), at most six, so the row under the canvas tracks every step. Costs quote the week reference (an `O(...)` form or the reference's own statement with its Property or Proposition name); a number the reference does not state is not shown.

## 8. Shared UI Components

- **`AppSidebar`**: lists `topics` from the registry, grouped by week range, each item showing title + `weekLabel` badge. Built on shadcn `Sidebar`.
- **`VisualizerShell`**: the reusable "app" per topic: owns the persistent `TState`, the `usePlayback` instance for the most recently triggered operation's steps, and composes `OperationBar`, the topic's `CanvasComponent` (with `LiveFields` under it in the same card), `CodePanel`, and `PlaybackControls`. It reports a variant change to its parent through `onVariantChange` and still owns the variant and its resets. From `md` up it is a two-column grid: the canvas spans both columns, Operation and Playback stack in the left column at their own content height (never stretched to match Code), and Code fills the right column beside them. At `md` a short Code card stretches down to the bottom of Playback; at `lg` the Code card sizes to its listing and is capped at the column height, so its listing scrolls only past that point.
- **`OperationBar`**: operation `Select` (from `operations`), an `Input` sized to `inputKind` (`text` is a free-form field, used by Stack's Evaluate expression; an operation's `placeholder` overrides the per-kind default), a "Go" `Button`, a "Randomize" `Button`, a "Reset" `Button`, and (when `variant` is defined) a `Tabs` or `Select` bound to it.
- **`CodePanel`**: shows `currentStep.description` (and `variables` as badges) above a numbered code block with a tab strip: **Pseudocode | C++ | Java | Python**. The Pseudocode tab renders `pseudocode[currentOperationId]` and highlights the line equal to `currentStep.highlightLine`; a language tab renders `snippets[currentOperationId][language]` and highlights every line whose `pseudo` equals it, so the highlight stays in sync in every tab. The chosen tab is remembered in `localStorage` (`dsa-explorer-code-lang`) across topics and reloads; the default is Pseudocode. **Lines never clip**: each line soft-wraps with a hanging indent (the line starts at its own indent, wrapped continuations sit two columns deeper), and the block has no horizontal scrolling at any width. At `lg` the listing is the only part of the panel that scrolls (the description and the tab strip stay put); it is keyboard focusable with a visible ring, and stepping keeps the highlighted line inside it by scrolling the listing itself, never the page.
- **`PlaybackControls`**: play/pause toggle, step-back, step-forward, a `Slider` bound to `currentStepIndex` for scrubbing, and a speed `Slider` (ms-per-step).
- **`LiveFields`**: one chip per entry of `structure.liveFields(snapshot, variant)` for the snapshot the canvas shows, in the badge style of `CodePanel`'s step variables, prefixed with the active representation's label. The chips sit in a grid whose column count depends on the width alone (fixed tracks), so the row keeps its height while values change and stepping never moves the page; every chip's `key = value` text fits one track (`src/topics/structure.test.ts` caps it at 14 characters).
- **`FocusCaption`, `DecisionList`, `QuizPanel`** (`src/components/case-study/`, Section 19): the view switch above a case study canvas, one button per part of the snapshot; the Reasoning tab's chosen and rejected structures per requirement; and the quiz. `FocusCaption` and `QuizPanel` set `data-shell-keys="off"`, and `VisualizerShell`'s keyboard listener ignores events from inside such a region, so Space and the arrow keys act on the quiz's own controls.
- **`StructurePanel`**: the Structure tab. The ADT name and summary, a table of the ADT operations (signature, note, "Shown by {operation label}" for the visible demonstrating operation, and the cost resolved for the active representation), the ADT invariants, then one block per representation in declared order: label, an "on the canvas" badge on the active one (or a cue naming the variant toggle on the others), the declaration with `CodePanel`'s hanging indent, the fields table, and the representation's own invariants. A closing list names the operations in `algorithms`. Structured JSX, because `MarkdownContent` renders no tables.

## 9. Step Engine: Playback Semantics

```ts
// lib/step-engine.ts
function usePlayback<T>(steps: Step<T>[]) {
  // returns:
  // currentStepIndex: number
  // currentStep: Step<T> | null
  // isPlaying: boolean
  // speedMs: number
  // play(): void          // advances currentStepIndex on an interval of speedMs
  // pause(): void
  // stepForward(): void
  // stepBackward(): void
  // seek(index: number): void   // for the scrub slider
  // setSpeedMs(ms: number): void
  // reset(): void          // currentStepIndex = 0, isPlaying = false
}
```

Rules:
- `steps` is always precomputed in full before playback starts (an operation's `run()` returns the entire array up front). This is what makes scrubbing and step-backward trivial: there's no partial-execution state to reconstruct, just an index into an array of already-known snapshots.
- Triggering a new operation (Go) replaces `steps`, calls `reset()`, and starts playing immediately; the student can pause, scrub, or step at any time. A one-step result just shows that step.
- "Randomize" and "Reset" (in `OperationBar`) bypass the step engine entirely: they mutate `TState` directly and clear `steps` to `[]`, since they aren't meant to be scrubbed.

## 10. Per-Topic Specifications

Each subsection gives: the snapshot shape, the canvas layout rule, and pseudocode + a step table per operation. The step table is the contract for `run()`: implement `run()` so it emits exactly these steps, in this order, for these trigger conditions.

Every operation also ships a C++, Java, and Python implementation in the topic's `snippets.ts`, each line optionally mapped to the pseudocode line it implements (`SnippetLine.pseudo`). Java follows the algs4 shape (Sedgewick & Wayne: `less`/`exch`, `swim`/`sink`, `marked[]`/`edgeTo[]`, and so on); C++ and Python are direct translations, not idiomatic rewrites, so a student can read the three side by side. Contract: every pseudocode line a step can highlight must have at least one mapped line in each language; `src/topics/snippets.test.ts` runs every operation on its seed state and checks this. Comments inside snippets are prose and fall under Section 18.

Every topic also ships a `structure.ts` (Section 7 `structure`): the ADT operations with signatures in the Java snippet's shape, costs quoted from the week reference, invariants, and one declaration per representation naming the class and node fields the snippets use. Algorithm topics (Sections 10.5 and 10.9) leave the operation table empty and say so in the summary. The B-tree entry follows Section 10.12 (a node holds up to `M` entries and splits at `M`), not the reference's `M - 1` phrasing. `src/topics/structure.test.ts` checks every module: one representation per variant value (or `default` alone), every operation id covered exactly once by `operationIds` or `algorithms`, scalar live fields on the seed and on every step of every seed operation, and the Section 18 floor on every string.

### 10.1 Binary Search Tree, `/topic/bst`

**State & snapshot**

```ts
interface BSTNode { id: string; key: number; left: string | null; right: string | null; }
interface BSTSnapshot {
  nodes: Record<string, BSTNode & { x: number; y: number; highlight?: "current" | "new" | "found" | "delete-target" }>;
  rootId: string | null;
}
type BSTState = BSTSnapshot; // the tree persists as-is between operations
```

**Canvas layout:** classic tree layout: depth-first in-order traversal assigns each node an increasing `x` index × horizontal spacing constant; `y = depth × vertical spacing`. Recompute on every snapshot (cheap for the tree sizes a course demo needs, ~≤ 30 nodes).

**Operation: Insert**

```
1  INSERT(root, key):
2    if root is EMPTY:
3      return NEW_NODE(key)
4    if key < root.key:
5      root.left = INSERT(root.left, key)
6    else if key > root.key:
7      root.right = INSERT(root.right, key)
8    return root
```

| Trigger | Line | Description template | Snapshot delta |
|---|---|---|---|
| Descend, key < current | 4 | "`{key}` < `{node.key}`, so go left." | current node `highlight: "current"` |
| Descend, key > current | 6 | "`{key}` > `{node.key}`, so go right." | current node `highlight: "current"` |
| Reach a null link | 2–3 | "Empty spot found. Inserting `{key}` here." | new node added, `highlight: "new"` |
| Key already present | 4/6 fails both | "`{key}` already exists. A BST does not store duplicate keys." | matching node `highlight: "found"`, stop |

**Operation: Search**

```
1  SEARCH(root, key):
2    if root is EMPTY: return MISS
3    if key == root.key: return HIT
4    if key < root.key: return SEARCH(root.left, key)
5    else: return SEARCH(root.right, key)
```

Step table follows the same descend pattern as Insert (lines 4–5), ending in either a `"found"`-highlighted hit at line 3 (*"`{key}` matches this node: HIT."*) or a miss narration at line 2 (*"Reached an empty link: MISS. `{key}` is not in the tree."*).

**Operation: Delete (Hibbard deletion)**

```
1  DELETE(root, key):
2    if root is EMPTY: return EMPTY
3    if key < root.key: root.left = DELETE(root.left, key)
4    else if key > root.key: root.right = DELETE(root.right, key)
5    else:
6      if root.right is EMPTY: return root.left
7      if root.left is EMPTY: return root.right
8      successor = MIN(root.right)
9      successor.right = DELETE_MIN(root.right)
10     successor.left = root.left
11     root = successor
12   return root
```

| Trigger | Line | Description |
|---|---|---|
| Descend | 3/4 | same pattern as Insert/Search |
| Node found, target `highlight: "delete-target"` | 5 | "Found `{key}`. This node has {0/1/2} children." |
| 0 or 1 child | 6/7 | "The node has at most one child, so splice it out directly." |
| 2 children | 8–11 | "Two children: replacing `{key}` with its in-order successor `{successor.key}`." |

**Operation: Inorder Traversal**

```
1  INORDER(node):
2    if node is EMPTY: return
3    INORDER(node.left)
4    VISIT(node)
5    INORDER(node.right)
```

| Trigger | Line | Description template | Snapshot delta |
|---|---|---|---|
| Enter a node | 3 | "Go left from `{key}` before visiting it." | node `highlight: "current"` |
| Empty left or right link | 2 | "The {left/right} link of `{key}` is empty, so return." | that node `highlight: "current"` |
| Visit | 4 | "Visit `{key}`. Visited so far: `{list}`." | node `highlight: "found"` |
| Leave for the right subtree | 5 | "Go right from `{key}`." | node `highlight: "current"` |
| Empty tree | 2 | "The tree is empty, so there is nothing to visit." | none |

Each node emits, in order: line 3, its left subtree (or a line-2 step for an empty left link), line 4, line 5, its right subtree (or a line-2 step for an empty right link). The seed tree gives 29 steps. `variables.visited` carries the running list on every step once it is non-empty.

### 10.2 Binary Heap, `/topic/binary-heap`

**Variant:** `mode: "max" | "min"` (default `"max"`). All comparisons below are written for max-heap; a min-heap flips every `<`/`>`.

**State & snapshot**

```ts
interface HeapSnapshot {
  array: number[];              // 1-indexed conceptually; array[0] unused
  n: number;                    // logical size (may be < array.length during sink/sortdown)
  highlight?: { indices: number[]; kind: "comparing" | "swapping" | "sorted" };
  mode: "max" | "min";
}
type HeapState = HeapSnapshot;
```

**Canvas layout:** render both the tree view (position `k`'s children at `2k`, `2k+1`, same tree-layout utility as BST) **and** the underlying array as a row of indexed boxes beneath it. This dual view is what makes the array-as-tree representation legible to students.

**Operation: Insert**

```
1  INSERT(value):
2    n = n + 1
3    array[n] = value
4    SWIM(n)
5  SWIM(k):
6    while k > 1 and array[k/2] < array[k]:
7      SWAP(k, k/2)
8      k = k/2
```

| Trigger | Line | Description |
|---|---|---|
| Append | 3 | "Placing `{value}` at the end of the heap (index `{n}`)." |
| Compare with parent | 6 | "Comparing `{array[k]}` with its parent `{array[k/2]}`." |
| Swap needed | 7 | "`{array[k]}` is larger than its parent, so it swims up." |
| Stop | 6 fails | "Heap order restored." |

**Operation: Remove-max (or Remove-min)**

```
1  REMOVE_EXTREME():
2    extreme = array[1]
3    SWAP(1, n)
4    n = n - 1
5    SINK(1)
6    return extreme
7  SINK(k):
8    while 2k <= n:
9      j = 2k
10     if j < n and array[j] < array[j+1]: j = j + 1
11     if array[k] >= array[j]: break
12     SWAP(k, j)
13     k = j
```

| Trigger | Line | Description |
|---|---|---|
| Take root | 2 | "Removing `{extreme}` from the root. Moving the last element `{array[n]}` to the top." (snapshot after the swap; `n` already decremented, so index `n+1` renders outside the heap) |
| Pick larger child | 10 | "Comparing the children at `{j}` and `{j+1}`." (single child: "Only one child, at `{j}`.") |
| Swap | 12 | "`{array[k]}` is smaller than its child `{array[j]}`, so it sinks down." |
| Stop | 11 | "Heap order restored." |

The final snapshot truncates the array to `n`. The operation is listed as **Remove max** in max mode and **Remove min** in min mode (two `OperationDefinition`s with `variants`, one implementation). In min mode every comparison flips and so does every narration word: `larger` becomes `smaller`, and the swim/sink sentences read "`{array[k]}` is smaller than its parent, so it swims up." and "`{array[k]}` is larger than its child `{array[j]}`, so it sinks down."

**Operation: Build-heap (from a custom/random array)**

```
1  BUILD_HEAP(a):
2    array = a; n = length(a)
3    for k = n/2 downto 1:
4      SINK(k)
5  SINK(k):
6    while 2k <= n:
7      j = 2k
8      if j < n and array[j] < array[j+1]: j = j + 1
9      if array[k] >= array[j]: break
10     SWAP(k, j)
11     k = j
```

| Trigger | Line | Description |
|---|---|---|
| Start | 2 | "Building a heap from `{list}`." |
| Each `k` | 4 | "Sinking index `{k}`." |
| SINK steps | 8, 10, 9 | the Remove-max sink table, renumbered to this listing |

Each iteration of line 3–4 emits the full SINK step sequence for that `k`, so the student watches the classic right-to-left heapify sweep. The SINK listing is repeated here so those sub-steps highlight real lines.

**Operation: Heapsort**

```
1  HEAPSORT(a):
2    BUILD_HEAP(a)
3    while n > 1:
4      SWAP(1, n)
5      n = n - 1
6      SINK(1)
7  SINK(k):
8    while 2k <= n:
9      j = 2k
10     if j < n and array[j] < array[j+1]: j = j + 1
11     if array[k] >= array[j]: break
12     SWAP(k, j)
13     k = j
```

| Trigger | Line | Description |
|---|---|---|
| Build | 2 | the Build-heap step sequence, all highlighted on line 2 |
| Swap root out | 4 | "Swapping the root `{array[1]}` with index `{n}`." `highlight.kind: "swapping"` |
| Shrink | 5 | "`{array[n]}` is in its final position." `highlight.kind: "sorted"` on index `n` (before the decrement) |
| SINK steps | 10, 12, 11 | the Remove-max sink table, renumbered to this listing |
| Done | 3 | "Every element is in place. The array is sorted." |

Indices above `n` are rendered muted and are excluded from further sink comparisons. Heapsort runs on the current heap array (no input); Build-heap takes a custom array.

### 10.3 Hash Table, `/topic/hash-table`

**Variant:** `strategy: "chaining" | "probing"` (default `"chaining"`). Table size `M` is fixed at a small prime (e.g. 11) for legible visualization. **[OPEN]**: confirm M should be fixed rather than student-configurable.

**State & snapshot**

```ts
interface ChainingSnapshot { strategy: "chaining"; buckets: number[][]; M: number; highlight?: { bucket: number; index?: number }; }
interface ProbingSnapshot  { strategy: "probing";  slots: (number | null)[]; M: number; highlight?: { index: number; kind: "probing" | "found" | "empty" }; }
type HashTableSnapshot = ChainingSnapshot | ProbingSnapshot;
type HashTableState = HashTableSnapshot;
```

**Canvas layout:** `strategy` selects between two entirely separate canvas components: `ChainingCanvas` (M horizontal rows, each a linked list of key boxes) and `ProbingCanvas` (a single row of M boxes, empty vs. occupied). Switching the variant resets the structure (the two representations aren't meant to hold the same live data simultaneously).

**Hash function (shared):** `HASH(key) = key mod M`.

**Operations: Chaining**

```
1  CHAIN_INSERT(key):
2    i = HASH(key)
3    if key not in bucket[i]: append key to bucket[i]

4  CHAIN_SEARCH(key):
5    i = HASH(key)
6    return key in bucket[i]

7  CHAIN_DELETE(key):
8    i = HASH(key)
9    remove key from bucket[i] if present
```

Operation ids are `chain-insert`, `chain-search`, `chain-delete` (`variants: ["chaining"]`), labeled Insert, Search, Delete.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Hash (every op) | 2 / 5 / 8 | "`{key}` mod `{M}` = `{i}`, so use bucket `{i}`." | `{ bucket: i }` |
| Compare with a node (every op) | 3 / 6 / 9 | "Comparing `{key}` with `{node}` in bucket `{i}`." | `{ bucket: i, index }` |
| Insert, key absent | 3 | "Appending `{key}` to bucket `{i}`." | new index |
| Insert, key present | 3 | "`{key}` is already in bucket `{i}`, so nothing changes." | matching index |
| Search hit | 6 | "Found `{key}` in bucket `{i}`." | matching index |
| Search miss | 6 | "Reached the end of bucket `{i}`. `{key}` is not in the table." | `{ bucket: i }` |
| Delete, present | 9 | "Removing `{key}` from bucket `{i}`." | `{ bucket: i }` (after removal) |
| Delete, absent | 9 | the search-miss sentence | `{ bucket: i }` |

**Operations: Linear Probing**

```
1  PROBE_INSERT(key):
2    i = HASH(key)
3    while slot[i] is occupied and slot[i] != key:
4      i = (i + 1) mod M
5    slot[i] = key

6  PROBE_SEARCH(key):
7    i = HASH(key)
8    while slot[i] is occupied:
9      if slot[i] == key: return HIT
10     i = (i + 1) mod M
11   return MISS

12 PROBE_DELETE(key):
13   i = HASH(key); probe until slot[i] == key or slot[i] is empty
14   if slot[i] is empty: return MISS
15   slot[i] = EMPTY
16   for each key in the cluster after i: remove it and PROBE_INSERT it again
```

Operation ids are `probe-insert`, `probe-search`, `probe-delete` (`variants: ["probing"]`), labeled Insert, Search, Delete. The three listings above are one block so line numbers are unique.

| Trigger | Line | Description | Highlight kind |
|---|---|---|---|
| Hash (every op) | 2 / 7 / 13 | "`{key}` mod `{M}` = `{i}`, so start at slot `{i}`." | `probing` |
| Probe past an occupied slot | 3 / 8 / 13 | "Slot `{i}` is occupied by `{slot[i]}`. Probe the next slot." | `probing` |
| Insert, empty slot | 5 | "Slot `{i}` is empty. Placing `{key}` here." | `found` |
| Insert, duplicate | 3 | "`{key}` is already in slot `{i}`." | `found` |
| Insert, table full | 3 | "Every slot is occupied, so `{key}` cannot be inserted." | none |
| Search hit | 9 | "Slot `{i}` holds `{key}`: HIT." | `found` |
| Search miss | 11 | "Slot `{i}` is empty: MISS. `{key}` is not in the table." | `empty` |
| Delete, absent | 14 | the search-miss sentence | `empty` |
| Delete, remove | 15 | "Removing `{key}` from slot `{i}`." | `empty` |
| Delete, rehash | 16 | "Reinserting `{v}` from slot `{j}` so later searches still find it." followed by that key's probe steps (lines 13, 5) | `probing`, `found` |

Deletion for open addressing is the classic "remove then rehash the cluster" approach: after removing the key, walk forward from that slot re-inserting every key found until an empty slot is reached, so search correctness is preserved.

### 10.4 Graph, `/topic/graph`

**Variant:** `directed: boolean` (default `false`). Directed mode adds Topological Sort and Strong Components to the operation list.

**State & snapshot**

```ts
interface GraphVertex { id: string; label: string; x: number; y: number; state?: "unvisited" | "frontier" | "visiting" | "visited"; component?: number; }
interface GraphEdge { from: string; to: string; state?: "default" | "active" | "tree"; }
interface GraphSnapshot { vertices: GraphVertex[]; edges: GraphEdge[]; directed: boolean; }
type GraphState = GraphSnapshot;
```

**Canvas layout:** positions come from `d3-force` (charge + link forces), computed once when the vertex/edge set changes and cached, not recomputed every animation frame. Directed edges render with an arrowhead marker; undirected without.

**Vertices** are integers `0..V-1` (the algs4 convention used in the course text), capped at 10, so a BFS or DFS source is a `key` input. Undirected edges are stored once with `from < to`.

**Operation: Add edge** (`inputKind: "edge"`, input `2-5`, all variants). One step: "Added edge `{v}` to `{w}`." (undirected: "Added edge between `{v}` and `{w}`."). Vertices that do not exist yet are created up to the cap, and the layout is recomputed. A duplicate edge narrates "Edge `{v}`-`{w}` already exists." and a self-loop "Self-loops are not used in this course." Both leave the graph unchanged. BFS and DFS on a missing source narrate "Vertex `{s}` does not exist." as their only step.

**Operation: BFS**

```
1  BFS(source):
2    mark source visited; enqueue source
3    while queue not empty:
4      v = dequeue()
5      for each w adjacent to v:
6        if w not visited:
7          mark w visited; edgeTo[w] = v
8          enqueue w
```

| Trigger | Line | Description |
|---|---|---|
| Start | 2 | "Starting BFS from `{source}`." vertex becomes `"frontier"` |
| Dequeue | 4 | "Processing `{v}`." vertex becomes `"visiting"` |
| Check neighbor | 5 | "Checking neighbor `{w}` of `{v}`." edge becomes `"active"` |
| Mark & enqueue | 7 | "`{w}` is new. Mark it visited and enqueue it." vertex becomes `"frontier"`, edge becomes `"tree"` |
| Already visited | 6 | "`{w}` is already visited." |
| Done with v | 4 | after its neighbors, `v` becomes `"visited"` (no extra step; applied on the next dequeue) |

`variables.queue` shows the queue contents on every step.

**Operation: DFS**

```
1  DFS(v):
2    mark v visited
3    for each w adjacent to v:
4      if w not visited:
5        edgeTo[w] = v
6        DFS(w)
```

| Trigger | Line | Description |
|---|---|---|
| Enter v | 2 | "Visiting `{v}`." vertex becomes `"visiting"` |
| Check neighbor | 3 | "Checking neighbor `{w}` of `{v}`." edge becomes `"active"` |
| Already visited | 4 | "`{w}` is already visited." |
| Recurse | 6 | "`{w}` is unvisited. Recursing into `{w}`." edge becomes `"tree"`, then the subtree's steps |
| Return | 3 | "Finished `{v}`." vertex becomes `"visited"` |

`variables.stack` shows the call stack on every step.

**Operation: Connected Components (undirected only)**

```
1  CONNECTED_COMPONENTS():
2    count = 0
3    for each vertex v:
4      if v not visited:
5        count = count + 1
6        DFS(v), assigning component = count to every reached vertex
```

Runs the DFS step sequence per component, tagging `vertex.component` and using a distinct highlight color per component index. Line 4 narrates each start: "`{v}` is unvisited, so it starts component `{count}`." The final step (line 3, after the loop) narrates "Found `{count}` connected components."

**Operation: Topological Sort (directed only)**

```
1  TOPOLOGICAL_SORT():
2    for each vertex v:
3      if v not visited:
4        DFS_POSTORDER(v)   // pushes v onto a stack after visiting all its descendants
5    return REVERSE(postorder stack)
```

Runs the DFS steps; each finish is a line-4 step: "Finished `{v}`. Pushing it onto the postorder stack." with `variables.postorder`. The final step (line 5) reveals the reversed order: *"Reverse postorder is a valid topological order: `{list}`."* If the DFS meets a back edge (a neighbor that is still on the call stack) it stops there: *"Edge `{v}` to `{w}` closes a cycle, so this digraph has no topological order."* Directed Randomize always produces a DAG; the directed seed graph contains a cycle so this case is reachable.

**Operation: Strong Components, Kosaraju–Sharir (directed only)**

```
1  KOSARAJU_SHARIR():
2    order = REVERSE_POSTORDER(REVERSE(G))
3    for each vertex v in order:
4      if v not visited:
5        DFS(v) in G, assigning the same component id to every reached vertex
```

Two-phase animation: first show the reverse-postorder computation on the reversed graph (dimmed/secondary), then the main DFS pass on the original graph assigning component colors. Phase 1 reuses the Topological Sort steps (all on line 2, with `variables.phase = "reversed graph"` so the canvas draws edges reversed and dimmed) and ends with "Reverse postorder of the reversed graph: `{list}`." Phase 2 narrates each start on line 5: "`{v}` starts strong component `{count}`." followed by DFS steps on the original graph, and ends with "Found `{count}` strong components."

### 10.5 Analysis of Algorithms, `/topic/complexity`

**Variant:** `problem: "1-sum" | "2-sum" | "3-sum"` (default `"3-sum"`, the cost-model example in the Week 1 reference).

**State & snapshot**

```ts
interface CountRow { n: number; accesses: number; ratio: number | null; }
interface ComplexitySnapshot {
  problem: "1-sum" | "2-sum" | "3-sum";
  startN: number;                   // first N of the doubling sequence
  rows: CountRow[];                 // sorted by n
  highlight?: number;               // index into rows
}
type ComplexityState = ComplexitySnapshot;
```

**Canvas layout:** an HTML table with columns N, array accesses, ratio, one row per `CountRow`, the highlighted row filled with the accent color. Under it a small SVG of ratio bars (one per row that has a ratio) with a dashed reference line at the expected limit: 2 for 1-sum, 4 for 2-sum, 8 for 3-sum. No chart library.

**Counting rule (shared):** the counts are exact for the brute-force loops, never measured. `1-sum` reads each of the N entries once, so `N` accesses. `2-sum` checks `N(N-1)/2` pairs with 2 accesses each. `3-sum` checks `N(N-1)(N-2)/6` triples with 3 accesses each (the `ThreeSum` client reads three entries per triple, which is the reference's "about N³/2"). N is floored at 1 and capped at 4096.

**Operations**

```
1  DOUBLING_RATIO(problem):
2    prev = 0
3    for N = start, 2 * start, 4 * start, ... (6 rounds):
4      accesses = ACCESSES(problem, N)
5      ratio = accesses / prev
6      prev = accesses
7  ACCESSES(problem, N):
8    1-sum: N items, 1 access each
9    2-sum: N(N-1)/2 pairs, 2 accesses each
10   3-sum: N(N-1)(N-2)/6 triples, 3 accesses each
```

Operation ids are `doubling-ratio` (Doubling ratio test, `inputKind: "none"`, six rounds from `startN`) and `count-accesses` (Count accesses for N, `inputKind: "key"`, one row inserted in `n` order with its ratio filled when a row for `n/2` exists). Both share the listing above.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Count (each round; also `count-accesses`) | 8 / 9 / 10 | "N = `{n}`: brute-force `{problem}` checks `{count}` `{items / pairs / triples}`, so it makes `{accesses}` array accesses." | the row; `variables.N`, `variables.accesses` |
| Ratio (rounds 2 to 6, and `count-accesses` when the `n/2` row exists) | 5 | "`{accesses}` / `{prev}` = `{ratio, 2 decimals}`, so doubling N multiplied the accesses by about `{ratio, 1 decimal}`." | the row; `variables.ratio` |
| Done (`doubling-ratio` only) | 3 | "The ratio settles toward `{2 / 4 / 8}`, so the order of growth of `{problem}` is `{N / N^2 / N^3}`." | none |
| N below 1 | 7 | "N = `{n}` is below 1, so there is nothing to count." | none |
| N above the cap | 7 | "N is capped at 4096 in this demo, so nothing changes." | none |

Seed: `startN = 8` with the rows for 8 to 256 precomputed silently, so the table is readable before the first Go. Randomize picks `startN` in 4 to 12 and recomputes the rows silently.

### 10.6 Arrays and Data Representation, `/topic/arrays`

**State & snapshot**

```ts
interface ArraysSnapshot {
  values: number[];                 // never null: Java default-initializes to 0
  highlight?: { indices: number[]; kind: "read" | "write" | "copy" | "error" };
  resizing?: { values: number[]; copied: number }; // the new array while a resize is in progress
}
type ArraysState = ArraysSnapshot;
```

**Canvas layout:** one indexed row of boxes (the shared `ArrayRow`), and a second row underneath while `resizing` is set, so the copy is visible element by element. Every step carries `variables: { length: N, bytes: 24 + 4N }`, the memory cost of `int[N]` from the Week 2 reference, rendered as badges. The array holds at most 16 slots.

**Operations**

```
1  CREATE(values):
2    a = new int[N]
3    for i = 0 to N - 1: a[i] = values[i]
```

```
1  ACCESS(i):
2    if i < 0 or i >= N: OUT_OF_BOUNDS
3    return a[i]
```

```
1  SET(i, v):
2    if i < 0 or i >= N: OUT_OF_BOUNDS
3    a[i] = v
```

```
1  RESIZE():
2    copy = new int[2 * N]
3    for i = 0 to N - 1: copy[i] = a[i]
4    a = copy
```

```
1  MEMORY(a):
2    header = 16 + 4 + 4 = 24 bytes
3    return 24 + 4 * N
```

Operation ids are `create` (Create from list, `inputKind: "array"`), `access` (Access a[i], `inputKind: "key"`, placeholder `Index, e.g. 2`), `set` (Set a[i] = v, `inputKind: "array"` with exactly two numbers, placeholder `index, value, e.g. 2, 7`), `resize` (Resize to double, `inputKind: "none"`), `memory` (Memory cost, `inputKind: "none"`).

| Operation | Line | Description | Highlight |
|---|---|---|---|
| create | 2 | "Creating an int array of length `{N}`: every slot starts at 0." | all slots 0, no highlight |
| create, over the cap | 2 | "This demo shows at most 16 slots, and `{N}` were entered, so nothing changes." | none |
| create | 3 | "Filling the slots from the list: `{list}`." | all `write` |
| access / set, bad index | 2 | "Index `{i}` is outside 0 to `{N-1}`, so the program stops with an out-of-bounds error." | all `error`, stop |
| access / set, good index | 2 | "Index `{i}` is inside 0 to `{N-1}`, so the access is safe." | `[i]` `read` |
| access | 3 | "a[`{i}`] holds `{v}`." | `[i]` `read` |
| set, wrong count | 1 | "Set needs two numbers, an index and a value, and `{k}` were entered, so nothing changes." (`was` for 1) | none |
| set | 3 | "Writing `{v}` into a[`{i}`], replacing `{old}`." | `[i]` `write` |
| resize | 2 | "Creating a new array of length `{2N}`: every slot starts at 0." | `resizing` row appears |
| resize, over the cap | 2 | "Doubling would need `{2N}` slots and this demo shows at most 16, so nothing changes." | none |
| resize, per element | 3 | "Copying a[`{i}`] = `{v}` into the new array." | `[i]` `copy` on both rows |
| resize | 4 | "The new array replaces the old one, so a has `{2N}` slots and the old array can be reclaimed." | `resizing` cleared |
| memory | 2 | "An int array carries a 24-byte header: 16 bytes of object overhead, 4 bytes for the length, and 4 bytes of padding." | none |
| memory | 3 | "The `{N}` ints take 4 bytes each, so int[`{N}`] costs 24 + 4 * `{N}` = `{bytes}` bytes." | all `read` |

Seed: `5, 3, 8, 1, 9, 2`. Randomize: 4 to 8 values in 0 to 99.

### 10.7 Queue, `/topic/queue`

**Variant:** `impl: "array" | "linked"` (default `"array"`), labeled Resizing array and Linked list. Switching the variant resets the structure.

**State & snapshot**

```ts
interface LinkedNode { id: string; value: number; next: string | null; }   // shared, lib/linked-nodes.ts
interface ArrayQueueSnapshot {
  impl: "array";
  slots: (number | null)[];         // q[], length is the capacity
  first: number; last: number; n: number;
  highlight?: { indices: number[]; kind: "write" | "read" | "copy" | "full" };
}
interface LinkedQueueSnapshot {
  impl: "linked";
  nodes: Record<string, LinkedNode>;
  firstId: string | null; lastId: string | null;
  nextId: number;                   // id counter, kept in the snapshot so run() stays pure
  highlight?: { ids: string[]; kind: "new" | "current" };
}
type QueueSnapshot = ArrayQueueSnapshot | LinkedQueueSnapshot;
type QueueState = QueueSnapshot;
```

Linked snapshots store real links rather than an ordered list, because "create the node, then link it" is the lesson: a step can show a node that exists but is not yet reachable. Node ids are `n{nextId}`; values are not unique, so the id is the stable key for animation.

**Canvas layout:** the array variant is the shared `ArrayRow` with `first` and `last` pointer labels under the index labels and dashed empty slots. The linked variant is the shared `LinkedRow`: node boxes left to right from `first`, an arrow glyph between linked nodes, a trailing `null` box, pointer labels `first` and `last` above the nodes, and any detached node drawn after a gap. Capacity is capped at 32 slots.

**Operations: Resizing array** (`ResizingArrayQueue`)

```
1  ENQUEUE(item):
2    if n == q.length: RESIZE(2 * q.length)
3    q[last] = item; last = last + 1
4    if last == q.length: last = 0
5    n = n + 1
6  DEQUEUE():
7    item = q[first]; q[first] = null; n = n - 1
8    first = first + 1
9    if first == q.length: first = 0
10   if n > 0 and n == q.length / 4: RESIZE(q.length / 2)
11   return item
12 RESIZE(capacity):
13   copy = new array[capacity]
14   for i = 0 to n - 1: copy[i] = q[(first + i) mod q.length]
15   q = copy; first = 0; last = n
```

Operation ids are `array-enqueue` (Enqueue, `inputKind: "key"`) and `array-dequeue` (Dequeue, `inputKind: "none"`), both `variants: ["array"]`, sharing the listing above.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Enqueue, array full | 2 | "The array is full (`{n}` of `{cap}`), so double it to `{2cap}`." | occupied slots `full` |
| Enqueue, room | 2 | "The array has room (`{n}` of `{cap}`), so no resize is needed." | none |
| Enqueue, at the 32-slot cap | 2 | "The array already has 32 slots, the most this demo shows, so `{item}` is not added." | none, stop |
| Copy (both resizes) | 14 | "Copying the `{n}` items into the new array in queue order, so first is 0 and last is `{n}`." | 0 to n-1 `copy`, snapshot already resized |
| Write | 3 | "Placing `{item}` at index `{last}`: the queue holds `{n+1}` items." | `[last]` `write`, `last` and `n` advanced |
| Wrap last | 4 | "last reached the end of the array, so it wraps to 0." | none |
| Dequeue, empty | 7 | "The queue is empty, so there is nothing to dequeue." | none, stop |
| Read | 7 | "Removing `{item}` from index `{first}`: the queue holds `{n-1}` items." | `[first]` `read`, slot null |
| Advance first | 8 | "first moves to `{first+1}`." | `[first+1]` `read` |
| Wrap first | 9 | "first reached the end of the array, so it wraps to 0." | `[0]` `read` |
| Halve | 10 | "The array is one-quarter full (`{n}` of `{cap}`), so halve it to `{cap/2}`." followed by the line-14 copy step | occupied slots `full` |
| Keep size | 10 | "`{n}` of `{cap}` slots are in use, so the array keeps its size." | none |

**Operations: Linked list**

```
1  ENQUEUE(item):
2    oldlast = last
3    last = NODE(item); last.next = null
4    if isEmpty(): first = last
5    else: oldlast.next = last
6    n = n + 1
7  DEQUEUE():
8    item = first.item
9    first = first.next
10   n = n - 1
11   if isEmpty(): last = null
12   return item
```

Operation ids are `linked-enqueue` and `linked-dequeue`, `variants: ["linked"]`, same labels.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Create | 3 | "Creating a node for `{item}`: last now points at it." | new node `new`, still detached |
| Was empty | 4 | "The queue was empty, so first also points at `{item}`." | `new` |
| Link | 5 | "Linking the old last node `{old}` to `{item}`: the queue holds `{n}` items." | `[old, new]` `current` |
| Dequeue, empty | 8 | "The queue is empty, so there is nothing to dequeue." | none, stop |
| Take | 8 | "Taking `{item}` from first." | `[first]` `current` |
| Advance | 9 | "first moves to `{next}`: the queue holds `{n-1}` items." | old node removed from `nodes` |
| Now empty | 11 | "The queue is now empty, so last is null too." | none |

Seeds: the array variant has capacity 8 holding `10, 20, 30, 40, 50` at slots 6, 7, 0, 1, 2 (`first = 6`, `last = 3`, `n = 5`), so the second dequeue wraps `first` and the fourth enqueue triggers a resize whose copy realigns the items. The linked variant holds `10` to `50`. Randomize: capacity 8, 3 to 6 unique values in 1 to 99 at a random `first`; linked, 3 to 6 values.

### 10.8 Stack, `/topic/stack`

**Variant:** `impl: "array" | "linked"` (default `"array"`), as in 10.7.

**State & snapshot**

```ts
interface EvalView {                // present only on the steps of `evaluate`
  tokens: string[]; cursor: number;
  operands: number[]; operators: string[];
  focus?: "operand" | "operator" | "apply";
}
interface ArrayStackSnapshot {
  impl: "array";
  slots: (number | null)[]; n: number;
  highlight?: { indices: number[]; kind: "write" | "read" | "copy" | "full" };
  eval?: EvalView;
}
interface LinkedStackSnapshot {
  impl: "linked";
  nodes: Record<string, LinkedNode>; firstId: string | null; nextId: number;
  highlight?: { ids: string[]; kind: "new" | "current" };
  eval?: EvalView;
}
type StackSnapshot = ArrayStackSnapshot | LinkedStackSnapshot;
type StackState = StackSnapshot;
```

**Canvas layout:** as the queue, with a single pointer label: `top` at index `n-1` in the array, `first` in the list (the name the code uses). When `eval` is set the canvas shows the token strip with the cursor marked, above two columns labeled operands and operators. Capacity is capped at 32 slots.

**Operations: Resizing array** (`ResizingArrayStack`)

```
1  PUSH(item):
2    if n == a.length: RESIZE(2 * a.length)
3    a[n] = item; n = n + 1
4  POP():
5    item = a[n - 1]; a[n - 1] = null; n = n - 1
6    if n > 0 and n == a.length / 4: RESIZE(a.length / 2)
7    return item
8  RESIZE(capacity):
9    copy = new array[capacity]
10   for i = 0 to n - 1: copy[i] = a[i]
11   a = copy
```

Operation ids are `array-push` (Push, `inputKind: "key"`) and `array-pop` (Pop, `inputKind: "none"`), `variants: ["array"]`.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Push, array full | 2 | "The array is full (`{n}` of `{cap}`), so double it to `{2cap}`." | occupied `full` |
| Push, room | 2 | "The array has room (`{n}` of `{cap}`), so no resize is needed." | none |
| Push, at the cap | 2 | "The array already has 32 slots, the most this demo shows, so `{item}` is not added." | none, stop |
| Copy (both resizes) | 10 | "Copying the `{n}` items into the new array of `{cap}`." | 0 to n-1 `copy` |
| Write | 3 | "Placing `{item}` at index `{n}`: the stack holds `{n+1}` items." | `[n]` `write` |
| Pop, empty | 5 | "The stack is empty, so there is nothing to pop." | none, stop |
| Read | 5 | "Removing `{item}` from index `{n-1}`: the stack holds `{n-1}` items." | `[n-1]` `read` |
| Halve | 6 | "The array is one-quarter full (`{n}` of `{cap}`), so halve it to `{cap/2}`." followed by the line-10 copy step | occupied `full` |
| Keep size | 6 | "`{n}` of `{cap}` slots are in use, so the array keeps its size." | none |

**Operations: Linked list**

```
1  PUSH(item):
2    oldfirst = first
3    first = NODE(item)
4    first.next = oldfirst
5    n = n + 1
6  POP():
7    item = first.item
8    first = first.next
9    n = n - 1
10   return item
```

Operation ids are `linked-push` and `linked-pop`, `variants: ["linked"]`.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Create | 3 | "Creating a node for `{item}`: first now points at it." | `new`, detached |
| Link | 4 | "Linking `{item}` to the old first node `{old}`: the stack holds `{n}` items." | `[new, old]` `current` |
| Link, was empty | 4 | "There was no old first node, so `{item}` is the only node: the stack holds 1 item." | `new` |
| Pop, empty | 7 | "The stack is empty, so there is nothing to pop." | none, stop |
| Take | 7 | "Taking `{item}` from first." | `[first]` `current` |
| Advance | 8 | "first moves to `{next}`: the stack holds `{n-1}` items." | old node removed |
| Advance, now empty | 8 | "first becomes null: the stack is empty." | old node removed |

**Operation: Evaluate expression** (Dijkstra's two-stack algorithm, `Evaluate.java`)

```
1  EVALUATE(tokens):
2    for each token in tokens:
3      if token is "(": skip it
4      else if token is an operator: ops.push(token)
5      else if token is ")":
6        op = ops.pop(); b = vals.pop(); a = vals.pop()
7        vals.push(APPLY(a, op, b))
8      else: vals.push(NUMBER(token))
9    return vals.pop()
```

Operation id `evaluate` (Evaluate expression, `inputKind: "text"`, placeholder `( 1 + ( 2 * 3 ) )`, no `variants`, so it is visible in both modes). Operators are `+ - * /`. The tokenizer accepts spaced and unspaced input (`/\d+(?:\.\d+)?|[()+\-*/]|\S+/g`); a non-integer result prints with two decimals. Every step's snapshot carries `eval`; the `finalSnapshot` is the input state untouched, so the demo never changes the student's stack. The two stacks inside `eval` are not resized or narrated as stacks: the algorithm is a client of the stack API, and simulating resizes here would only add noise. `variables`: `operands`, `operators`.

| Trigger | Line | Description | `focus` |
|---|---|---|---|
| Unknown token | 2 | "Token `{t}` is not a number, an operator, or a parenthesis, so evaluation stops." | none, stop |
| Over 40 tokens | 2 | "The expression has `{k}` tokens and this demo evaluates at most 40, so evaluation stops." | none, stop |
| Left parenthesis | 3 | "Token ( opens a group, so skip it." | none |
| Operator | 4 | "Token `{op}` is an operator, so push it onto the operator stack." | `operator` |
| Right parenthesis | 6 | "Token ) closes a group, so pop `{op}`, `{b}`, and `{a}`." | `apply` |
| Underflow | 6 | "A stack ran out of items at ), so the expression is not fully parenthesized." | none, stop |
| Apply | 7 | "`{a}` `{op}` `{b}` = `{r}`, so push `{r}` onto the operand stack." | `operand` |
| Divide by zero | 7 | "`{a}` / 0 has no value, so evaluation stops." | none, stop |
| Number | 8 | "Token `{v}` is a number, so push it onto the operand stack." | `operand` |
| Result | 9 | "Every token is read, so the result is `{r}`." | `operand` |
| Leftover values | 9 | "More than one value remains, so the expression is not fully parenthesized." | none |
| No value | 9 | "No value remains, so the expression has no result." | none |

Seeds: the array variant has capacity 4 holding `5, 9, 2` (top is 2), so the first push fills the array, the second doubles it, and two pops reach one-quarter and halve it. The linked variant holds the same values with 2 on top. Randomize: capacity 4 or 8 with 1 to capacity values; linked, 2 to 6 values.

### 10.9 Sorting, `/topic/sorting`

**State & snapshot**

```ts
interface SortingSnapshot {
  array: number[];
  highlight?: { indices: number[]; kind: "comparing" | "exchanging" | "marked" | "sorted" };
  sortedUpTo?: number;              // a[0..sortedUpTo-1] is known sorted (selection, insertion)
}
type SortingState = SortingSnapshot;
```

`marked` covers selection sort's current minimum and the item insertion sort and shellsort are placing. Every sort step carries `variables.compares` and `variables.exchanges`, and shellsort adds `variables.h`.

**Canvas layout:** the shared `ArrayRow`; the `sortedUpTo` prefix is drawn muted, the highlight kinds in the accent, secondary, and destructive colors. The array holds 2 to 10 items so the longest run (selection sort on 10 items) stays near 60 steps.

**Operations**

```
1  LOAD(values):
2    a = values; N = length(a)
```

```
1  SELECTION_SORT(a):
2    for i = 0 to N - 1:
3      min = i
4      for j = i + 1 to N - 1:
5        if LESS(a[j], a[min]): min = j
6      EXCH(a, i, min)
```

```
1  INSERTION_SORT(a):
2    for i = 1 to N - 1:
3      for j = i downto 1:
4        if LESS(a[j], a[j-1]): EXCH(a, j, j-1)
5        else: break
```

```
1  SHELLSORT(a):
2    h = 1
3    while h < N / 3: h = 3 * h + 1
4    while h >= 1:
5      for i = h to N - 1:
6        for j = i; j >= h; j = j - h:
7          if LESS(a[j], a[j-h]): EXCH(a, j, j-h)
8          else: break
9      h = h / 3
```

Operation ids are `load` (Load array, `inputKind: "array"`, placeholder `e.g. 7, 3, 9, 1`), `selection-sort` (Selection sort), `insertion-sort` (Insertion sort), `shellsort` (Shellsort), the last three `inputKind: "none"` acting on the current array. Selection sort emits one step per compare and one per exchange (they are separate lines); insertion sort and shellsort merge the compare and the exchange into one step because they sit on one line.

| Operation | Line | Description | Highlight |
|---|---|---|---|
| load | 2 | "Loading `{list}`: `{N}` items to sort." | none |
| load, outside 2 to 10 | 2 | "This demo sorts 2 to 10 items, and `{N}` were entered, so nothing changes." | none |
| selection, new pass | 3 | "Pass `{i}`: the smallest item so far is a[`{i}`] = `{v}`." | `[i]` `marked`, `sortedUpTo = i` |
| selection, min stays | 5 | "Comparing a[`{j}`] = `{x}` with the minimum a[`{min}`] = `{m}`: `{m}` is smaller, so min stays `{min}`." | `[j, min]` `comparing` |
| selection, new min | 5 | "Comparing a[`{j}`] = `{x}` with the minimum a[`{min}`] = `{m}`: `{x}` is smaller, so min becomes `{j}`." | `[j]` `marked` |
| selection, exchange | 6 | "Exchanging a[`{i}`] = `{v}` with a[`{min}`] = `{m}`, so `{m}` is in its final position." | `[i, min]` `exchanging`, `sortedUpTo = i + 1` |
| selection, self exchange | 6 | "a[`{i}`] = `{v}` is already the minimum, so exchanging it with itself changes nothing." | `[i]` `sorted`; still counted, so the total is exactly N exchanges |
| selection, done | 2 | "Every item is in place: `{compares}` compares and `{exchanges}` exchanges." | all `sorted` |
| insertion, take | 2 | "Taking a[`{i}`] = `{v}` and inserting it among the `{i}` sorted items to its left." | `[i]` `marked` |
| insertion, exchange | 4 | "a[`{j}`] = `{x}` is smaller than a[`{j-1}`] = `{y}`, so exchange them." | `[j, j-1]` `exchanging`, after the exchange |
| insertion, stop | 5 | "a[`{j}`] = `{x}` is not smaller than a[`{j-1}`] = `{y}`, so it stays: a[0..`{i}`] is sorted." | `[j, j-1]` `comparing`, `sortedUpTo = i + 1` |
| insertion, reached 0 | 3 | "`{x}` reached index 0, so a[0..`{i}`] is sorted." | `sortedUpTo = i + 1` |
| insertion, done | 2 | "Every item is in place: `{compares}` compares and `{exchanges}` exchanges." | all `sorted` |
| shellsort, increment | 3 | "N = `{N}`, so the increment sequence starts at h = `{h}`." | none |
| shellsort, pass | 4 | "h-sorting the array with h = `{h}`: every h-th item forms one subsequence." | none |
| shellsort, take | 5 | "Taking a[`{i}`] = `{v}` and inserting it among the items `{h}` apart to its left." | `[i, i-h, i-2h, ...]` `marked` |
| shellsort, exchange | 7 | "a[`{j}`] = `{x}` is smaller than a[`{j-h}`] = `{y}`, `{h}` positions to its left, so exchange them." | `[j, j-h]` `exchanging` |
| shellsort, stop | 8 | "a[`{j}`] = `{x}` is not smaller than a[`{j-h}`] = `{y}`, so it stays." | `[j, j-h]` `comparing` |
| shellsort, next h | 9 | "The array is `{h}`-sorted, so h becomes `{h/3}`." | none |
| shellsort, done | 4 | "h is 0, so the array is sorted: `{compares}` compares and `{exchanges}` exchanges." | all `sorted` |

With N in 4 to 12 the increment loop picks h = 4 then 1, so every seed shows two passes. Seed: `7, 10, 5, 3, 8, 4, 2, 9, 6`. Randomize: 7 to 9 unique values in 1 to 99.

### 10.10 Linked List, `/topic/linked-list`

**State & snapshot**

```ts
interface LinkedListSnapshot {
  nodes: Record<string, LinkedNode>;
  firstId: string | null; lastId: string | null;
  nextId: number;
  highlight?: Record<string, "new" | "current" | "visited">; // per node, so traverse can mark the current node and the visited prefix
}
type LinkedListState = LinkedListSnapshot;
```

**Canvas layout:** the shared `LinkedRow` with `first` and `last` pointer labels. The list holds at most 12 nodes. There is no search operation here: Week 7's sequential `get` is that operation, narrated in the symbol-table vocabulary.

**Operations**

```
1  INSERT_FIRST(item):
2    oldfirst = first
3    first = NODE(item)
4    first.next = oldfirst
5    if oldfirst is null: last = first
```

```
1  INSERT_LAST(item):
2    oldlast = last
3    last = NODE(item)
4    if oldlast is null: first = last
5    else: oldlast.next = last
```

```
1  REMOVE_FIRST():
2    if first is null: return null
3    item = first.item
4    first = first.next
5    if first is null: last = null
6    return item
```

```
1  TRAVERSE():
2    for x = first; x is not null; x = x.next:
3      VISIT(x.item)
```

Operation ids are `insert-first` (Insert at the beginning, `inputKind: "key"`), `insert-last` (Insert at the end, `inputKind: "key"`), `remove-first` (Remove from the beginning, `inputKind: "none"`), `traverse` (Traverse, `inputKind: "none"`).

| Operation | Line | Description | Highlight |
|---|---|---|---|
| insert-first / insert-last, at the cap | 3 | "The list holds 12 nodes, the most this demo shows, so `{item}` is not added." | none, stop |
| insert-first | 3 | "Creating a node for `{item}`: first now points at it." | `new`, detached; the old chain still drawn from `oldfirst` |
| insert-first | 4 | "Pointing its next at the old first node `{old}`, so the list starts at `{item}`." | `new` |
| insert-first, was empty | 5 | "The list was empty, so last also points at `{item}`." | `new` |
| insert-last | 3 | "Creating a node for `{item}`: last now points at it." | `new`, detached |
| insert-last, was empty | 4 | "The list was empty, so first also points at `{item}`." | `new` |
| insert-last | 5 | "Pointing the old last node `{old}` at `{item}`, so the list ends at `{item}`." | `[old, new]` `current` |
| remove-first, empty | 2 | "The list is empty, so there is nothing to remove." | none, stop |
| remove-first | 3 | "Taking `{item}` from the first node." | `[first]` `current` |
| remove-first | 4 | "first moves to `{next}`, so the old node is unreachable." | old node removed |
| remove-first, now empty | 5 | "first is null, so last is null too: the list is empty." | none |
| traverse, empty | 2 | "The list is empty, so there is nothing to visit." | none |
| traverse, visit | 3 | "Visit `{item}`. Visited so far: `{list}`." | x `current`, earlier nodes `visited`; `variables.visited` |
| traverse, end | 2 | "x is null, so the traversal ends after `{n}` nodes." | all `visited` |

Seed: `4, 8, 15, 16`. Randomize: 3 to 6 unique values in 1 to 99.

### 10.11 Searching, `/topic/searching`

**Variant:** `impl: "sequential" | "binary"` (default `"sequential"`), labeled Sequential search and Binary search (the tab strip has to fit a 400px viewport). Switching the variant resets the structure.

**State & snapshot**

```ts
interface STNode { id: string; key: number; value: number; next: string | null; }
interface SequentialSnapshot {
  impl: "sequential";
  nodes: Record<string, STNode>; firstId: string | null; nextId: number;
  highlight?: { ids: string[]; kind: "current" | "found" | "new" };
}
interface BinarySnapshot {
  impl: "binary";
  keys: number[]; vals: number[];   // parallel arrays, keys sorted ascending
  highlight?: { indices: number[]; kind: "mid" | "found" | "shift" | "new" | "miss" };
  range?: { lo: number; hi: number }; // the live search window during RANK
}
type SearchingSnapshot = SequentialSnapshot | BinarySnapshot;
type SearchingState = SearchingSnapshot;
```

**Values:** the input is a key. `put` stores 1 for a new key and `value + 1` for an existing key, the `FrequencyCounter` client's behavior, so the "one value per key, a repeat put replaces it" convention is visible without inventing values.

**Canvas layout:** the sequential variant is the shared `LinkedRow` with the key in each box and the value as a sublabel. The binary variant is the shared `ArrayRow` with cells outside `range` muted and `lo`, `mid`, `hi` pointer labels. The binary table holds at most 16 keys; it does not model a resizing array.

**Operations: Sequential search** (`SequentialSearchST`)

```
1  GET(key):
2    for x = first; x is not null; x = x.next:
3      if key == x.key: return x.val
4    return null
5  PUT(key, val):
6    for x = first; x is not null; x = x.next:
7      if key == x.key: x.val = val; return
8    first = NODE(key, val, first)
```

Operation ids are `seq-get` (Get, `inputKind: "key"`) and `seq-put` (Put, `inputKind: "key"`), `variants: ["sequential"]`.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Compare (get) | 3 | "Comparing `{key}` with `{x.key}`." | `[x]` `current`; `variables.compares` |
| Hit (get) | 3 | "`{key}` matches this node: HIT, its value is `{v}`." | `[x]` `found` |
| Miss (get) | 4 | "Reached the end of the list: MISS. `{key}` is not in the table." | none |
| Compare (put) | 7 | "Comparing `{key}` with `{x.key}`." | `[x]` `current` |
| Update (put) | 7 | "`{key}` is already in the table, so its value becomes `{v+1}`." | `[x]` `found` |
| Insert (put) | 8 | "Reached the end of the list, so insert `{key}` at the front with value 1." | new node `new` |

**Operations: Binary search** (`BinarySearchST`)

```
1  GET(key):
2    i = RANK(key)
3    if i < n and keys[i] == key: return vals[i]
4    return null
5  PUT(key, val):
6    i = RANK(key)
7    if i < n and keys[i] == key: vals[i] = val; return
8    for j = n downto i + 1: keys[j] = keys[j-1]; vals[j] = vals[j-1]
9    keys[i] = key; vals[i] = val; n = n + 1
10 RANK(key):
11   lo = 0; hi = n - 1
12   while lo <= hi:
13     mid = lo + (hi - lo) / 2
14     if key < keys[mid]: hi = mid - 1
15     else if key > keys[mid]: lo = mid + 1
16     else: return mid
17   return lo
```

Operation ids are `bin-get` (Get) and `bin-put` (Put), `inputKind: "key"`, `variants: ["binary"]`. The three listings are one block so line numbers are unique.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Rank start (both) | 11 | "lo = 0 and hi = `{n-1}`: `{key}` can only be in this range." | `range` |
| Rank probe | 13 | "mid = `{mid}`: comparing `{key}` with keys[`{mid}`] = `{k}`." | `[mid]` `mid`; `variables` lo, mid, hi, compares |
| Rank, go left | 14 | "`{key}` < `{k}`, so hi becomes `{mid-1}`." | `range` shrinks |
| Rank, go right | 15 | "`{key}` > `{k}`, so lo becomes `{mid+1}`." | `range` shrinks |
| Rank, equal | 16 | "`{key}` equals keys[`{mid}`], so rank is `{mid}`." | `[mid]` `found` |
| Rank, exhausted | 17 | "lo passed hi, so rank is `{lo}`: `{lo}` keys are smaller than `{key}`." | `range` cleared |
| Get hit | 3 | "keys[`{i}`] is `{key}`: HIT, its value is `{v}`." | `[i]` `found` |
| Get miss, inside | 4 | "keys[`{i}`] is `{k}`, not `{key}`: MISS." | `[i]` `miss` |
| Get miss, past the end | 4 | "Rank `{i}` is past the last key: MISS." | none |
| Put update | 7 | "keys[`{i}`] is `{key}`, so its value becomes `{v+1}`." | `[i]` `found` |
| Put, at the 16-key cap | 9 | "The table holds 16 keys, the most this demo shows, so `{key}` is not added." | none, stop |
| Put shift (one per key moved) | 8 | "Moving keys[`{j-1}`] = `{k}` right to index `{j}` to make room." | `[j]` `shift` |
| Put place | 9 | "Placing `{key}` at index `{i}` with value 1: the table holds `{n+1}` keys." | `[i]` `new` |

Seeds hold the same keys in both variants: the list runs `21 (1), 30 (1), 5 (2), 12 (1)` from first to last; the array holds keys `5, 12, 21, 30, 44` with values `2, 1, 1, 1, 1`. Randomize: 4 to 7 unique keys, every value 1.

### 10.12 B-Tree, `/topic/b-tree`

**State & snapshot**

```ts
const BTREE_M = 4;                  // fixed: up to M - 1 = 3 keys per node after a split settles
interface BTreeEntry { key: number; childId: string | null; } // childId null in external nodes
interface BTreeNode { id: string; entries: BTreeEntry[]; external: boolean; }
interface BTreeSnapshot {
  M: number;
  nodes: Record<string, BTreeNode & { x: number; y: number; highlight?: "current" | "found" | "new" | "split"; entryIndex?: number }>;
  rootId: string;
  height: number;                   // 0 when the root is external
  n: number;                        // number of keys
  nextId: number;
}
type BTreeState = BTreeSnapshot;
```

**Semantics:** `BTree.java` from the reference implementation, with two intentional deviations. Internal entries hold a key and a child link, the key being the smallest key of that child's subtree; external entries hold a key and its value. Descend into child `j` when `j + 1 == h.m` or `key < h.entry[j+1].key`. After an insertion, a node holding `M` entries splits: entries 0 and 1 stay, entries 2 and 3 move to a new node, and the parent receives a guide entry `(u.entry[0].key, u)` right after the child it descended into. A root split creates a two-entry root and increments `height`. Deviation 1: when a new minimum descends into child `j` with `key < h.entry[j].key` (only possible for `j = 0`), the guide key is rewritten to `key` (line 10). The reference implementation leaves it stale, which after a root split draws a node such as `20 | 20`, and a student reads that as a bug; keeping every guide key equal to its subtree's smallest key keeps the picture honest, and the Java snippet carries the same one extra line. Deviation 2: `put` of a key that is already present stops with a single step instead of storing a duplicate, because the reference text calls this a symbol table. Values are not visualized (the input is a key); the Java snippet keeps `val`. The tree holds at most 30 keys.

**Canvas layout:** an SVG. Each node is a horizontal run of `entries.length` key boxes (30 × 26), laid out by `layoutMultiwayTree` (`lib/layout/tree-layout.ts`): a post-order pass computes each subtree's width, children pack left to right, a parent centers over its children, `y = depth × vertical spacing`. Each internal entry draws a line from its bottom center to its child's top center. External nodes are filled; internal nodes are outlined. A node that has just split off and is not yet linked by its parent (`splitFrom`) is laid out with its subtree as its origin's next sibling, so the split step never draws a node, or the children it took, over another row. The viewBox is computed from the extents, as in 10.1.

**Operation: Get**

```
1  GET(key): return SEARCH(root, key, height)
2  SEARCH(x, key, ht):
3    if ht == 0:
4      for j = 0 to x.m - 1: if key == x.entry[j].key: return x.entry[j].val
5    else:
6      for j = 0 to x.m - 1:
7        if j + 1 == x.m or key < x.entry[j+1].key: return SEARCH(x.entry[j].child, key, ht - 1)
8    return null
```

**Operation: Put**

```
1  PUT(key, val):
2    u = INSERT(root, key, val, height)
3    if u is null: return
4    root = NODE(ENTRY(root.entry[0].key, root), ENTRY(u.entry[0].key, u)); height = height + 1
5  INSERT(h, key, val, ht):
6    t = ENTRY(key, val)
7    if ht == 0: j = number of entries in h with key < new key
8    else:
9      find j with j + 1 == h.m or key < h.entry[j+1].key
10     if key < h.entry[j].key: h.entry[j].key = key
11     u = INSERT(h.entry[j].child, key, val, ht - 1)
12     if u is null: return null
13     t = ENTRY(u.entry[0].key, u); j = j + 1
14   shift h.entry[j..] right; h.entry[j] = t; h.m = h.m + 1
15   if h.m < M: return null
16   return SPLIT(h)
17 SPLIT(h):
18   t = NODE(h.entry[M/2 .. M-1]); h.m = M / 2
19   return t
```

Operation ids are `get` (Get, `inputKind: "key"`) and `put` (Put, `inputKind: "key"`). Every step carries `variables.probes`, the number of nodes visited so far, which is what the reference's log_M(n) bound counts.

| Operation | Line | Description | Highlight |
|---|---|---|---|
| get / put, descend | 7 / 9 | "`{key}` < `{entry[j+1].key}`, so descend into child `{j}`." | node `current`, `entryIndex = j` |
| get / put, descend into the last child | 7 / 9 | "`{key}` >= `{entry[j].key}`, the last guide key, so descend into child `{j}`." | node `current`, `entryIndex = j` |
| put, new minimum | 10 | "`{key}` is smaller than the guide key `{old}`, so the guide key becomes `{key}`." | node `new`, `entryIndex = j` |
| get, compare in a leaf (the hit replaces the compare for the matching entry) | 4 | "Comparing `{key}` with `{e.key}` in this leaf." | leaf `current`, `entryIndex` |
| get, hit | 4 | "`{key}` matches this entry: HIT." | leaf `found`, `entryIndex` |
| get, miss | 8 | "`{key}` is not in this leaf: MISS." | leaf `current` |
| put, duplicate | 7 | "`{key}` is already in this leaf, so nothing changes." | leaf `found`, stop |
| put, at the 30-key cap | 2 | "The tree holds 30 keys, the most this demo shows, so `{key}` is not added." | none, stop |
| put, place | 14 | "Placing `{key}` at position `{j}` in the leaf: it now holds `{m}` entries." | leaf `new`, `entryIndex = j` |
| put, split | 18 | "The node holds `{M}` entries, so split it: `{k0}` and `{k1}` stay, `{k2}` and `{k3}` move to a new node." | both nodes `split` |
| put, parent gains an entry | 14 | "Adding guide key `{u.entry[0].key}` for the new node to the parent at position `{j}`: it now holds `{m}` entries." | parent `new`, `entryIndex = j` |
| put, root split | 4 | "The root split into two nodes, so a new root above them adds a level: height is now `{height}`." | new root `new` |

Seed: put `50, 20, 70, 30, 60` in that order, giving a root with guide keys `20, 50` over the leaves `[20, 30]` and `[50, 60, 70]`. Putting `80` splits the second leaf and the root still has room; putting `10` then `5` rewrites the guide key, splits the first leaf, and splits the root (height 2). Randomize: 8 to 12 unique keys in 1 to 99, inserted in random order.

## 11. Content Integration

`content.ts` in each topic folder holds `realWorldUsage` and `coreMaterial` as the corresponding sections already written in:

- `Week-1-Complexity.md`
- `Week-2-ArraysDataRepresentation.md`
- `Week-3-Queue.md`
- `Week-4-Stack.md`
- `Week-5-Sorting.md`
- `Week-6-LinkedList.md`
- `Week-7-Searching.md`
- `Week-9-BST.md`
- `Week-10-BTree.md`
- `Week-11-BinaryHeap.md`
- `Week-12-HashTable.md`
- `Week-13-15-Graph.md`

Copy those two sections in as-is (Markdown rendered via a lightweight renderer, or converted to JSX). Do not rewrite or re-summarize them; they've already been through this course's citation-integrity process, and rewriting risks introducing unverified claims.

The reference files live in `references/` and `content.ts` is generated from them by `scripts/extract-content.mjs`, so the app never holds a hand-edited copy. The references themselves are held to the copy standard in Section 18, with one limit: only punctuation may change in them (an em dash becoming a comma, period, colon, or parentheses). Wording, claims, and citations never change, because that would undo the citation-integrity review.

## 12. Accessibility & Responsiveness

- All playback controls must be keyboard-operable (space to play/pause, arrow keys to step) and carry `aria-label`s, because students may navigate this without a mouse.
- On narrow viewports, `VisualizerShell` stacks vertically: Canvas → OperationBar → CodePanel → PlaybackControls, rather than the desktop side-by-side layout.
- Canvas SVGs should use `viewBox` scaling, not fixed pixel dimensions, so they scale down on mobile without clipping. A tree canvas whose `viewBox` changes shape between steps (heap, BST, B-tree) renders at a fixed height, the cap it already had on wide viewports, so a narrowing tree does not grow the card and move the page while stepping; the heap's empty message takes the same height for the same reason.
- Layout contract by width, checked by `e2e/topic-page-layout.spec.ts` (`npm run test:e2e`):
  - `lg` and up: the document does not scroll; the Code listing and the active materials panel (Structure included) do. Scrolling either leaves every other element in place. Switching the variant moves the "on the canvas" badge to the matching representation block, and the live fields row changes while stepping. The Code card sizes to a short listing instead of filling the column. Stepping through an operation keeps the highlighted line inside the listing and never moves the page. The listing is reachable with Tab, shows a focus ring, and scrolls with the arrow keys.
  - `md` to `lg`: Operation and Playback keep their content height beside a tall Code card (Playback starts one grid gap below Operation); a short Code card ends level with the bottom of Playback.
  - Phone: cards stack in DOM order, the document scrolls, nothing overflows sideways at 400px (the three materials tabs and the Structure panel included), and stepping does not move the page. The live fields label sits above the chips below `sm`.

## 13. Deployment

Same pattern as the `dsa-online-judge` project:

- **Repo:** new repository, e.g. `dsa-explorer`.
- **Dockerfile:** multi-stage: `node` stage runs `vite build`, final stage serves `dist/` via a minimal static server (e.g. `nginx:alpine` or `caddy`).
- **CI/CD:** GitHub Actions workflow builds the image on push to `main` and pushes to GHCR (`ghcr.io/<user>/dsa-explorer`).
- **Hosting:** the existing home-server Traefik instance picks up the new container via labels; the existing Cloudflare Tunnel config gets a new hostname mapping.
- **Domain:** `dsa.ridhopratama.net`. **[OPEN]**: confirm this exact subdomain.

## 14. Extensibility: Adding a Future Topic

Every RPS week now has a topic (Sections 10.1 to 10.12). To add a further topic, or a second visualizer for a week that already has one:

1. Create `src/topics/<slug>/` with the same files (`index.ts`, `types.ts`, `operations.ts`, `operations.test.ts`, `canvas.tsx`, `pseudocode.ts`, `snippets.ts`, `structure.ts`, `content.ts`). Row-shaped structures reuse `ArrayRow` and `LinkedRow` from `components/visualizer/canvas/` and the node helpers in `lib/linked-nodes.ts`; trees reuse `layoutBinaryTree` or `layoutMultiwayTree`.
2. Define the topic's `TSnapshot` shape and canvas rendering rule.
3. Write pseudocode + a step table per operation, in the same format as Section 10, then the three language snippets with their line map.
4. Write `structure.ts` from the week reference and the Java snippet: the ADT table with costs the reference states, the invariants, one declaration per variant, and `liveFields` returning at most six scalars; `src/topics/structure.test.ts` checks it.
5. Register the module in `topics/registry.ts`.
6. No changes to `AppSidebar`, `TopicPage`, `VisualizerShell`, or the step engine are needed; they're all generic over `TopicModule`.

## 15. Roadmap: Expansion to the Full RPS

The explorer's v1 scope (Section 2) was limited to four topics; the 2026-09-13 expansion specified the rest. The table below tracks each topic's status and where its detailed spec lives. Per Section 14, each row becomes its own subsection under Section 10 (same format: snapshot shape, canvas rule, pseudocode + step table) when it's actually specified. This table is the tracker, not the spec itself.

| Topic | RPS Week(s) | Slide deck status | Explorer spec status |
|---|---|---|---|
| Analysis of Algorithms | 1 | Drafted (`Week-1-Complexity.md`) | **Specified, Section 10.5; implemented** |
| Arrays & Data Representation | 2 | Drafted (`Week-2-ArraysDataRepresentation.md`) | **Specified, Section 10.6; implemented** |
| Queue | 3 | Drafted (`Week-3-Queue.md`) | **Specified, Section 10.7; implemented** |
| Stack | 4 | Drafted (`Week-4-Stack.md`) | **Specified, Section 10.8; implemented** |
| Sorting | 5 | Drafted (`Week-5-Sorting.md`) | **Specified, Section 10.9; implemented** |
| Linked List | 6 | Drafted (`Week-6-LinkedList.md`) | **Specified, Section 10.10; implemented** |
| Searching | 7 | Drafted (`Week-7-Searching.md`) | **Specified, Section 10.11; implemented** |
| Binary Search Tree | 9 | Drafted | **Specified, Section 10.1; implemented** |
| B-Tree | 10 | Drafted (`Week-10-BTree.md`) | **Specified, Section 10.12; implemented** |
| Binary Heap | 11 | Drafted | **Specified, Section 10.2; implemented** |
| Hash Table | 12 | Drafted | **Specified, Section 10.3; implemented** |
| Graph | 13–15 | Drafted | **Specified, Section 10.4; implemented** |
| Case study: canteen order counter | 1–7 | Not a slide deck; hand-written copy | **Specified, Section 19.3; implemented** |
| Case study: ER triage desk | 9–11 | Not a slide deck; hand-written copy | **Specified, Section 19.2; implemented** |
| Case study: study plan builder | 12–15 | Not a slide deck; hand-written copy | **Specified, Section 19.1; implemented** |

Governance rule: a topic's row only moves to "Specified" once its full Section 10 subsection is written and reviewed; the roadmap doesn't authorize skipping straight to implementation off just a slide deck. Slide-deck drafting and explorer-spec drafting are tracked separately because they can proceed independently. A row gains "implemented" once its module is registered and its `operations.test.ts` encodes the Section 10 table.

## 16. Acceptance Criteria

- [ ] All four v1 topics reachable via their routes, listed correctly in the sidebar with week labels.
- [ ] Every operation in Section 10's tables is triggerable, animates through its full step sequence, and the code panel highlights the correct line at every step.
- [ ] The code panel never clips a line, on desktop or at a 400px viewport; long lines wrap with a hanging indent and the block has no horizontal scroll.
- [ ] Every operation offers C++, Java, and Python tabs, and stepping highlights the mapped line in whichever tab is open.
- [ ] Play/pause/step-forward/step-backward/speed/scrub all function correctly against a precomputed step array.
- [ ] Randomize and Reset work without going through the step engine (instant, not animated).
- [ ] Hash Table's chaining/probing toggle and Graph's directed/undirected toggle each correctly swap canvas component and operation list.
- [ ] Every Section 10.5 to 10.12 topic is registered in week order and passes its `operations.test.ts`; the `text` input rejects an empty expression with a visible error.
- [ ] Real-world usage and core material content renders on each topic page, sourced from the four existing markdown files.
- [ ] Every topic's Structure tab lists its ADT operations with costs and its representation, the badge follows the variant toggle, and the live fields row under the canvas tracks the step being shown.
- [ ] Responsive layout verified at a mobile viewport width, and the Section 12 layout contract passes `npm run test:e2e` at desktop, tablet, and phone widths.
- [ ] Each Section 19 case study is reachable at `/case-study/:slug`, listed in the sidebar and on the home page, passes its `operations.test.ts` and `src/case-studies/case-studies.test.ts`, and keeps the layout contract in `e2e/case-study-page.spec.ts`; its quiz can be finished and retried by keyboard.
- [ ] Builds to a static `dist/`, runs correctly in the production Docker image.

## 17. Open Items to Confirm Before/During Build

- [ ] Framer Motion vs. CSS-only transitions (Section 3).
- [ ] Fixed vs. student-configurable hash table size M (Section 10.3).
- [ ] Final subdomain name (Section 13).

## 18. Copy and Text Standard (antislop)

This section is mandatory and not open for negotiation. Every piece of text this project produces is held to the antislop rule set: the core (`antislop:antislop`) and the copywriting skill (`antislop:antislop-copywriting`). Code comments are additionally held to `antislop:antislop-code`. A change that fails the antislop Delivery Gate is not merged, however small.

**What it covers.** UI strings, step narration (`Step.description` and `variables`), placeholders, empty and error states, aria-labels, page titles, code comments, README, this specification, `CLAUDE.md`, the audit records in `anti-slop/`, and the course references in `references/` (punctuation only, see Section 11).

**Hard rules, restated so they are searchable here:**

- No em dash character (U+2014) anywhere (R-02). Use a period, comma, colon, or parentheses. Two hyphens with spaces around them, used as a dash, count too. The en dash (`–`) is allowed only inside a numeric range such as `Weeks 10–11` or `8–12`, never as an aside.
- No generic CTAs (R-15). Buttons name the action they perform: Go, Randomize, Reset, Step forward.
- No marketing vocabulary (R-16) and none of the empty AI vocabulary the copywriting skill lists (seamless, powerful, effortless, unlock, elevate, and so on). Say what the thing does.
- No fabricated numbers, claims, or sources (R-17, R-36, R-38). A count the app computes is fine; a number nobody measured is not.
- Student-facing text never points at internal documents. A student does not have `SPEC.md`; a placeholder tells them what is not built yet and what is.
- No arrows (`→`) or dashes as prose connectors in narration. Use `so` for cause and effect and a colon for a result.
- Every sentence names its actor where one exists (no actorless passive), and no rhythm tells: no forced rule of three, no negative parallelism, no staccato fragments.

**Narration house style.** One plain sentence per step, present tense, naming the key or node it concerns, ending with a period. Counts pluralize (`1 item`, `2 items`); the tables write `{n} items` for brevity. Two short sentences are fine when a step has a cause and an effect. The step tables in Section 10 are the canonical examples and are themselves held to this standard; a new topic's table is written this way before its `run()` is implemented.

**Mechanical guard.** `npm run lint:copy` (`scripts/check-copy.mjs`) scans the source, docs, and references for the banned characters and fails the build, locally and in CI. It is the floor, not the standard: passing it does not replace running the antislop checklist.

**Process.** antislop is applied in DURING mode: rules are applied while writing, not audited afterwards. The one-time audit of the pre-existing copy is recorded in `anti-slop/audit-001-2026-09-13.md`; later audits, if any, number upward in that folder.

## 19. Case Studies

A topic page teaches one structure. A case study takes a small, everyday problem that needs several of them, says why each structure fits, runs the solution step by step, and ends with a short quiz. There are three, one per block of the semester. Each story is illustrative (the course references do not describe a canteen, an emergency room, or a study program's planner); every cost or property the pages state is quoted from the week reference that proves it, with the same rule as `structure.ts` (Section 7).

### 19.0 Shared contract

**Types** (`src/types/case-study.ts`). The simulator is a full `TopicModule` (Section 7) that is not in `topics`, so `VisualizerShell`, `CodePanel`, `PlaybackControls`, and `LiveFields` run it unchanged. `TopicModule` is not extended.

```ts
interface StructureChoice {
  name: string;          // e.g. "Queue (linked list)"
  cost: string;          // quoted from the week reference, same rule as structure.ts
  reason: string;        // one or two sentences, house style
  topicSlug: string;     // the topic page that teaches it
}

interface DecisionRow {
  requirement: string;   // what the scenario needs, in the student's words
  chosen: StructureChoice;
  rejected: StructureChoice[];
}

interface ChoiceQuestion {
  kind: "choice";
  id: string;
  prompt: string;
  choices: string[];
  answer: number;        // index into choices
  explanation: string;   // shown after Check; names the week, never SPEC.md
  topicSlug: string;
}

interface PredictQuestion extends Omit<ChoiceQuestion, "kind"> {
  kind: "predict";
  operationId: string;   // run on simulator.createInitialState(variant)
  variant: string;
  input: unknown;
  stepIndex: number;     // the step drawn with the simulator canvas; the question asks about the step after it
  expect: string;        // substring of steps[stepIndex + 1].description, and of choices[answer]
}

type QuizQuestion = ChoiceQuestion | PredictQuestion;

interface CaseStudyModule<TSnapshot = unknown> {
  slug: string;
  title: string;
  weekLabel: string;               // e.g. "Weeks 1–7"
  summary: string;                 // one sentence for the home page and sidebar
  topicSlugs: string[];            // topics the case study draws on, in week order
  content: { scenario: string; reasoning: string }; // hand-written markdown, not generated
  decisions: DecisionRow[];
  simulator: TopicModule<TSnapshot, TSnapshot>;     // slug equals the case study slug
  quiz: QuizQuestion[];
}
```

**Registry.** `src/case-studies/registry.ts` exports `caseStudies: CaseStudyModule[]` in week order and `getCaseStudy(slug)`. The sidebar lists them in a "Case Studies" group after the week groups, and the home page gives them a section after the topics.

**Page.** `/case-study/:slug` renders `CaseStudyPage`, the same layout contract as `TopicPage` (Sections 6 and 12): viewport-locked at `lg` with the simulator's `VisualizerShell` on the left and three tabs on the right, **Scenario** (default, `content.scenario`), **Reasoning** (one block per `DecisionRow`, then `content.reasoning`), and **Quiz**. The header shows the title, the week badge, and a link to every topic in `topicSlugs`. `key={slug}` resets the simulator, the tab, and the quiz on navigation.

**Quiz.** One question at a time. Choices are native radio inputs, so the shell's Space and arrow-key listener (which ignores `INPUT`) never plays or steps while a student answers. Check shows whether the choice is right, the explanation, and a link to the topic; Next moves on; the last question shows the score with a Retry button. A predict question draws `steps[stepIndex].snapshot` with the simulator's own canvas and quotes that step's description above the choices, so the picture always matches the code. Nothing is stored beyond the component.

**Canvas view switch.** A case study snapshot holds several structures and a `focus` naming the one the step is about. Above the canvas, `FocusCaption` shows one button per part. The canvas follows `focus` whenever it changes; a student can open any other part, which stays on screen until the focus changes again, and while it does the button for the step's part has a dashed outline. A part with nothing to show is disabled. The choice is local to the canvas (`useFollowedView` in `src/lib/use-followed-view.ts`), so the shell and `TopicModule` do not change.

**Removals start before the removal.** An operation that takes something out (Treat next, Serve next) first emits a step with the structure untouched and the leaving item marked, so stepping backward reaches the state before anything left.

**Naive versus chosen.** Every simulator has a variant with the chosen design first and a naive design second. Both run the same scenario, and a computed counter in the live fields shows what the naive design costs (a skipped order, a bypassed patient, a broken prerequisite).

**Tests.** `src/case-studies/<slug>/operations.test.ts` is the executable form of the tables below. `src/topics/structure.test.ts` and `src/topics/snippets.test.ts` run over every simulator as well as every topic. `src/case-studies/case-studies.test.ts` checks that each `topicSlug` exists, each `answer` indexes a choice, and each predict question's `expect` appears in the next step and in the right choice. `e2e/case-study-page.spec.ts` checks the layout contract and the quiz flow.

### 19.1 Study plan builder, `/case-study/study-plan` (Weeks 12–15)

**Scenario.** A study program lists its courses by short code and says which course must come before which. A student wants a semester order that never takes a course before its prerequisite, and the planner must say so when no such order exists.

**Variant:** `order: "topological" | "alphabetical"` (default `"topological"`), labeled Topological and Alphabetical. The naive plan sorts codes from A to Z and counts every prerequisite it breaks.

**State & snapshot**

```ts
interface CourseEntry { code: string; v: number }
interface StudyPlanSnapshot {
  focus: "index" | "graph" | "plan";
  M: number;                              // 11, as in Section 10.3
  buckets: CourseEntry[][];               // separate chaining, code to vertex
  codes: string[];                        // codes[v]
  graph: GraphSnapshot;                   // Section 10.4, directed, vertex labels are codes
  plan?: { order: string[]; late: string[] }; // late: courses placed before one of their prerequisites
  highlight?: { bucket: number; index?: number };
}
```

`HASH(code)` is the algs4 string hash with `R = 31`: `h = (31 * h + charCode) mod M` over the characters. A code is 2 to 4 letters or digits, stored uppercase. At most 10 courses (Section 10.4's vertex cap). The seed is MTH, PR1, DSC, PR2, DSA, DB, WEB, AI with prerequisites PR1 to PR2, PR2 to DSA, DSC to DSA, PR2 to DB, DB to WEB, PR2 to WEB, DSA to AI, MTH to AI. Randomize walks the candidate prerequisites over the pool MTH, STA, PR1, DSC, PR2, OOP, DSA, DB, WEB, NET, OS, AI in random order (PR1 to PR2, PR2 to OOP, PR2 to DSA, DSC to DSA, PR2 to DB, DB to WEB, OOP to WEB, NET to WEB, PR1 to NET, DSA to OS, MTH to STA, STA to AI, DSA to AI, MTH to AI), keeping each one whose courses still fit a target of 6 to 9 courses, then shuffles the vertex order. Every course it picks sits on at least one edge. Every candidate points from an earlier course to a later one, so the result is always a DAG. The resting state, after Reset, Randomize, or an operation, has `focus: "graph"`.

**Canvas.** The view switch (Section 19.0) offers Code index, Prerequisite digraph, and Study plan, the last enabled only while `plan` is set. `index` draws the 11 buckets as rows of code boxes; `graph` draws the digraph with `GraphCanvas`; `plan` draws the digraph above one row of codes in plan order with late courses marked. Every view renders at the same fixed height so stepping never resizes the card.

**Add course** (`add-course`, `inputKind: "text"`)

```
1  ADD_COURSE(code):
2    i = HASH(code)
3    if code is in bucket[i]: return
4    v = V; V = V + 1; add vertex v to the digraph
5    append (code, v) to bucket[i]
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Code is not 2 to 4 letters or digits | 1 | "A course code has 2 to 4 letters or digits, such as PR3." | graph |
| Hash | 2 | "`{code}` hashes to bucket `{i}`." | index |
| Compare with an entry | 3 | "Comparing `{code}` with `{other}` in bucket `{i}`." | index |
| Already present | 3 | "`{code}` is already course `{v}`, so nothing changes." | index |
| 10 courses already | 4 | "The plan holds at most 10 courses, so `{code}` is not added." | graph |
| New vertex | 4 | "`{code}` becomes vertex `{v}` of the digraph, with no prerequisites yet." | graph |
| Append | 5 | "Appending `{code}` to bucket `{i}`: the index now holds `{n}` courses." | index |

**Add prerequisite** (`add-prereq`, `inputKind: "text"`, placeholder "e.g. PR1 before PR2": the course left of `before` is taken first; the word is matched case-insensitively)

```
1  ADD_PREREQUISITE(before, after):
2    v = GET(before)
3    w = GET(after)
4    if v or w is missing, or v == w: return
5    add edge v to w
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Input is not `{code} before {code}` with 2 to 4 letters or digits per code | 1 | "Type the course taken first, then before, then the next course, such as PR1 before PR2." | graph |
| Same code twice | 4 | "A course cannot be its own prerequisite." | graph |
| Hash `before` / `after` | 2 / 3 | "`{code}` hashes to bucket `{i}`." | index |
| Compare | 2 / 3 | "Comparing `{code}` with `{other}` in bucket `{i}`." | index |
| Found | 2 / 3 | "`{code}` is course `{v}`." | index |
| Missing | 4 | "`{code}` is not in the index. Add it as a course first." | index |
| Edge exists | 5 | "`{before}` is already a prerequisite of `{after}`." | graph |
| Add | 5 | "Added edge `{before}` to `{after}`: take `{before}` first." | graph, new edge drawn as `tree` |

Both GET calls count compares in `variables.compares`.

**Build study plan, topological** (`plan-topological`, `variants: ["topological"]`, `inputKind: "none"`)

```
1  BUILD_PLAN():
2    for each course v, in vertex order:
3      if v is unmarked: DFS(v)
4    return the reverse of postorder
5  DFS(v):
6    mark v; put v on the call stack
7    for each course w that lists v as a prerequisite:
8      if w is on the call stack: report a cycle
9      else if w is unmarked: DFS(w)
10   take v off the call stack; add v to postorder
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Unmarked start | 3 | "`{code}` is unmarked, so start a DFS from `{code}`." | graph |
| Enter | 6 | "Visiting `{code}`." | graph, vertex `visiting` |
| Neighbor | 7 | "`{w}` lists `{v}` as a prerequisite." | graph, edge `active` |
| Neighbor on the call stack | 8 | "`{w}` is still on the call stack, so the prerequisites form a cycle and no study plan exists." Stops. | graph |
| Neighbor already marked | 9 | "`{w}` is already marked, so skip it." | graph |
| Neighbor unmarked | 9 | "`{w}` is unmarked, so visit `{w}` next." | graph, edge `tree` |
| Finish | 10 | "Finished `{code}`: it joins the postorder." | graph, vertex `visited` |
| Result | 4 | "Study plan: `{order}`." | plan, no late courses |

`variables.postorder` lists the postorder so far (or `empty`).

**Build study plan, alphabetical** (`plan-alphabetical`, `variants: ["alphabetical"]`, `inputKind: "none"`)

```
1  BUILD_PLAN_ALPHABETICAL():
2    order = every course code, sorted A to Z
3    for each prerequisite edge v to w:
4      if w comes before v in order: count a violation
5    return order
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Sort | 2 | "Sorting the codes from A to Z gives `{order}`." | plan |
| Edge in order | 3 | "`{v}` comes before `{w}`, so this prerequisite holds." | plan, edge `tree` |
| Edge broken | 4 | "`{w}` comes before its prerequisite `{v}`: violation `{k}`." | plan, edge `active`, `w` late |
| Result | 5 | "The alphabetical plan breaks `{k}` prerequisites." (`1 prerequisite`, or "breaks no prerequisites.") | plan |

Edges are checked in the order they were added. `variables.violations` carries the count.

**Live fields:** `V`, `E`, `M`, `load` (`n / M` to two decimals).

### 19.2 ER triage desk, `/case-study/er-triage` (Weeks 9–11)

**Scenario.** An emergency room admits patients one at a time and gives each a severity from 1 (can wait) to 5 (critical). The desk always treats the most urgent waiting patient next, earliest arrival first on a tie. Every patient has a record number, and the records live in an archive on disk where each node read is a block read.

**Variant:** `triage: "priority" | "arrival"` (default `"priority"`), labeled Priority queue and Arrival queue. The naive desk treats patients in arrival order and counts every time it treats someone while a more urgent patient waits.

**State & snapshot**

```ts
interface Patient { arrival: number; severity: number; record: number } // arrival numbers start at 101
interface TriageSnapshot {
  mode: "priority" | "arrival";
  focus: "triage" | "archive";
  waiting: Patient[];        // priority: heap order, waiting[k - 1] is heap position k; arrival: front first
  archive: BTreeSnapshot;    // Section 10.12, keyed by record number
  nextArrival: number;
  treated: number;
  bypassed: number;          // treatments given while a more urgent patient waited
  highlight?: { positions: number[]; kind: "new" | "compare" | "swap" | "treat" };
}
```

A patient is more urgent than another when its severity is higher, or the severities are equal and it arrived earlier. At most 15 patients wait at once. The archive holds the records of the patients admitted today: it starts empty and the seed admits #101 (severity 2, record 42), #102 (4, 17), #103 (1, 88), #104 (5, 63), #105 (3, 25) in that order, so the seed has 5 waiting patients and 5 records. Treat next keeps the record, so `records` = distinct records admitted, and a record whose patient is still waiting cannot be admitted again. Randomize admits 5 to 8 patients with distinct random records into an empty archive.

**Canvas.** The view switch (Section 19.0) offers the waiting list and the record archive. `triage` draws the heap as a tree of labeled boxes (`#104` over `S5 R63`: arrival number, then severity and record number) in priority mode, or one row of patients with `first` over the front in arrival mode. `archive` draws `BTreeCanvas`, whose keys are record numbers. Both views take the B-tree canvas's fixed height (300). A key line under the view reads "#: arrival number. S: severity. R: record number, the key in the archive."

**Admit patient** (`admit-priority` with `variants: ["priority"]`, `admit-arrival` with `variants: ["arrival"]`; `inputKind: "array"`, placeholder "Severity, record: e.g. 5, 50")

```
1  ADMIT(severity, record):
2    if archive.get(record) is null: archive.put(record)
3    p = new Patient(nextArrival, severity, record)
4    pq.insert(p)
5  SWIM(k):
6    while k > 1 and pq[k] is more urgent than pq[k / 2]:
7      exchange pq[k] and pq[k / 2]; k = k / 2
```

The arrival listing is lines 1 to 3 and `4    queue.enqueue(p)`.

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Input is not two numbers, severity 1 to 5, record 1 to 999 | 1 | "Enter a severity from 1 to 5 and a record number, such as 5, 50." | triage |
| 15 already waiting | 1 | "15 patients are already waiting, so treat someone first." | triage |
| Record belongs to a waiting patient | 1 | "Record `{record}` belongs to #`{b}`, who is still waiting." | triage, that patient `treat` |
| Archive lookup | 2 | the Section 10.12 get steps, unchanged | archive |
| Record missing | 2 | "Record `{record}` is new, so the desk adds it to the archive." | archive |
| Heap: place | 4 | "Patient #`{a}` (severity `{s}`, record `{record}`) takes position `{k}` at the end of the heap." | triage, `new` |
| Heap: compare | 6 | "Comparing #`{a}` (severity `{s}`) with its parent #`{b}` (severity `{t}`)." | triage, `compare` |
| Heap: swim | 7 | "#`{a}` is more urgent than #`{b}`, so it swims up." | triage, `swap` |
| Heap: stop below the root | 6 | "Heap order holds: #`{b}` stays above #`{a}`." | triage |
| Heap: reaches the root | 6 | "#`{a}` reaches the root: the next patient to treat." | triage |
| Queue: join | 4 | "Patient #`{a}` (severity `{s}`, record `{record}`) joins the back of the queue at position `{i}`." | triage, `new` |

**Treat next** (`treat-priority`, `treat-arrival`; `inputKind: "none"`)

```
1  TREAT_NEXT():
2    if pq is empty: return
3    p = pq[1]; move pq[n] to pq[1]; n = n - 1
4    SINK(1)
5  SINK(k):
6    while 2k <= n:
7      j = the more urgent child of k
8      if pq[k] is at least as urgent as pq[j]: stop
9      exchange pq[k] and pq[j]; k = j
```

The arrival listing is:

```
1  TREAT_NEXT():
2    if queue is empty: return
3    p = queue.dequeue()
4    if someone still waiting is more urgent than p: bypassed = bypassed + 1
```

| Trigger | Line | Description | Focus |
|---|---|---|---|
| Nobody waiting (both) | 2 | "Nobody is waiting, so there is nobody to treat." | triage |
| Heap: before treatment | 3 | "#`{a}` (severity `{s}`) is at the root: the most urgent patient waiting." Heap unchanged. | triage, root `treat` |
| Heap: take the root, others remain | 3 | "Treating #`{a}` (severity `{s}`), the most urgent patient. #`{last}` (severity `{t}`) moves to the root." | triage, root `new` |
| Heap: take the last patient | 3 | "Treating #`{a}` (severity `{s}`). Nobody else is waiting." | triage |
| Heap: two children, severities differ | 7 | "Comparing the children #`{x}` (severity `{sx}`) and #`{y}` (severity `{sy}`): #`{w}` is more urgent, since `{sw}` > `{sl}`." | triage, `compare` |
| Heap: two children, same severity | 7 | "Comparing the children #`{x}` (severity `{s}`) and #`{y}` (severity `{s}`): both have severity `{s}`, so #`{w}`, who arrived earlier, is more urgent." | triage, `compare` |
| Heap: one child | 7 | "#`{x}` (severity `{sx}`) is the only child." | triage, `compare` |
| Heap: stop, severities differ | 8 | "#`{a}` (severity `{s}`) is more urgent than #`{j}` (severity `{t}`), so heap order holds." | triage, `compare` on both |
| Heap: stop, same severity | 8 | "#`{a}` and #`{j}` both have severity `{s}`, and #`{a}` arrived earlier, so heap order holds." | triage, `compare` on both |
| Heap: sink, severities differ | 9 | "#`{j}` (severity `{t}`) is more urgent than #`{a}` (severity `{s}`), so #`{a}` sinks down." | triage, `swap` |
| Heap: sink, same severity | 9 | "#`{j}` and #`{a}` both have severity `{s}`, and #`{j}` arrived earlier, so #`{a}` sinks down." | triage, `swap` |
| Heap: no children left | 6 | "#`{a}` has no children, so heap order holds." | triage |
| Queue: before treatment | 3 | "#`{a}` (severity `{s}`) is at the front of the queue." Queue unchanged. | triage, front `treat` |
| Queue: treat | 3 | "Treating #`{a}` (severity `{s}`), who arrived first." | triage, `treat` |
| Queue: bypass | 4 | "#`{u}` (severity `{t}`) is more urgent and still waiting: bypassed is now `{k}`." | triage, `u` marked |
| Queue: no bypass | 4 | "Nobody still waiting is more urgent than #`{a}`." | triage |

`bypassed` never changes in priority mode, since the root is always the most urgent patient.

**Find record** (`find-record`, both variants, `inputKind: "key"`)

```
1  FIND_RECORD(record):
2    node = root
3    for each level above the leaves:
4      node = the child whose range holds record
5    search the leaf for record
```

The Section 10.12 get steps run unchanged with their lines mapped (descend to 4, leaf compare and HIT or MISS to 5), then one summary step on line 5: "Record `{record}` found after `{k}` block reads." or "Record `{record}` is not in the archive: `{k}` block reads." (`1 block read`). `variables` carries `block reads`.

**Live fields:** `waiting`, `treated`, `bypassed`, `records`, `height`.

### 19.3 Canteen order counter, `/case-study/canteen-orders` (Weeks 1–7)

**Scenario.** A campus canteen has one counter. Each order gets the next number, starting at 101, and waits until the kitchen serves it. Served orders go into a log for the day, and a student at the pickup shelf asks whether their number has been served.

**Variant:** `design: "queue" | "stack"` (default `"queue"`), labeled Queue and Stack. The naive counter keeps waiting orders on a stack, so the newest order is served first; its log is then out of number order and has to be scanned from the start.

**State & snapshot**

```ts
interface CanteenSnapshot {
  design: "queue" | "stack";
  nodes: Record<string, LinkedNode>;   // lib/linked-nodes, value = order number
  firstId: string | null;              // front of the queue, or top of the stack
  lastId: string | null;               // back of the queue; null for the stack
  nextId: number;
  log: (number | null)[];              // resizing array, capacity = log.length, starts at 2
  n: number;                           // orders in the log
  nextOrder: number;
  skipped: number;                     // orders served while an older order waited
  highlight?: { ids?: string[]; indices?: number[]; kind: "new" | "current" | "found" | "write" | "copy" };
  range?: { lo: number; hi: number };  // the live binary search window
}
```

At most 12 orders wait at once, and the day takes at most 32 orders. The seed runs place, place, place, serve, serve, place, serve, place, place on each design: the queue ends with log 101, 102, 103 (capacity 4) and 104, 105, 106 waiting; the stack ends with log 103, 102, 104 and 106, 105, 101 waiting (106 on top), `skipped = 3`. Randomize runs 14 to 20 random place and serve actions from an empty counter.

**Canvas.** Two labeled rows: the waiting orders as a `LinkedRow` (`first` and `last` pointers for the queue, `top` for the stack) and the served log as an `ArrayRow` with `lo`, `mid`, and `hi` pointers during a binary search.

**Place order** (`place-queue`, `place-stack`; `inputKind: "none"`)

```
1  PLACE_ORDER():
2    number = nextOrder; nextOrder = nextOrder + 1
3    pending.enqueue(number)
```

The stack listing ends with `3    pending.push(number)`.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| 12 waiting | 3 | "12 orders are already waiting, so serve one before taking another." | none |
| 32 orders today | 2 | "The counter has taken 32 orders today, the most this log keeps." | none |
| Number | 2 | "The counter gives the new order number `{num}`." | none |
| Queue, not empty | 3 | "Order `{num}` joins the back of the queue after order `{last}`." | `new` |
| Stack, not empty | 3 | "Order `{num}` goes on top of the stack, above order `{top}`." | `new` |
| Empty | 3 | "Nothing was waiting, so order `{num}` is the only order waiting." | `new` |

**Serve next** (`serve-queue`, `serve-stack`; `inputKind: "none"`)

```
1  SERVE_NEXT():
2    if pending is empty: return
3    number = pending.dequeue()
4    if n == log.length: resize the log to 2 * log.length
5    log[n] = number; n = n + 1
```

The stack listing reads `3    number = pending.pop()`.

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Nothing waiting | 2 | "No orders are waiting, so there is nothing to serve." | none |
| Queue, before serving | 3 | "Order `{num}` is at the front of the queue." The order is still linked. | `current` on it |
| Stack, before serving | 3 | "Order `{num}` is on top of the stack." The order is still linked. | `current` on it |
| Queue | 3 | "Order `{num}` is first in the queue, so the kitchen serves it." | none |
| Stack, no older order waiting | 3 | "Order `{num}` is on top of the stack, so the kitchen serves it." | none |
| Stack, older orders waiting | 3 | "Order `{num}` is on top of the stack, so the kitchen serves it before `{k}` older orders." | none |
| Log full | 4 | "The served log is full at `{cap}` slots, so it doubles to `{2cap}`." | every slot `copy` |
| Write | 5 | "Writing order `{num}` at position `{i}` of the served log." | `write` |

**Find order, binary search** (`find-binary`, `variants: ["queue"]`, `inputKind: "key"`, placeholder "Order number, e.g. 104")

```
1  FIND_ORDER(number):
2    lo = 0; hi = n - 1
3    while lo <= hi:
4      mid = (lo + hi) / 2
5      if number < log[mid]: hi = mid - 1
6      else if number > log[mid]: lo = mid + 1
7      else: return mid
8    return NOT_SERVED
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Probe | 4 | "lo = `{lo}`, hi = `{hi}`, so mid = `{mid}`: order `{log[mid]}`." | `current`, range |
| Smaller | 5 | "`{num}` < `{log[mid]}`, so search the left half." | range |
| Larger | 6 | "`{num}` > `{log[mid]}`, so search the right half." | range |
| Found | 7 | "Found order `{num}` at position `{mid}` after `{c}` compares." | `found` |
| Not found | 8 | "lo is past hi after `{c}` compares: order `{num}` is not in the served log." | none |

**Find order, sequential search** (`find-sequential`, `variants: ["stack"]`, `inputKind: "key"`)

```
1  FIND_ORDER(number):
2    for i = 0 to n - 1:
3      if log[i] == number: return i
4    return NOT_SERVED
```

| Trigger | Line | Description | Highlight |
|---|---|---|---|
| Compare | 3 | "Comparing `{num}` with order `{log[i]}` at position `{i}`." | `current` |
| Found | 3 | "Found order `{num}` at position `{i}` after `{c}` compares." | `found` |
| Not found | 4 | "Reached the end of the log after `{c}` compares: order `{num}` is not in it." | none |

Compare counts pluralize (`1 compare`). `variables.compares` carries the running count.

**Live fields:** `waiting`, `served`, `cap`, `next`, `skipped`.
