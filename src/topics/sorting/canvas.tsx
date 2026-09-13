// SPEC.md §10.9 canvas: one row of boxes; the sorted prefix is green, the live compare or exchange on top.
import { ArrayRow } from '@/components/visualizer/canvas/ArrayRow'
import type { SortingSnapshot } from './types'

const KIND: Record<string, string> = {
  comparing: 'border-chart-1 bg-chart-1/25',
  exchanging: 'border-accent bg-accent text-accent-foreground',
  marked: 'border-chart-4 bg-chart-4/30',
  sorted: 'border-chart-5 bg-chart-5/30',
}

/** Values may repeat, so the key is the value plus its occurrence: a swap still animates. */
function keys(array: number[]): string[] {
  const seen = new Map<number, number>()
  return array.map((v) => {
    const n = (seen.get(v) ?? 0) + 1
    seen.set(v, n)
    return `${v}-${n}`
  })
}

export function SortingCanvas({ snapshot }: { snapshot: SortingSnapshot; variant?: string }) {
  const { array, highlight, sortedUpTo = 0 } = snapshot
  const ks = keys(array)
  return (
    <ArrayRow
      ariaLabel={`Array of ${array.length} items to sort`}
      emptyText="The array is empty: load some values."
      cells={array.map((v, i) => ({
        key: ks[i],
        label: String(v),
        kind: highlight?.indices.includes(i) ? highlight.kind : i < sortedUpTo ? 'sorted' : undefined,
      }))}
      kindClass={KIND}
    />
  )
}
