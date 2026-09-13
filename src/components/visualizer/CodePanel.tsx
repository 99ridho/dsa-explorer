// SPEC.md §8 — numbered pseudocode with the current step's line highlighted.
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Step } from '@/types/step-engine'

interface CodePanelProps {
  lines: string[]
  currentStep: Step<unknown> | null
  operationLabel: string | null
}

export function CodePanel({ lines, currentStep, operationLabel }: CodePanelProps) {
  return (
    <div className="space-y-3">
      <div className="min-h-12 rounded-lg bg-muted px-3 py-2 text-sm" aria-live="polite">
        {currentStep ? (
          <>
            <p>{currentStep.description}</p>
            {currentStep.variables && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {Object.entries(currentStep.variables).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="font-mono text-[11px]">
                    {k} = {v}
                  </Badge>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            {operationLabel ? `Press Go to run ${operationLabel}.` : 'Pick an operation to see its pseudocode.'}
          </p>
        )}
      </div>

      {lines.length > 0 && (
        <pre className="overflow-x-auto rounded-lg border bg-card p-3 font-mono text-xs leading-6 sm:text-[13px]">
          {lines.map((line, i) => {
            const lineNo = i + 1
            const active = currentStep?.highlightLine === lineNo
            return (
              <div
                key={lineNo}
                className={cn('flex gap-3 rounded px-1 -mx-1', active && 'bg-accent/40 font-bold')}
                aria-current={active ? 'step' : undefined}
              >
                <span className="w-5 shrink-0 select-none text-right text-muted-foreground">{lineNo}</span>
                <span className="whitespace-pre">{line}</span>
              </div>
            )
          })}
        </pre>
      )}
    </div>
  )
}
