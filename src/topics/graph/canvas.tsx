// SPEC.md §10.4 canvas: force-layout positions carried in the snapshot; arrowheads only when
// directed; vertex fill by traversal state or component; the reversed graph (Kosaraju phase 1) dimmed.
import { AnimatePresence, motion } from 'motion/react'
import type { EdgeState, GraphSnapshot, VertexState } from './types'

const R = 18
const PAD = 30

const VERTEX_FILL: Record<VertexState, string> = {
  unvisited: 'var(--color-card)',
  frontier: 'var(--color-accent)',
  visiting: 'var(--color-secondary)',
  visited: 'var(--color-muted)',
}
const COMPONENT_FILL = ['var(--color-chart-1)', 'var(--color-chart-2)', 'var(--color-chart-3)', 'var(--color-chart-4)', 'var(--color-chart-5)']
const EDGE_STROKE: Record<EdgeState, string> = {
  default: 'var(--color-border)',
  active: 'var(--color-accent)',
  tree: 'var(--color-primary)',
}

export function GraphCanvas({ snapshot }: { snapshot: GraphSnapshot; variant?: string }) {
  const { vertices, edges, directed } = snapshot
  const dimmed = snapshot.phase === 'reversed'

  if (vertices.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        The graph is empty. Add an edge such as 0-1 or press Randomize.
      </div>
    )
  }

  const byId = new Map(vertices.map((v) => [v.id, v]))
  const xs = vertices.map((v) => v.x)
  const ys = vertices.map((v) => v.y)
  // Fit the viewBox to the vertices so a small graph is not drawn tiny inside the full layout area.
  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD
  const maxX = Math.max(...xs) + PAD
  const maxY = Math.max(...ys) + PAD

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="h-auto w-full"
      style={{ maxHeight: 300 }}
      role="img"
      aria-label={`${directed ? 'Directed' : 'Undirected'} graph with ${vertices.length} vertices and ${edges.length} edges${dimmed ? ', edges reversed' : ''}`}
    >
      <defs>
        {(['default', 'active', 'tree'] as EdgeState[]).map((state) => (
          <marker key={state} id={`arrow-${state}`} viewBox="0 0 10 10" refX={10} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_STROKE[state]} />
          </marker>
        ))}
      </defs>
      {dimmed && (
        <text x={minX + 8} y={minY + 16} fontSize={12} fontFamily="var(--font-mono)" fill="var(--color-muted-foreground)">
          reversed graph
        </text>
      )}
      <g opacity={dimmed ? 0.55 : 1}>
        <AnimatePresence>
          {edges.map((e) => {
            const a = byId.get(e.from)
            const b = byId.get(e.to)
            if (!a || !b) return null
            const state = e.state ?? 'default'
            // Shorten directed edges so the arrowhead stops at the circle's rim.
            const dx = b.x - a.x
            const dy = b.y - a.y
            const len = Math.hypot(dx, dy) || 1
            const x2 = directed ? b.x - (dx / len) * (R + 2) : b.x
            const y2 = directed ? b.y - (dy / len) * (R + 2) : b.y
            return (
              <motion.line
                key={`${e.from}-${e.to}`}
                initial={{ opacity: 0, x1: a.x, y1: a.y, x2, y2 }}
                animate={{ opacity: 1, x1: a.x, y1: a.y, x2, y2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                stroke={EDGE_STROKE[state]}
                strokeWidth={state === 'tree' ? 3.5 : 2}
                markerEnd={directed ? `url(#arrow-${state})` : undefined}
              />
            )
          })}
        </AnimatePresence>
        <AnimatePresence>
          {vertices.map((v) => {
            const fill =
              v.component !== undefined ? COMPONENT_FILL[(v.component - 1) % COMPONENT_FILL.length] : VERTEX_FILL[v.state ?? 'unvisited']
            const light = v.component !== undefined || v.state === 'frontier' || v.state === 'visiting'
            return (
              <motion.g
                key={v.id}
                initial={{ x: v.x, y: v.y, scale: 0, opacity: 0 }}
                animate={{ x: v.x, y: v.y, scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <circle r={R} fill={fill} stroke="var(--color-border)" strokeWidth={2} />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={light ? 'var(--color-primary-foreground)' : 'var(--color-card-foreground)'}
                >
                  {v.label}
                </text>
                {v.component !== undefined && (
                  <text y={R + 11} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-muted-foreground)">
                    c{v.component}
                  </text>
                )}
              </motion.g>
            )
          })}
        </AnimatePresence>
      </g>
    </svg>
  )
}
