// SPEC.md §19.1 canvas: one part of the planner (code index, digraph, or plan) under a view switch that
// follows the step. Every view takes the same height, so switching parts never resizes the card.
import { FocusCaption } from '@/components/case-study/FocusCaption'
import { useFollowedView } from '@/lib/use-followed-view'
import { cn } from '@/lib/utils'
import { GraphCanvas } from '@/topics/graph/canvas'
import type { StudyPlanSnapshot } from './types'

const HEIGHT = 320
type Part = StudyPlanSnapshot['focus']

const cell = 'flex h-6 min-w-10 items-center justify-center rounded-md border-2 border-border bg-card px-1 font-mono text-[11px] font-bold'

function IndexView({ snapshot }: { snapshot: StudyPlanSnapshot }) {
  const { buckets, highlight } = snapshot
  return (
    <div className="space-y-0.5" role="list" aria-label={`Code index with ${buckets.length} buckets`}>
      {buckets.map((bucket, i) => {
        const rowActive = highlight?.bucket === i
        return (
          <div key={i} role="listitem" className={cn('flex items-center gap-2 rounded-md px-1 py-px', rowActive && 'bg-accent/15')}>
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 font-mono text-[10px]',
                rowActive ? 'border-accent bg-accent text-accent-foreground' : 'border-border text-muted-foreground',
              )}
            >
              {i}
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {bucket.map((e, idx) => (
                <span key={e.code} className="flex items-center gap-1">
                  {idx > 0 && <span className="h-0.5 w-2 shrink-0 bg-border" aria-hidden="true" />}
                  <span className={cn(cell, rowActive && highlight?.index === idx && 'border-accent bg-accent text-accent-foreground')}>
                    {e.code}
                    <span className="ml-1 font-normal text-muted-foreground">{e.v}</span>
                  </span>
                </span>
              ))}
              {bucket.length === 0 && <span className="text-[11px] text-muted-foreground">empty</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PlanRow({ order, late }: { order: string[]; late: string[] }) {
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Study plan in order">
      {order.map((code, i) => {
        const isLate = late.includes(code)
        return (
          <li key={code} className="flex flex-col items-center gap-0.5">
            <span className={cn(cell, 'h-8 min-w-11', isLate ? 'border-destructive bg-destructive/15' : 'border-chart-5 bg-chart-5/30')}>
              {code}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{isLate ? `${i + 1} late` : i + 1}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function StudyPlanCanvas({ snapshot }: { snapshot: StudyPlanSnapshot; variant?: string }) {
  const { focus, plan } = snapshot
  const [picked, setPicked] = useFollowedView<Part>(focus)
  // A plan exists only on the steps that build one; scrubbing away from them falls back to the step's view.
  const view: Part = picked === 'plan' && !plan ? focus : picked
  const parts = [
    { key: 'index' as const, label: 'Code index' },
    { key: 'graph' as const, label: 'Prerequisite digraph' },
    { key: 'plan' as const, label: 'Study plan', disabled: !plan },
  ]
  return (
    <div>
      <FocusCaption parts={parts} focus={focus} view={view} onSelect={setPicked} />
      <div style={{ height: HEIGHT }} className="flex flex-col gap-3 overflow-hidden">
        {view === 'index' && <IndexView snapshot={snapshot} />}
        {view !== 'index' && (
          <div className={cn('min-h-0 flex-1', view === 'plan' ? '[&_svg]:max-h-52!' : '[&_svg]:max-h-[300px]!')}>
            <GraphCanvas snapshot={snapshot.graph} />
          </div>
        )}
        {view === 'plan' && plan && <PlanRow order={plan.order} late={plan.late} />}
      </div>
    </div>
  )
}
