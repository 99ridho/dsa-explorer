// SPEC.md §10.12: operations. Each `run()` emits exactly the steps in the spec's
// step tables, in order, with the listed `highlightLine`.
import type { OperationDefinition, OperationResult, Step } from '@/types/step-engine'
import { layoutMultiwayTree } from '@/lib/layout/tree-layout'
import { BTREE_M, MAX_KEYS, nodeId, type BTreeHighlight, type BTreeSnapshot, type BTreeState } from './types'

export const ENTRY_W = 30
export const ENTRY_H = 26
const V_GAP = 70
const FOREST = '__forest'

// ---------- snapshot helpers ----------

/** Deep-clones the node map and drops every highlight. */
function cloneSnapshot(s: BTreeSnapshot): BTreeSnapshot {
  const nodes: BTreeSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) {
    const { highlight: _h, entryIndex: _e, ...rest } = node
    nodes[id] = { ...rest, entries: node.entries.map((e) => ({ ...e })) }
  }
  return { M: s.M, nodes, rootId: s.rootId, height: s.height, n: s.n, nextId: s.nextId }
}

export function nodeWidth(entries: number): number {
  return Math.max(1, entries) * ENTRY_W
}

/** Recomputes x/y for every node from the current links. */
export function withLayout(s: BTreeSnapshot): BTreeSnapshot {
  const realChildren = (id: string) => s.nodes[id].entries.map((e) => e.childId).filter((c): c is string => c !== null)
  const linked = new Set<string>()
  const visit = (id: string) => {
    linked.add(id)
    realChildren(id).forEach(visit)
  }
  visit(s.rootId)

  // A node that just split off is laid out as its origin's next sibling, with its subtree, until the parent links it.
  const detachedAfter = new Map<string, string>()
  for (const node of Object.values(s.nodes)) {
    if (!linked.has(node.id) && node.splitFrom) detachedAfter.set(node.splitFrom, node.id)
  }
  const withDetached = (ids: string[]) => ids.flatMap((c) => (detachedAfter.has(c) ? [c, detachedAfter.get(c)!] : [c]))

  const rootSplit = detachedAfter.has(s.rootId)
  const positions = layoutMultiwayTree(
    rootSplit ? FOREST : s.rootId,
    (id) => (id === FOREST ? withDetached([s.rootId]) : withDetached(realChildren(id))),
    (id) => (id === FOREST ? 0 : nodeWidth(s.nodes[id].entries.length)),
    { vGap: V_GAP },
  )
  const yShift = rootSplit ? V_GAP : 0

  const nodes: BTreeSnapshot['nodes'] = {}
  for (const [id, node] of Object.entries(s.nodes)) {
    const pos = positions[id] ?? { x: 0, y: yShift }
    if (linked.has(id)) {
      const { splitFrom: _linked, ...rest } = node
      nodes[id] = { ...rest, x: pos.x, y: pos.y - yShift }
    } else {
      nodes[id] = { ...node, x: pos.x, y: pos.y - yShift }
    }
  }
  return { ...s, nodes }
}

interface Mark {
  id: string
  highlight: BTreeHighlight
  entryIndex?: number
}

class StepRecorder {
  readonly steps: Step<BTreeSnapshot>[] = []
  probes = 0

  push(base: BTreeSnapshot, highlightLine: number, description: string, marks: Mark[] = []) {
    const snapshot = withLayout(cloneSnapshot(base))
    for (const m of marks) {
      const node = snapshot.nodes[m.id]
      if (!node) continue
      node.highlight = m.highlight
      if (m.entryIndex !== undefined) node.entryIndex = m.entryIndex
    }
    this.steps.push({ id: this.steps.length, description, highlightLine, snapshot, variables: { probes: this.probes } })
  }
}

// ---------- builders (no steps) ----------

export function emptyTree(): BTreeSnapshot {
  const root = nodeId(0)
  return withLayout({
    M: BTREE_M,
    nodes: { [root]: { id: root, entries: [], external: true, x: 0, y: 0 } },
    rootId: root,
    height: 0,
    n: 0,
    nextId: 1,
  })
}

export function buildTree(keys: number[]): BTreeSnapshot {
  return keys.reduce((tree, key) => runPut(tree, key).finalSnapshot, emptyTree())
}

/** algs4's descend rule: child j when j + 1 == m or key < entry[j+1].key. */
function childIndex(entries: { key: number }[], key: number): number {
  for (let j = 0; j < entries.length; j++) {
    if (j + 1 === entries.length || key < entries[j + 1].key) return j
  }
  return entries.length - 1
}

function narrateDescend(rec: StepRecorder, s: BTreeSnapshot, id: string, key: number, line: number): number {
  const node = s.nodes[id]
  const j = childIndex(node.entries, key)
  rec.probes += 1
  const description =
    j + 1 === node.entries.length
      ? `${key} >= ${node.entries[j].key}, the last guide key, so descend into child ${j}.`
      : `${key} < ${node.entries[j + 1].key}, so descend into child ${j}.`
  rec.push(s, line, description, [{ id, highlight: 'current', entryIndex: j }])
  return j
}

// ---------- get ----------

export function runGet(state: BTreeState, key: number): OperationResult<BTreeSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)
  let id = s.rootId
  for (let ht = s.height; ht > 0; ht--) {
    const j = narrateDescend(rec, s, id, key, 7)
    id = s.nodes[id].entries[j].childId!
  }
  const leaf = s.nodes[id]
  rec.probes += 1
  for (let j = 0; j < leaf.entries.length; j++) {
    if (leaf.entries[j].key === key) {
      rec.push(s, 4, `${key} matches this entry: HIT.`, [{ id, highlight: 'found', entryIndex: j }])
      return { steps: rec.steps, finalSnapshot: withLayout(s) }
    }
    rec.push(s, 4, `Comparing ${key} with ${leaf.entries[j].key} in this leaf.`, [{ id, highlight: 'current', entryIndex: j }])
  }
  rec.push(s, 8, `${key} is not in this leaf: MISS.`, [{ id, highlight: 'current' }])
  return { steps: rec.steps, finalSnapshot: withLayout(s) }
}

// ---------- put ----------

/** Lines 17 to 19: the upper half of a full node moves to a new node, which is returned. */
function split(rec: StepRecorder, s: BTreeSnapshot, id: string): string {
  const h = s.nodes[id]
  const half = s.M / 2
  const moved = h.entries.slice(half)
  const kept = h.entries.slice(0, half)
  const tId = nodeId(s.nextId)
  s.nextId += 1
  s.nodes[tId] = { id: tId, entries: moved, external: h.external, x: 0, y: 0, splitFrom: id }
  h.entries = kept
  const keys = [...kept, ...moved].map((e) => e.key)
  rec.push(
    s,
    18,
    `The node holds ${s.M} entries, so split it: ${keys[0]} and ${keys[1]} stay, ${keys[2]} and ${keys[3]} move to a new node.`,
    [
      { id, highlight: 'split' },
      { id: tId, highlight: 'split' },
    ],
  )
  return tId
}

/** Lines 5 to 16. Returns the id of the new sibling when `id` split, else null. */
function insert(rec: StepRecorder, s: BTreeSnapshot, id: string, key: number, ht: number): string | null | 'duplicate' {
  const h = s.nodes[id]
  let j: number
  let entry: { key: number; childId: string | null }

  if (ht === 0) {
    rec.probes += 1
    if (h.entries.some((e) => e.key === key)) {
      rec.push(s, 7, `${key} is already in this leaf, so nothing changes.`, [{ id, highlight: 'found', entryIndex: h.entries.findIndex((e) => e.key === key) }])
      return 'duplicate'
    }
    j = h.entries.filter((e) => e.key < key).length
    entry = { key, childId: null }
  } else {
    j = narrateDescend(rec, s, id, key, 9)
    if (key < h.entries[j].key) {
      const old = h.entries[j].key
      h.entries[j].key = key
      rec.push(s, 10, `${key} is smaller than the guide key ${old}, so the guide key becomes ${key}.`, [{ id, highlight: 'new', entryIndex: j }])
    }
    const u = insert(rec, s, h.entries[j].childId!, key, ht - 1)
    if (u === 'duplicate') return 'duplicate'
    if (u === null) return null
    entry = { key: s.nodes[u].entries[0].key, childId: u }
    j += 1
  }

  h.entries.splice(j, 0, entry)
  if (ht === 0) {
    s.n += 1
    rec.push(s, 14, `Placing ${key} at position ${j} in the leaf: it now holds ${h.entries.length} entries.`, [{ id, highlight: 'new', entryIndex: j }])
  } else {
    rec.push(s, 14, `Adding guide key ${entry.key} for the new node to the parent at position ${j}: it now holds ${h.entries.length} entries.`, [{ id, highlight: 'new', entryIndex: j }])
  }
  if (h.entries.length < s.M) return null
  return split(rec, s, id)
}

export function runPut(state: BTreeState, key: number): OperationResult<BTreeSnapshot> {
  const rec = new StepRecorder()
  const s = cloneSnapshot(state)

  if (s.n >= MAX_KEYS && !Object.values(s.nodes).some((node) => node.external && node.entries.some((e) => e.key === key))) {
    rec.push(s, 2, `The tree holds ${MAX_KEYS} keys, the most this demo shows, so ${key} is not added.`)
    return { steps: rec.steps, finalSnapshot: withLayout(s) }
  }

  const u = insert(rec, s, s.rootId, key, s.height)
  if (u === null || u === 'duplicate') return { steps: rec.steps, finalSnapshot: withLayout(s) }

  const oldRoot = s.nodes[s.rootId]
  const rootId = nodeId(s.nextId)
  s.nextId += 1
  s.nodes[rootId] = {
    id: rootId,
    entries: [
      { key: oldRoot.entries[0].key, childId: oldRoot.id },
      { key: s.nodes[u].entries[0].key, childId: u },
    ],
    external: false,
    x: 0,
    y: 0,
  }
  s.rootId = rootId
  s.height += 1
  rec.push(s, 4, `The root split into two nodes, so a new root above them adds a level: height is now ${s.height}.`, [{ id: rootId, highlight: 'new' }])
  return { steps: rec.steps, finalSnapshot: withLayout(s) }
}

export const bTreeOperations: OperationDefinition<BTreeState, unknown, BTreeSnapshot>[] = [
  { id: 'get', label: 'Get', inputKind: 'key', run: (s, k) => runGet(s, k as number) },
  { id: 'put', label: 'Put', inputKind: 'key', run: (s, k) => runPut(s, k as number) },
]
