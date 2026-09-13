// SPEC.md §10.1 canvas — SVG tree, viewBox-scaled (§12), nodes animated between snapshots.
import { AnimatePresence, motion } from 'motion/react'
import type { BSTHighlight, BSTSnapshot } from './types'

const NODE_R = 20
const PAD = 32

const HIGHLIGHT_FILL: Record<BSTHighlight, string> = {
  current: 'var(--color-accent)',
  new: 'var(--color-secondary)',
  found: 'var(--color-chart-5)',
  'delete-target': 'var(--color-destructive)',
}

const HIGHLIGHT_TEXT: Record<BSTHighlight, string> = {
  current: 'var(--color-accent-foreground)',
  new: 'var(--color-secondary-foreground)',
  found: 'var(--color-foreground)',
  'delete-target': 'var(--color-destructive-foreground)',
}

export function TreeCanvas({ snapshot }: { snapshot: BSTSnapshot }) {
  const nodes = Object.values(snapshot.nodes)

  if (nodes.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Tree is empty — insert a key or press Randomize.
      </div>
    )
  }

  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const minX = Math.min(...xs) - PAD
  const maxX = Math.max(...xs) + PAD
  const minY = Math.min(...ys) - PAD
  const maxY = Math.max(...ys) + PAD
  const width = maxX - minX
  const height = maxY - minY

  const edges = nodes.flatMap((n) =>
    [n.left, n.right]
      .filter((c): c is string => c !== null && c in snapshot.nodes)
      .map((childId) => ({ id: `${n.id}-${childId}`, from: n, to: snapshot.nodes[childId] })),
  )

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      className="h-auto w-full"
      style={{ maxHeight: 420 }}
      role="img"
      aria-label={`Binary search tree with ${nodes.length} nodes`}
    >
      <g stroke="var(--color-border)" strokeWidth={2}>
        <AnimatePresence>
          {edges.map((e) => (
            <motion.line
              key={e.id}
              initial={{ opacity: 0, x1: e.from.x, y1: e.from.y, x2: e.to.x, y2: e.to.y }}
              animate={{ opacity: 1, x1: e.from.x, y1: e.from.y, x2: e.to.x, y2: e.to.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          ))}
        </AnimatePresence>
      </g>
      <AnimatePresence>
        {nodes.map((n) => {
          const fill = n.highlight ? HIGHLIGHT_FILL[n.highlight] : 'var(--color-card)'
          const text = n.highlight ? HIGHLIGHT_TEXT[n.highlight] : 'var(--color-card-foreground)'
          return (
            <motion.g
              key={n.id}
              initial={{ x: n.x, y: n.y, scale: 0, opacity: 0 }}
              animate={{ x: n.x, y: n.y, scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            >
              <circle r={NODE_R} fill={fill} stroke="var(--color-border)" strokeWidth={2} />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fontFamily="var(--font-mono)"
                fill={text}
              >
                {n.key}
              </text>
            </motion.g>
          )
        })}
      </AnimatePresence>
    </svg>
  )
}
