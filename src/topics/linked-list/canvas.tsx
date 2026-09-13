// SPEC.md §10.10 canvas: the chain from first, with any detached node on its own row.
import { LinkedRow } from '@/components/visualizer/canvas/LinkedRow'
import { chains } from '@/lib/linked-nodes'
import { LINKED_KIND } from '@/components/visualizer/canvas/kinds'
import type { LinkedListSnapshot } from './types'

export function LinkedListCanvas({ snapshot }: { snapshot: LinkedListSnapshot; variant?: string }) {
  const { nodes, firstId, lastId, highlight } = snapshot
  const pointerNames = (id: string) => [firstId === id ? 'first' : null, lastId === id ? 'last' : null].filter((x): x is string => x !== null)
  return (
    <LinkedRow
      ariaLabel={`Linked list of ${Object.keys(nodes).length} nodes`}
      emptyText="first is null: the list is empty."
      kindClass={LINKED_KIND}
      chains={chains(nodes, firstId).map((chain) =>
        chain.map((id) => ({ id, label: String(nodes[id].value), pointers: pointerNames(id), kind: highlight?.[id] })),
      )}
    />
  )
}
