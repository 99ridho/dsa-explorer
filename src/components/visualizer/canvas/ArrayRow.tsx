// One indexed row of boxes, shared by the array-backed topics (SPEC.md §10.6 to §10.9, §10.11).
// HTML flex rather than SVG because it is a table of boxes; it scrolls inside itself at 400px.
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export interface ArrayCell {
  key: string | number // stable across steps when a value moves, so Framer can animate it
  label: string
  sublabel?: string
  kind?: string
  dashed?: boolean
  muted?: boolean
}

export interface ArrayRowProps {
  cells: ArrayCell[]
  kindClass: Record<string, string>
  pointers?: { name: string; index: number }[]
  ariaLabel: string
  emptyText?: string
}

export const arrayCellBase =
  'flex h-9 min-w-9 items-center justify-center rounded-md border-2 border-border bg-card px-1.5 font-mono text-xs font-bold'

export function ArrayRow({ cells, kindClass, pointers = [], ariaLabel, emptyText }: ArrayRowProps) {
  if (cells.length === 0 && emptyText) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>
  }
  const hasPointers = pointers.length > 0
  return (
    <div className="overflow-x-auto" role="list" aria-label={ariaLabel}>
      <div className="flex w-max gap-1.5 py-0.5">
        {cells.map((cell, i) => {
          const names = pointers.filter((p) => p.index === i).map((p) => p.name)
          return (
            <div key={cell.key} role="listitem" className="flex flex-col items-center gap-0.5">
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                  arrayCellBase,
                  cell.dashed && 'border-dashed text-muted-foreground',
                  cell.muted && 'opacity-60',
                  cell.kind && kindClass[cell.kind],
                )}
              >
                {cell.label}
              </motion.div>
              {cell.sublabel !== undefined && <span className="font-mono text-[10px] text-muted-foreground">{cell.sublabel}</span>}
              <span className="font-mono text-[10px] text-muted-foreground">{i}</span>
              {hasPointers && (
                <span className="h-3.5 font-mono text-[10px] font-semibold text-accent">{names.join(', ')}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
