// SPEC.md §10.2 canvas: dual view. The tree (children of k at 2k, 2k+1) above the
// underlying array, so students see the array-as-tree representation directly.
import { AnimatePresence, motion } from 'motion/react'
import { layoutBinaryTree } from '@/lib/layout/tree-layout'
import { cn } from '@/lib/utils'
import type { HeapSnapshot } from './types'

const NODE_R = 18
const PAD = 30

type Kind = NonNullable<HeapSnapshot['highlight']>['kind']

const FILL: Record<Kind, string> = {
  comparing: 'var(--color-accent)',
  swapping: 'var(--color-secondary)',
  sorted: 'var(--color-chart-5)',
}

const CELL: Record<Kind, string> = {
  comparing: 'bg-accent text-accent-foreground border-accent',
  swapping: 'bg-secondary text-secondary-foreground border-secondary',
  sorted: 'bg-chart-5/30 border-chart-5',
}

function kindAt(snapshot: HeapSnapshot, index: number): Kind | undefined {
  return snapshot.highlight?.indices.includes(index) ? snapshot.highlight.kind : undefined
}

export function HeapCanvas({ snapshot }: { snapshot: HeapSnapshot }) {
  const { array, n } = snapshot
  const values = array.slice(1)

  if (values.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        The heap is empty. Insert a value, build one from an array, or press Randomize.
      </div>
    )
  }

  const positions = layoutBinaryTree<number>(n >= 1 ? 1 : null, (k) => ({
    left: 2 * k <= n ? 2 * k : null,
    right: 2 * k + 1 <= n ? 2 * k + 1 : null,
  }), { hGap: 46, vGap: 60 })
  const indices = Object.keys(positions).map(Number)
  const xs = indices.map((k) => positions[k].x)
  const ys = indices.map((k) => positions[k].y)
  const minX = (xs.length ? Math.min(...xs) : 0) - PAD
  const maxX = (xs.length ? Math.max(...xs) : 0) + PAD
  const minY = (ys.length ? Math.min(...ys) : 0) - PAD
  const maxY = (ys.length ? Math.max(...ys) : 0) + PAD

  return (
    <div className="space-y-4">
      {n >= 1 ? (
        <svg
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          className="w-full"
          style={{ height: 200 }}
          role="img"
          aria-label={`${snapshot.mode === 'max' ? 'Max' : 'Min'} heap with ${n} elements`}
        >
          <g stroke="var(--color-border)" strokeWidth={2}>
            {indices.map((k) =>
              [2 * k, 2 * k + 1]
                .filter((c) => c <= n)
                .map((c) => (
                  <motion.line
                    key={`${k}-${c}`}
                    initial={{ x1: positions[k].x, y1: positions[k].y, x2: positions[c].x, y2: positions[c].y }}
                    animate={{ x1: positions[k].x, y1: positions[k].y, x2: positions[c].x, y2: positions[c].y }}
                    transition={{ duration: 0.3 }}
                  />
                )),
            )}
          </g>
          <AnimatePresence>
            {indices.map((k) => {
              const kind = kindAt(snapshot, k)
              return (
                <motion.g
                  key={k}
                  initial={{ x: positions[k].x, y: positions[k].y, scale: 0, opacity: 0 }}
                  animate={{ x: positions[k].x, y: positions[k].y, scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                  <circle r={NODE_R} fill={kind ? FILL[kind] : 'var(--color-card)'} stroke="var(--color-border)" strokeWidth={2} />
                  <text textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--color-card-foreground)">
                    {array[k]}
                  </text>
                  <text y={NODE_R + 11} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-muted-foreground)">
                    {k}
                  </text>
                </motion.g>
              )
            })}
          </AnimatePresence>
        </svg>
      ) : (
        // Same height as the tree, so the last step of heapsort does not shrink the card and move the page (§12).
        <p className="flex items-center justify-center text-center text-sm text-muted-foreground" style={{ height: 200 }}>
          The heap is empty. The array below is fully sorted.
        </p>
      )}

      <div className="overflow-x-auto">
        <div className="flex gap-1 font-mono text-sm" role="list" aria-label="Heap array">
          {values.map((v, i) => {
            const k = i + 1
            const kind = kindAt(snapshot, k)
            const outside = k > n
            return (
              <div key={k} role="listitem" className="flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-md border-2 border-border bg-card font-bold',
                    outside && !kind && 'border-dashed text-muted-foreground opacity-60',
                    kind && CELL[kind],
                  )}
                >
                  {v}
                </div>
                <span className="text-[10px] text-muted-foreground">{k}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
