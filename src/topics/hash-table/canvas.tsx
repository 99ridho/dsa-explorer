// SPEC.md §10.3 canvas: `strategy` selects between ChainingCanvas (M rows, each a linked
// list of key boxes) and ProbingCanvas (a single row of M slots).
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { ChainingSnapshot, HashTableSnapshot, ProbingSnapshot } from './types'

const cellBase =
  'flex h-7 min-w-8 items-center justify-center rounded-md border-2 border-border bg-card px-1.5 font-mono text-xs font-bold'

function ChainingCanvas({ snapshot }: { snapshot: ChainingSnapshot }) {
  const { buckets, highlight } = snapshot
  return (
    <div className="space-y-0.5" role="list" aria-label={`Hash table with ${buckets.length} buckets, separate chaining`}>
      {buckets.map((bucket, i) => {
        const rowActive = highlight?.bucket === i
        return (
          <div
            key={i}
            role="listitem"
            className={cn('flex items-center gap-2 rounded-md px-1.5 py-0.5', rowActive && 'bg-accent/15')}
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 font-mono text-[11px]',
                rowActive ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground',
              )}
            >
              {i}
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5">
              <AnimatePresence initial={false}>
                {bucket.map((key, idx) => {
                  const cellActive = rowActive && highlight?.index === idx
                  return (
                    <motion.div
                      key={key}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-1"
                    >
                      {idx > 0 && <span className="h-0.5 w-3 shrink-0 bg-border" aria-hidden="true" />}
                      <div className={cn(cellBase, cellActive && 'border-accent bg-accent text-accent-foreground')}>{key}</div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {bucket.length === 0 && <span className="text-xs text-muted-foreground">empty</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const PROBE_CELL: Record<NonNullable<ProbingSnapshot['highlight']>['kind'], string> = {
  probing: 'border-accent bg-accent text-accent-foreground',
  found: 'border-chart-5 bg-chart-5/30',
  empty: 'border-dashed border-muted-foreground',
}

function ProbingCanvas({ snapshot }: { snapshot: ProbingSnapshot }) {
  const { slots, highlight } = snapshot
  return (
    <div className="flex flex-wrap gap-1.5" role="list" aria-label={`Hash table with ${slots.length} slots, linear probing`}>
      {slots.map((value, i) => {
        const kind = highlight?.index === i ? highlight.kind : undefined
        return (
          <div key={i} role="listitem" className="flex flex-col items-center gap-0.5">
            <motion.div
              layout
              className={cn(cellBase, 'h-9 w-9', value === null && 'border-dashed text-muted-foreground', kind && PROBE_CELL[kind])}
            >
              {value ?? ''}
            </motion.div>
            <span className="font-mono text-[10px] text-muted-foreground">{i}</span>
          </div>
        )
      })}
    </div>
  )
}

export function HashTableCanvas({ snapshot }: { snapshot: HashTableSnapshot; variant?: string }) {
  return snapshot.strategy === 'chaining' ? <ChainingCanvas snapshot={snapshot} /> : <ProbingCanvas snapshot={snapshot} />
}
