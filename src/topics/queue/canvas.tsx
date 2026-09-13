// SPEC.md §10.7 canvas: `impl` selects the indexed slot row or the chain of nodes.
import { ArrayRow } from '@/components/visualizer/canvas/ArrayRow'
import { LinkedRow } from '@/components/visualizer/canvas/LinkedRow'
import { ARRAY_KIND, LINKED_KIND } from '@/components/visualizer/canvas/kinds'
import { chains } from '@/lib/linked-nodes'
import type { ArrayQueueSnapshot, LinkedQueueSnapshot, QueueSnapshot } from './types'

function ArrayCanvas({ snapshot }: { snapshot: ArrayQueueSnapshot }) {
  const { slots, first, last, n, highlight } = snapshot
  return (
    <ArrayRow
      ariaLabel={`Queue in a resizing array of ${slots.length} slots holding ${n} items`}
      cells={slots.map((v, i) => ({
        key: i,
        label: v === null ? '' : String(v),
        dashed: v === null,
        kind: highlight?.indices.includes(i) ? highlight.kind : undefined,
      }))}
      kindClass={ARRAY_KIND}
      pointers={[
        { name: 'first', index: first },
        { name: 'last', index: last },
      ]}
    />
  )
}

function LinkedCanvas({ snapshot }: { snapshot: LinkedQueueSnapshot }) {
  const { nodes, firstId, lastId, highlight } = snapshot
  const pointerNames = (id: string) => [firstId === id ? 'first' : null, lastId === id ? 'last' : null].filter((x): x is string => x !== null)
  return (
    <LinkedRow
      ariaLabel={`Queue as a linked list of ${Object.keys(nodes).length} nodes`}
      emptyText="first is null: the queue is empty."
      kindClass={LINKED_KIND}
      chains={chains(nodes, firstId).map((chain) =>
        chain.map((id) => ({
          id,
          label: String(nodes[id].value),
          pointers: pointerNames(id),
          kind: highlight?.ids.includes(id) ? highlight.kind : undefined,
        })),
      )}
    />
  )
}

export function QueueCanvas({ snapshot }: { snapshot: QueueSnapshot; variant?: string }) {
  return snapshot.impl === 'array' ? <ArrayCanvas snapshot={snapshot} /> : <LinkedCanvas snapshot={snapshot} />
}
