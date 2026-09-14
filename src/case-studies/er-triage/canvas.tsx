// SPEC.md §19.2 canvas: the waiting list (heap tree or arrival row) or the B-tree archive under a view
// switch that follows the step. Both views take the B-tree canvas's fixed height, so the card never resizes.
import { motion } from 'motion/react'
import { FocusCaption } from '@/components/case-study/FocusCaption'
import { useFollowedView } from '@/lib/use-followed-view'
import { ArrayRow } from '@/components/visualizer/canvas/ArrayRow'
import { layoutBinaryTree } from '@/lib/layout/tree-layout'
import { BTreeCanvas } from '@/topics/b-tree/canvas'
import type { TriageSnapshot } from './types'

const HEIGHT = 300
const BOX_W = 64
const BOX_H = 34
const PAD = 24

type Part = TriageSnapshot['focus']

type Kind = NonNullable<TriageSnapshot['highlight']>['kind']

const FILL: Record<Kind, string> = {
  new: 'var(--color-accent)',
  compare: 'var(--color-chart-1)',
  swap: 'var(--color-secondary)',
  treat: 'var(--color-chart-5)',
}
const TEXT: Record<Kind, string> = {
  new: 'var(--color-accent-foreground)',
  compare: 'var(--color-card-foreground)',
  swap: 'var(--color-secondary-foreground)',
  treat: 'var(--color-card-foreground)',
}

const ROW_KIND: Record<string, string> = {
  new: 'border-accent bg-accent text-accent-foreground',
  treat: 'border-destructive bg-destructive/15',
}

function HeapView({ snapshot }: { snapshot: TriageSnapshot }) {
  const { waiting, highlight } = snapshot
  const n = waiting.length
  if (n === 0) {
    return <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Nobody is waiting. Admit a patient.</p>
  }
  const positions = layoutBinaryTree<number>(1, (k) => ({ left: 2 * k <= n ? 2 * k : null, right: 2 * k + 1 <= n ? 2 * k + 1 : null }), {
    hGap: BOX_W + 10,
    vGap: 66,
  })
  const ks = Object.keys(positions).map(Number)
  const xs = ks.map((k) => positions[k].x)
  const ys = ks.map((k) => positions[k].y)
  const minX = Math.min(...xs) - BOX_W / 2 - PAD
  const maxX = Math.max(...xs) + BOX_W / 2 + PAD
  const minY = Math.min(...ys) - BOX_H / 2 - PAD
  const maxY = Math.max(...ys) + BOX_H / 2 + PAD

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="w-full"
      style={{ height: HEIGHT }}
      role="img"
      aria-label={`Max heap of ${n} waiting patients; the most urgent is #${waiting[0].arrival}`}
    >
      <g stroke="var(--color-border)" strokeWidth={2}>
        {ks
          .filter((k) => k > 1)
          .map((k) => {
            const p = positions[Math.floor(k / 2)]
            const c = positions[k]
            return (
              <motion.line
                key={`e${k}`}
                initial={{ x1: p.x, y1: p.y, x2: c.x, y2: c.y }}
                animate={{ x1: p.x, y1: p.y, x2: c.x, y2: c.y }}
                transition={{ duration: 0.3 }}
              />
            )
          })}
      </g>
      {ks.map((k) => {
        const patient = waiting[k - 1]
        const kind = highlight?.positions.includes(k) ? highlight.kind : undefined
        const { x, y } = positions[k]
        return (
          // Keyed by arrival number, so a patient slides between positions as it swims or sinks.
          <motion.g
            key={patient.arrival}
            initial={{ x, y, opacity: 0 }}
            animate={{ x, y, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <rect
              x={-BOX_W / 2}
              y={-BOX_H / 2}
              width={BOX_W}
              height={BOX_H}
              rx={6}
              fill={kind ? FILL[kind] : 'var(--color-card)'}
              stroke={patient.severity === 5 ? 'var(--color-destructive)' : 'var(--color-border)'}
              strokeWidth={2}
            />
            <text y={-5} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="var(--font-mono)" fill={kind ? TEXT[kind] : 'var(--color-card-foreground)'}>
              #{patient.arrival}
            </text>
            <text y={10} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill={kind ? TEXT[kind] : 'var(--color-muted-foreground)'}>
              S{patient.severity} R{patient.record}
            </text>
            <text y={BOX_H / 2 + 11} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-muted-foreground)">
              {k}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function QueueView({ snapshot }: { snapshot: TriageSnapshot }) {
  const { waiting, highlight } = snapshot
  return (
    <div className="flex h-full items-center">
      <div className="w-full">
        <ArrayRow
          ariaLabel={`Queue of ${waiting.length} waiting patients in arrival order`}
          emptyText="Nobody is waiting. Admit a patient."
          cells={waiting.map((p, i) => ({
            key: p.arrival,
            label: `#${p.arrival}`,
            sublabel: `S${p.severity} R${p.record}`,
            kind: highlight?.positions.includes(i) ? highlight.kind : undefined,
          }))}
          kindClass={ROW_KIND}
          pointers={waiting.length > 0 ? [{ name: 'first', index: 0 }] : []}
        />
      </div>
    </div>
  )
}

export function TriageCanvas({ snapshot }: { snapshot: TriageSnapshot; variant?: string }) {
  const [view, setView] = useFollowedView<Part>(snapshot.focus)
  const parts = [
    { key: 'triage' as const, label: snapshot.mode === 'priority' ? 'Waiting list: max heap' : 'Waiting list: queue' },
    { key: 'archive' as const, label: 'Record archive: B-tree' },
  ]
  return (
    <div>
      <FocusCaption parts={parts} focus={snapshot.focus} view={view} onSelect={setView} />
      <div style={{ height: HEIGHT }}>
        {view === 'archive' ? (
          <BTreeCanvas snapshot={snapshot.archive} />
        ) : snapshot.mode === 'priority' ? (
          <HeapView snapshot={snapshot} />
        ) : (
          <QueueView snapshot={snapshot} />
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">#: arrival number. S: severity. R: record number, the key in the archive.</p>
    </div>
  )
}
