// SPEC.md §10.11 canvas: `impl` selects the unordered chain of key-value nodes or the ordered
// key array with the live lo / mid / hi window.
import { ArrayRow } from '@/components/visualizer/canvas/ArrayRow'
import { LinkedRow } from '@/components/visualizer/canvas/LinkedRow'
import { LINKED_KIND } from '@/components/visualizer/canvas/kinds'
import { chains } from '@/lib/linked-nodes'
import type { BinarySnapshot, SearchingSnapshot, SequentialSnapshot } from './types'

const BINARY_KIND: Record<string, string> = {
  mid: 'border-accent bg-accent text-accent-foreground',
  found: 'border-chart-5 bg-chart-5/30',
  shift: 'border-chart-1 bg-chart-1/25',
  new: 'border-accent bg-accent text-accent-foreground',
  miss: 'border-destructive bg-destructive/15',
}

function SequentialCanvas({ snapshot }: { snapshot: SequentialSnapshot }) {
  const { nodes, firstId, highlight } = snapshot
  return (
    <LinkedRow
      ariaLabel={`Unordered list of ${Object.keys(nodes).length} key-value pairs`}
      emptyText="first is null: the table is empty."
      kindClass={LINKED_KIND}
      chains={chains(nodes, firstId).map((chain) =>
        chain.map((id) => ({
          id,
          label: String(nodes[id].key),
          sublabel: `val ${nodes[id].value}`,
          pointers: firstId === id ? ['first'] : [],
          kind: highlight?.ids.includes(id) ? highlight.kind : undefined,
        })),
      )}
    />
  )
}

function BinaryCanvas({ snapshot }: { snapshot: BinarySnapshot }) {
  const { keys, vals, highlight, range } = snapshot
  const pointers: { name: string; index: number }[] = []
  if (range) {
    pointers.push({ name: 'lo', index: range.lo })
    pointers.push({ name: 'hi', index: range.hi })
  }
  if (highlight?.kind === 'mid') pointers.push({ name: 'mid', index: highlight.indices[0] })
  return (
    <ArrayRow
      ariaLabel={`Ordered array of ${keys.length} keys`}
      emptyText="The table is empty: put a key."
      cells={keys.map((k, i) => ({
        key: i,
        label: String(k),
        sublabel: `val ${vals[i]}`,
        muted: range !== undefined && (i < range.lo || i > range.hi),
        kind: highlight?.indices.includes(i) ? highlight.kind : undefined,
      }))}
      kindClass={BINARY_KIND}
      pointers={pointers}
    />
  )
}

export function SearchingCanvas({ snapshot }: { snapshot: SearchingSnapshot; variant?: string }) {
  return snapshot.impl === 'sequential' ? <SequentialCanvas snapshot={snapshot} /> : <BinaryCanvas snapshot={snapshot} />
}
