# DSA Interactive Explorer: Technical Specification (v1)

**Course:** Algoritma dan Struktur Data (1519630013), Universitas Negeri Jakarta
**Author:** Muhammad Ridho Kurniawan Pratama
**Scope of v1:** Binary Search Tree, Binary Heap, Hash Table, Graph
**Reference:** Sedgewick, R. & Wayne, K., *Algorithms, 4th Edition* (https://algs4.cs.princeton.edu)
**Style reference:** visualgo.net, contextualized to this course's RPS

### How to use this document

This spec is written for two readers at once. A human reader can read top to bottom for the shape of the product. An AI coding agent implementing this should treat Sections 6–10 as authoritative contracts: type shapes, file paths, and step tables are specified precisely enough to implement without needing to invent behavior. Where a decision is genuinely open, it's marked **[OPEN]** rather than left ambiguous.

---

## 1. Overview

An in-browser, single-page app that lets students interactively build and operate on the four data structures covered in Weeks 9–15 of the course, watching each operation animate step by step: a VisualGO-style tool, scoped to exactly what this RPS teaches, with the visualization paired against the real-world usage and core material content already written for the course.

## 2. Goals and Non-Goals

**Goals**
- Step-by-step animated visualization of BST, Binary Heap, Hash Table, and Graph operations, with synced pseudocode highlighting.
- Custom and randomized input for every structure.
- A architecture that lets future topics (queue, stack, sorting, linked list, B-tree, the rest of the RPS) be added as self-contained modules without touching existing code.

**Non-Goals (v1)**
- No backend, no persistence, no user accounts. Everything is client-side, in-memory, reset on page reload.
- No quiz/scoring/practice-mode features. This is a visualization tool, not an assessment tool.
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
│   │   │   └── CodePanel.tsx         # pseudocode with highlighted line
│   │   └── ui/                       # shadcn generated components
│   ├── topics/
│   │   ├── registry.ts               # TopicModule[], single source of truth for nav + routes
│   │   ├── bst/
│   │   │   ├── index.ts              # exports the TopicModule
│   │   │   ├── operations.ts         # insert, search, delete, traverse
│   │   │   ├── canvas.tsx            # TreeCanvas
│   │   │   ├── pseudocode.ts
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
├── public/
├── index.html
├── vite.config.ts
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
| `/topic/bst` | `TopicPage` for Binary Search Tree (Week 9) |
| `/topic/binary-heap` | `TopicPage` for Binary Heap (Weeks 10–11) |
| `/topic/hash-table` | `TopicPage` for Hash Table (Week 12) |
| `/topic/graph` | `TopicPage` for Graph (Weeks 13–15) |

`TopicPage` is generic: it looks up the current topic from `registry.ts` by the `:slug` param and renders a two-column layout on desktop: `VisualizerShell` in the left column (sticky, so it stays in view while reading) and the course materials in the right column as tabs, `content.realWorldUsage` (default) | `content.coreMaterial`. On narrow viewports the columns stack, visualizer first. CPMK is deliberately omitted; refer students to the RPS for that.

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
  inputKind: "key" | "edge" | "array" | "none";
  run: OperationFn<TState, TInput, TSnapshot>;
}

export interface VariantConfig {
  id: string;                       // e.g. "collision-strategy"
  label: string;                    // e.g. "Collision Strategy"
  options: { value: string; label: string }[];
  default: string;
}

export interface TopicModule<TState = unknown, TSnapshot = unknown> {
  slug: string;
  title: string;
  weekLabel: string;                // e.g. "Week 9" or "Weeks 10–11"
  operations: OperationDefinition<TState, unknown, TSnapshot>[];
  pseudocode: Record<string, string[]>;  // operationId -> lines of pseudocode
  CanvasComponent: React.ComponentType<{ snapshot: TSnapshot; variant?: string }>;
  content: { realWorldUsage: string; coreMaterial: string };
  variant?: VariantConfig;
  createInitialState: () => TState;
  randomize: (state: TState, variant?: string) => TState; // instant, no animation
}
```

`registry.ts` exports `const topics: TopicModule[]`, which drives both `AppSidebar` and `TopicPage`'s lookup. **Adding a new topic later means adding one entry here, with no other file changes.**

## 8. Shared UI Components

- **`AppSidebar`**: lists `topics` from the registry, grouped by week range, each item showing title + `weekLabel` badge. Built on shadcn `Sidebar`.
- **`VisualizerShell`**: the reusable "app" per topic: owns the persistent `TState`, the `usePlayback` instance for the most recently triggered operation's steps, and composes `OperationBar`, the topic's `CanvasComponent`, `CodePanel`, and `PlaybackControls`.
- **`OperationBar`**: operation `Select` (from `operations`), an `Input` sized to `inputKind`, a "Go" `Button`, a "Randomize" `Button`, a "Reset" `Button`, and (when `variant` is defined) a `Tabs` or `Select` bound to it.
- **`CodePanel`**: renders `pseudocode[currentOperationId]` as a numbered `<pre>` block; the line matching `currentStep.highlightLine` gets a highlighted background. Show `currentStep.description` above or below the block.
- **`PlaybackControls`**: play/pause toggle, step-back, step-forward, a `Slider` bound to `currentStepIndex` for scrubbing, and a speed `Slider` (ms-per-step).

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
- Triggering a new operation replaces `steps` and calls `reset()`.
- "Randomize" and "Reset" (in `OperationBar`) bypass the step engine entirely: they mutate `TState` directly and clear `steps` to `[]`, since they aren't meant to be scrubbed.

## 10. Per-Topic Specifications

Each subsection gives: the snapshot shape, the canvas layout rule, and pseudocode + a step table per operation. The step table is the contract for `run()`: implement `run()` so it emits exactly these steps, in this order, for these trigger conditions.

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

Each `VISIT` (line 4) emits a step highlighting that node and appending its key to a running visited-order list shown in the description: *"Visit `{key}`. Visited so far: `{list}`."* An empty tree emits a single line-2 step: *"The tree is empty, so there is nothing to visit."*

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
| Append | 2–3 | "Placing `{value}` at the end of the heap (index `{n}`)." |
| Compare with parent | 6 | "Comparing `{array[k]}` with parent `{array[k/2]}`." |
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
| Take root | 2–4 | "Removing `{extreme}` from the root; moving last element `{array[n+1]}` to the top." |
| Pick larger child | 9–10 | "Comparing children at `{j}` and `{j+1}`." |
| Swap | 11–12 | "`{array[k]}` is smaller than its child `{array[j]}`, so it sinks down." |
| Stop | 11 | "Heap order restored." |

**Operation: Build-heap (from a custom/random array)**

```
1  BUILD_HEAP(a):
2    array = a; n = length(a)
3    for k = n/2 downto 1:
4      SINK(k)
```

Each iteration of line 3–4 emits the full SINK step sequence for that `k`, so the student watches the classic right-to-left heapify sweep.

**Operation: Heapsort**

```
1  HEAPSORT(a):
2    BUILD_HEAP(a)
3    while n > 1:
4      SWAP(1, n)
5      n = n - 1
6      SINK(1)
```

Reuses Build-heap and Sink step sequences; each pass through lines 4–6 marks index `n+1` as `highlight.kind: "sorted"` (rendered visually distinct, e.g. muted/greyed, and excluded from further sink comparisons).

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

Every operation's first step highlights the computed index: *"`{key} mod {M} = {i}`, so use bucket `{i}`."* Then a second step narrates the linked-list scan/append/removal within that bucket.

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
```

Each probe (lines 3–4 / 8–10) is its own step: *"Slot `{i}` is occupied by `{slot[i]}`. Probe the next slot."* Deletion for open addressing is the classic "remove then rehash the cluster" approach: after removing the key, walk forward from that slot re-inserting every key found until an empty slot is reached, so search correctness is preserved.

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
| Start | 2 | "Starting BFS from `{source}`." vertex → `"frontier"` |
| Dequeue | 4 | "Processing `{v}`." vertex → `"visiting"` |
| Check neighbor | 5–6 | "Checking neighbor `{w}`." edge → `"active"` |
| Mark & enqueue | 7–8 | "`{w}` is new. Mark it visited and enqueue it." vertex → `"frontier"`, edge → `"tree"` |

**Operation: DFS**: same shape as BFS but recursive (stack via call frames instead of an explicit queue); step table mirrors BFS's with "recursing into `{w}`" language instead of "enqueuing."

**Operation: Connected Components (undirected only)**

```
1  CONNECTED_COMPONENTS():
2    count = 0
3    for each vertex v:
4      if v not visited:
5        count = count + 1
6        DFS(v), assigning component = count to every reached vertex
```

Runs the DFS step sequence per component, tagging `vertex.component` and using a distinct highlight color per component index.

**Operation: Topological Sort (directed only)**

```
1  TOPOLOGICAL_SORT():
2    for each vertex v:
3      if v not visited:
4        DFS_POSTORDER(v)   // pushes v onto a stack after visiting all its descendants
5    return REVERSE(postorder stack)
```

Each postorder push (line 4) is a step; the final step reveals the reversed order as the answer, narrated explicitly: *"Reverse postorder is a valid topological order."*

**Operation: Strong Components, Kosaraju–Sharir (directed only)**

```
1  KOSARAJU_SHARIR():
2    order = REVERSE_POSTORDER(REVERSE(G))
3    for each vertex v in order:
4      if v not visited:
5        DFS(v) in G, assigning the same component id to every reached vertex
```

Two-phase animation: first show the reverse-postorder computation on the reversed graph (dimmed/secondary), then the main DFS pass on the original graph assigning component colors.

## 11. Content Integration

`content.ts` in each topic folder holds `realWorldUsage` and `coreMaterial` as the corresponding sections already written in:

- `Week-9-BST.md`
- `Week-11-BinaryHeap.md`
- `Week-12-HashTable.md`
- `Week-13-15-Graph.md`

Copy those two sections in as-is (Markdown rendered via a lightweight renderer, or converted to JSX). Do not rewrite or re-summarize them; they've already been through this course's citation-integrity process, and rewriting risks introducing unverified claims.

The reference files live in `references/` and `content.ts` is generated from them by `scripts/extract-content.mjs`, so the app never holds a hand-edited copy. The references themselves are held to the copy standard in Section 18, with one limit: only punctuation may change in them (an em dash becoming a comma, period, colon, or parentheses). Wording, claims, and citations never change, because that would undo the citation-integrity review.

## 12. Accessibility & Responsiveness

- All playback controls must be keyboard-operable (space to play/pause, arrow keys to step) and carry `aria-label`s, because students may navigate this without a mouse.
- On narrow viewports, `VisualizerShell` stacks vertically: Canvas → OperationBar → CodePanel → PlaybackControls, rather than the desktop side-by-side layout.
- Canvas SVGs should use `viewBox` scaling, not fixed pixel dimensions, so they scale down on mobile without clipping.

## 13. Deployment

Same pattern as the `dsa-online-judge` project:

- **Repo:** new repository, e.g. `dsa-explorer`.
- **Dockerfile:** multi-stage: `node` stage runs `vite build`, final stage serves `dist/` via a minimal static server (e.g. `nginx:alpine` or `caddy`).
- **CI/CD:** GitHub Actions workflow builds the image on push to `main` and pushes to GHCR (`ghcr.io/<user>/dsa-explorer`).
- **Hosting:** the existing home-server Traefik instance picks up the new container via labels; the existing Cloudflare Tunnel config gets a new hostname mapping.
- **Domain:** `dsa.ridhopratama.net`. **[OPEN]**: confirm this exact subdomain.

## 14. Extensibility: Adding a Future Topic

To add a topic from the rest of the RPS (queue, stack, sorting, linked list, B-tree) later:

1. Create `src/topics/<slug>/` with the same five files (`index.ts`, `operations.ts`, `canvas.tsx`, `pseudocode.ts`, `content.ts`).
2. Define the topic's `TSnapshot` shape and canvas rendering rule.
3. Write pseudocode + a step table per operation, in the same format as Section 10.
4. Register the module in `topics/registry.ts`.
5. No changes to `AppSidebar`, `TopicPage`, `VisualizerShell`, or the step engine are needed; they're all generic over `TopicModule`.

## 15. Roadmap: Expansion to the Full RPS

The explorer's v1 scope (Section 2) is deliberately limited to four topics. The table below governs what's confirmed to come next, its status, and where its detailed spec will live once written. Per Section 14, each row becomes its own subsection under Section 10 (same format: snapshot shape, canvas rule, pseudocode + step table) when it's actually specified. This table is the tracker, not the spec itself.

| Topic | RPS Week(s) | Slide deck status | Explorer spec status |
|---|---|---|---|
| Complexity / Big-O | 1–2 | Not yet drafted | Not yet planned |
| Arrays & Data Representation | 2 | Not yet drafted | Not yet planned |
| Queue | 3 | Not yet drafted | Not yet planned |
| Stack | 4 | Not yet drafted | Not yet planned |
| Sorting | 5 | Not yet drafted | Not yet planned |
| Linked List | 6 | Not yet drafted | Not yet planned |
| Searching (general) | 7 | Not yet drafted | Not yet planned |
| B-Tree | 10 | Drafted (`Week-10-BTree.md`) | Not yet planned |
| Binary Search Tree | 9 | Drafted | **Specified, Section 10.1** |
| Binary Heap | 11 | Drafted | **Specified, Section 10.2** |
| Hash Table | 12 | Drafted | **Specified, Section 10.3** |
| Graph | 13–15 | Drafted | **Specified, Section 10.4** |

Governance rule: a topic's row only moves to "Specified" once its full Section 10 subsection is written and reviewed; the roadmap doesn't authorize skipping straight to implementation off just a slide deck. Slide-deck drafting and explorer-spec drafting are tracked separately because they can proceed independently (a topic can have a deck without a spec, as most rows above currently do).

## 16. Acceptance Criteria

- [ ] All four v1 topics reachable via their routes, listed correctly in the sidebar with week labels.
- [ ] Every operation in Section 10's tables is triggerable, animates through its full step sequence, and the code panel highlights the correct line at every step.
- [ ] Play/pause/step-forward/step-backward/speed/scrub all function correctly against a precomputed step array.
- [ ] Randomize and Reset work without going through the step engine (instant, not animated).
- [ ] Hash Table's chaining/probing toggle and Graph's directed/undirected toggle each correctly swap canvas component and operation list.
- [ ] Real-world usage and core material content renders on each topic page, sourced from the four existing markdown files.
- [ ] Responsive layout verified at a mobile viewport width.
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

**Narration house style.** One plain sentence per step, present tense, naming the key or node it concerns, ending with a period. Two short sentences are fine when a step has a cause and an effect. The step tables in Section 10 are the canonical examples and are themselves held to this standard; a new topic's table is written this way before its `run()` is implemented.

**Mechanical guard.** `npm run lint:copy` (`scripts/check-copy.mjs`) scans the source, docs, and references for the banned characters and fails the build, locally and in CI. It is the floor, not the standard: passing it does not replace running the antislop checklist.

**Process.** antislop is applied in DURING mode: rules are applied while writing, not audited afterwards. The one-time audit of the pre-existing copy is recorded in `anti-slop/audit-001-2026-09-13.md`; later audits, if any, number upward in that folder.
