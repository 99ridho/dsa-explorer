// SPEC.md §10.5 canvas: a table of N, accesses, ratio, and a bar chart of the ratios against the
// expected limit for the chosen problem. Plain SVG, no chart library.
import { cn } from '@/lib/utils'
import { PROBLEM } from './operations'
import type { ComplexitySnapshot } from './types'

const fmt = (x: number) => x.toLocaleString('en-US')
const CHART_W = 320
const CHART_H = 110
const PAD_L = 28
const PAD_B = 18

function RatioChart({ snapshot }: { snapshot: ComplexitySnapshot }) {
  const rows = snapshot.rows.filter((r) => r.ratio !== null)
  const expected = PROBLEM[snapshot.problem].expected
  if (rows.length === 0) return null
  const maxRatio = Math.max(expected * 1.25, ...rows.map((r) => r.ratio!))
  const innerW = CHART_W - PAD_L - 8
  const innerH = CHART_H - PAD_B - 6
  const slot = innerW / rows.length
  const barW = Math.min(28, slot * 0.6)
  const yOf = (v: number) => 6 + innerH - (v / maxRatio) * innerH
  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="h-auto w-full max-w-sm" role="img" aria-label={`Ratio per doubling, expected ${expected}`}>
      <line x1={PAD_L} y1={yOf(expected)} x2={CHART_W - 4} y2={yOf(expected)} stroke="var(--color-muted-foreground)" strokeDasharray="4 3" strokeWidth={1} />
      <text x={PAD_L - 4} y={yOf(expected)} textAnchor="end" dominantBaseline="central" fontSize={10} fill="var(--color-muted-foreground)">
        {expected}
      </text>
      {rows.map((r, i) => {
        const index = snapshot.rows.indexOf(r)
        const x = PAD_L + i * slot + (slot - barW) / 2
        const active = snapshot.highlight === index
        return (
          <g key={r.n}>
            <rect x={x} y={yOf(r.ratio!)} width={barW} height={6 + innerH - yOf(r.ratio!)} rx={2} fill={active ? 'var(--color-accent)' : 'var(--color-chart-1)'} />
            <text x={x + barW / 2} y={CHART_H - 4} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill="var(--color-muted-foreground)">
              {fmt(r.n)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function ComplexityCanvas({ snapshot }: { snapshot: ComplexitySnapshot; variant?: string }) {
  const { rows, highlight, problem } = snapshot
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <div className="min-w-0 flex-1 overflow-x-auto">
        <table className="w-full text-xs" aria-label={`Array accesses of brute-force ${problem} as N doubles`}>
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-2 py-1 font-medium">N</th>
              <th className="px-2 py-1 font-medium">array accesses</th>
              <th className="px-2 py-1 font-medium">ratio</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r, i) => (
              <tr key={r.n} className={cn('border-t border-border', highlight === i && 'bg-accent text-accent-foreground')}>
                <td className="px-2 py-1">{fmt(r.n)}</td>
                <td className="px-2 py-1">{fmt(r.accesses)}</td>
                <td className="px-2 py-1">{r.ratio === null ? '' : r.ratio.toFixed(2)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-muted-foreground">
                  No rows yet: run the doubling ratio test.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="w-full md:w-80">
        <RatioChart snapshot={snapshot} />
      </div>
    </div>
  )
}
