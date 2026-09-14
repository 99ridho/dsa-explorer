// SPEC.md §19.3 canvas: two labeled rows, the waiting orders as linked nodes and the served log as
// an indexed array with the live binary search window.
import { ArrayRow } from '@/components/visualizer/canvas/ArrayRow'
import { LinkedRow } from '@/components/visualizer/canvas/LinkedRow'
import { ARRAY_KIND, LINKED_KIND } from '@/components/visualizer/canvas/kinds'
import { chains } from '@/lib/linked-nodes'
import type { CanteenSnapshot } from './types'

const LOG_KIND: Record<string, string> = {
  ...ARRAY_KIND,
  current: 'border-accent bg-accent text-accent-foreground',
  found: 'border-chart-5 bg-chart-5/30',
}

export function CanteenCanvas({ snapshot }: { snapshot: CanteenSnapshot; variant?: string }) {
  const { design, nodes, firstId, lastId, log, n, highlight, range } = snapshot
  const pointerNames = (id: string) =>
    design === 'queue'
      ? [firstId === id ? 'first' : null, lastId === id ? 'last' : null].filter((x): x is string => x !== null)
      : firstId === id
        ? ['top']
        : []
  const pointers: { name: string; index: number }[] = []
  if (range) {
    pointers.push({ name: 'lo', index: range.lo })
    pointers.push({ name: 'hi', index: range.hi })
  }
  if (highlight?.kind === 'current' && highlight.indices && range) pointers.push({ name: 'mid', index: highlight.indices[0] })

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Waiting orders: {design === 'queue' ? 'queue' : 'stack'}</p>
        <LinkedRow
          ariaLabel={`${Object.keys(nodes).length} waiting orders in a linked ${design}`}
          emptyText="No orders are waiting."
          kindClass={LINKED_KIND}
          chains={chains(nodes, firstId).map((chain) =>
            chain.map((id) => ({
              id,
              label: String(nodes[id].value),
              pointers: pointerNames(id),
              kind: highlight?.ids?.includes(id) ? highlight.kind : undefined,
            })),
          )}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">
          Served log: {n} of {log.length} slots used
        </p>
        <ArrayRow
          ariaLabel={`Served log with ${n} orders in ${log.length} slots`}
          cells={log.map((v, i) => ({
            key: i,
            label: v === null ? '' : String(v),
            dashed: v === null,
            muted: range !== undefined && (i < range.lo || i > range.hi),
            kind: highlight?.indices?.includes(i) ? highlight.kind : undefined,
          }))}
          kindClass={LOG_KIND}
          pointers={pointers}
        />
      </div>
    </div>
  )
}
