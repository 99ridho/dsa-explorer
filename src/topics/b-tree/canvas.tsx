// SPEC.md §10.12 canvas: each node is a horizontal run of key boxes; an internal entry links
// down to its child. viewBox-scaled SVG, no fixed pixel size (§12).
import { motion } from 'motion/react'
import { ENTRY_H, ENTRY_W, nodeWidth } from './operations'
import type { BTreeHighlight, BTreeSnapshot } from './types'

const PAD = 16

const NODE_STROKE: Record<BTreeHighlight, string> = {
  current: 'var(--color-chart-1)',
  found: 'var(--color-chart-5)',
  new: 'var(--color-accent)',
  split: 'var(--color-chart-4)',
}

const ENTRY_FILL: Record<BTreeHighlight, string> = {
  current: 'var(--color-chart-1)',
  found: 'var(--color-chart-5)',
  new: 'var(--color-accent)',
  split: 'var(--color-chart-4)',
}

export function BTreeCanvas({ snapshot }: { snapshot: BTreeSnapshot; variant?: string }) {
  const nodes = Object.values(snapshot.nodes)
  const left = (n: (typeof nodes)[number]) => n.x - nodeWidth(n.entries.length) / 2
  const minX = Math.min(...nodes.map(left)) - PAD
  const maxX = Math.max(...nodes.map((n) => left(n) + nodeWidth(n.entries.length))) + PAD
  const maxY = Math.max(...nodes.map((n) => n.y)) + ENTRY_H + PAD
  const width = maxX - minX
  const height = maxY + PAD

  return (
    <svg
      viewBox={`${minX} ${-PAD} ${width} ${height}`}
      className="h-auto w-full"
      style={{ maxHeight: 300 }}
      role="img"
      aria-label={`B-tree with ${snapshot.n} keys, height ${snapshot.height}`}
    >
      {nodes.map((node) =>
        node.entries.map((entry, j) => {
          if (entry.childId === null) return null
          const child = snapshot.nodes[entry.childId]
          if (!child) return null
          const x1 = left(node) + j * ENTRY_W + ENTRY_W / 2
          return (
            <motion.line
              key={`${node.id}-${j}`}
              initial={{ x1, y1: node.y + ENTRY_H, x2: child.x, y2: child.y }}
              animate={{ x1, y1: node.y + ENTRY_H, x2: child.x, y2: child.y }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              stroke="var(--color-border)"
              strokeWidth={2}
            />
          )
        }),
      )}
      {nodes.map((node) => {
        const x0 = left(node)
        const stroke = node.highlight ? NODE_STROKE[node.highlight] : 'var(--color-foreground)'
        return (
          <motion.g
            key={node.id}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {node.entries.length === 0 && (
              <rect x={x0} y={node.y} width={ENTRY_W} height={ENTRY_H} rx={4} fill="none" stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeWidth={1.5} />
            )}
            {node.entries.map((entry, j) => {
              const marked = node.highlight && node.entryIndex === j
              const fill = marked ? ENTRY_FILL[node.highlight!] : node.external ? 'var(--color-card)' : 'var(--color-muted)'
              return (
                <g key={j}>
                  <rect x={x0 + j * ENTRY_W} y={node.y} width={ENTRY_W} height={ENTRY_H} fill={fill} stroke={stroke} strokeWidth={node.highlight ? 2.5 : 1.5} />
                  <text
                    x={x0 + j * ENTRY_W + ENTRY_W / 2}
                    y={node.y + ENTRY_H / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fontFamily="var(--font-mono)"
                    fontWeight={node.external ? 700 : 500}
                    fill={marked && node.highlight === 'current' ? 'var(--color-background)' : 'var(--color-foreground)'}
                  >
                    {entry.key}
                  </text>
                </g>
              )
            })}
          </motion.g>
        )
      })}
    </svg>
  )
}
