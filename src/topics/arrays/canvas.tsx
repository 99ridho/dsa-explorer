// SPEC.md §10.6 canvas: the array as a row of slots, and the new array underneath while a resize copies.
import { ArrayRow } from '@/components/visualizer/canvas/ArrayRow'
import type { ArraysSnapshot } from './types'

const KIND: Record<string, string> = {
  read: 'border-chart-5 bg-chart-5/30',
  write: 'border-accent bg-accent text-accent-foreground',
  copy: 'border-chart-1 bg-chart-1/25',
  error: 'border-destructive bg-destructive/15',
}

export function ArraysCanvas({ snapshot }: { snapshot: ArraysSnapshot; variant?: string }) {
  const { values, highlight, resizing } = snapshot
  return (
    <div className="space-y-3">
      <ArrayRow
        ariaLabel={`int array of length ${values.length}`}
        emptyText="The array has no slots: create one from a list."
        cells={values.map((v, i) => ({ key: i, label: String(v), kind: highlight?.indices.includes(i) ? highlight.kind : undefined }))}
        kindClass={KIND}
      />
      {resizing && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">copy, length {resizing.values.length}</p>
          <ArrayRow
            ariaLabel={`new array of length ${resizing.values.length}, ${resizing.copied} copied`}
            cells={resizing.values.map((v, i) => ({
              key: i,
              label: String(v),
              muted: i >= resizing.copied,
              kind: highlight?.kind === 'copy' && highlight.indices.includes(i) ? 'copy' : undefined,
            }))}
            kindClass={KIND}
          />
        </div>
      )}
    </div>
  )
}
