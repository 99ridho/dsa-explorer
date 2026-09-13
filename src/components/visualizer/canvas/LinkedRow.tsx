// Chains of node boxes joined by next arrows, shared by the linked topics (SPEC.md §10.7, §10.8, §10.10, §10.11).
// The first chain starts at `first`; any further chain is unreachable and sits on its own row.
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { arrayCellBase } from './ArrayRow'

export interface LinkedRowItem {
  id: string
  label: string
  sublabel?: string
  kind?: string
  pointers?: string[] // names drawn above the node, e.g. first, last, top
}

export interface LinkedRowProps {
  chains: LinkedRowItem[][]
  kindClass: Record<string, string>
  ariaLabel: string
  emptyText: string
}

function NextArrow() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true" className="shrink-0 text-muted-foreground">
      <line x1="0" y1="6" x2="15" y2="6" stroke="currentColor" strokeWidth="2" />
      <polygon points="14,1 21,6 14,11" fill="currentColor" />
    </svg>
  )
}

function Chain({ items, kindClass }: { items: LinkedRowItem[]; kindClass: Record<string, string> }) {
  return (
    <div className="flex w-max items-end gap-1 py-0.5">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            className="flex items-end gap-1"
            role="listitem"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="h-3.5 font-mono text-[10px] font-semibold text-accent">{item.pointers?.join(', ')}</span>
              <div className={cn(arrayCellBase, item.kind && kindClass[item.kind])}>{item.label}</div>
              <span className="h-3.5 font-mono text-[10px] text-muted-foreground">{item.sublabel}</span>
            </div>
            <div className="pb-4">
              <NextArrow />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex flex-col items-center gap-0.5">
        <span className="h-3.5" />
        <div className={cn(arrayCellBase, 'border-dashed text-muted-foreground')}>null</div>
        <span className="h-3.5" />
      </div>
    </div>
  )
}

export function LinkedRow({ chains, kindClass, ariaLabel, emptyText }: LinkedRowProps) {
  const [main, ...rest] = chains
  const detached = rest.filter((c) => c.length > 0)
  return (
    <div className="space-y-1" role="list" aria-label={ariaLabel}>
      {main.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <Chain items={main} kindClass={kindClass} />
        </div>
      )}
      {detached.map((chain) => (
        <div key={chain[0].id} className="overflow-x-auto">
          <Chain items={chain} kindClass={kindClass} />
        </div>
      ))}
    </div>
  )
}
