// Shared node shape and chain helpers for the linked-list style topics (SPEC.md §10.7, §10.8, §10.10, §10.11).
// Snapshots keep real links so a step can show a node that exists but is not yet reachable.

export interface LinkedNode {
  id: string
  value: number
  next: string | null
}

export const nodeId = (n: number) => `n${n}`

/** Ids reachable from `firstId` by following `next`, in chain order. Stops if a link loops. */
export function walk<N extends { next: string | null }>(nodes: Record<string, N>, firstId: string | null): string[] {
  const order: string[] = []
  const seen = new Set<string>()
  let id = firstId
  while (id !== null && nodes[id] && !seen.has(id)) {
    seen.add(id)
    order.push(id)
    id = nodes[id].next
  }
  return order
}

/**
 * Every chain in the snapshot: the one from `firstId` first (possibly empty), then one per
 * node that nothing points at, so a detached node is drawn as its own row.
 */
export function chains<N extends { next: string | null }>(nodes: Record<string, N>, firstId: string | null): string[][] {
  const main = walk(nodes, firstId)
  const placed = new Set(main)
  const pointedAt = new Set<string>()
  for (const node of Object.values(nodes)) if (node.next !== null) pointedAt.add(node.next)
  const result = [main]
  for (const id of Object.keys(nodes)) {
    if (placed.has(id) || pointedAt.has(id)) continue
    const chain = walk(nodes, id).filter((x) => !placed.has(x))
    for (const x of chain) placed.add(x)
    result.push(chain)
  }
  return result
}

/** "1 item", "2 items": narration never says "1 items". */
export const plural = (n: number, noun: string) => `${n} ${n === 1 ? noun : `${noun}s`}`
