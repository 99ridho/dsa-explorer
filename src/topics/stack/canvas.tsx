// SPEC.md §10.8 canvas: `impl` selects the slot row or the chain of nodes; the evaluate view
// replaces it with the token strip and the two stacks the algorithm drives.
import { motion } from 'motion/react'
import { ArrayRow, arrayCellBase } from '@/components/visualizer/canvas/ArrayRow'
import { LinkedRow } from '@/components/visualizer/canvas/LinkedRow'
import { chains } from '@/lib/linked-nodes'
import { cn } from '@/lib/utils'
import { ARRAY_KIND, LINKED_KIND } from '@/components/visualizer/canvas/kinds'
import type { ArrayStackSnapshot, EvalView, LinkedStackSnapshot, StackSnapshot } from './types'

function ArrayCanvas({ snapshot }: { snapshot: ArrayStackSnapshot }) {
  const { slots, n, highlight } = snapshot
  return (
    <ArrayRow
      ariaLabel={`Stack in a resizing array of ${slots.length} slots holding ${n} items`}
      cells={slots.map((v, i) => ({
        key: i,
        label: v === null ? '' : String(v),
        dashed: v === null,
        kind: highlight?.indices.includes(i) ? highlight.kind : undefined,
      }))}
      kindClass={ARRAY_KIND}
      pointers={n > 0 ? [{ name: 'top', index: n - 1 }] : []}
    />
  )
}

function LinkedCanvas({ snapshot }: { snapshot: LinkedStackSnapshot }) {
  const { nodes, firstId, highlight } = snapshot
  return (
    <LinkedRow
      ariaLabel={`Stack as a linked list of ${Object.keys(nodes).length} nodes`}
      emptyText="first is null: the stack is empty."
      kindClass={LINKED_KIND}
      chains={chains(nodes, firstId).map((chain) =>
        chain.map((id) => ({
          id,
          label: String(nodes[id].value),
          pointers: firstId === id ? ['first'] : [],
          kind: highlight?.ids.includes(id) ? highlight.kind : undefined,
        })),
      )}
    />
  )
}

function Column({ name, items, active }: { name: string; items: string[]; active: boolean }) {
  return (
    <div className="flex min-w-24 flex-col items-center gap-1" role="list" aria-label={`${name} stack`}>
      <span className={cn('text-xs font-medium', active ? 'text-accent' : 'text-muted-foreground')}>{name}</span>
      <div className="flex flex-col-reverse gap-1">
        {items.map((item, i) => (
          <motion.div
            key={`${i}-${item}`}
            role="listitem"
            layout
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(arrayCellBase, 'min-w-16', active && i === items.length - 1 && 'border-accent bg-accent text-accent-foreground')}
          >
            {item}
          </motion.div>
        ))}
        {items.length === 0 && <div className={cn(arrayCellBase, 'min-w-16 border-dashed text-muted-foreground')}>empty</div>}
      </div>
    </div>
  )
}

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2))

function EvalCanvas({ view }: { view: EvalView }) {
  const { tokens, cursor, operands, operators, focus } = view
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1" aria-label="Expression tokens">
        {tokens.map((t, i) => (
          <span
            key={i}
            className={cn(
              'rounded-md border px-1.5 py-0.5 font-mono text-xs',
              i === cursor ? 'border-accent bg-accent text-accent-foreground' : i < cursor ? 'border-border text-muted-foreground' : 'border-border',
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex justify-center gap-8">
        <Column name="operands" items={operands.map(fmt)} active={focus === 'operand' || focus === 'apply'} />
        <Column name="operators" items={operators} active={focus === 'operator' || focus === 'apply'} />
      </div>
    </div>
  )
}

export function StackCanvas({ snapshot }: { snapshot: StackSnapshot; variant?: string }) {
  if (snapshot.eval) return <EvalCanvas view={snapshot.eval} />
  return snapshot.impl === 'array' ? <ArrayCanvas snapshot={snapshot} /> : <LinkedCanvas snapshot={snapshot} />
}
