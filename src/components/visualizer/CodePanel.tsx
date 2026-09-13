// SPEC.md §8: numbered pseudocode or a language snippet, with the current step's line highlighted.
// Lines soft-wrap with a hanging indent; the block never scrolls horizontally.
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LANGUAGE_LABEL } from '@/lib/snippets'
import { cn } from '@/lib/utils'
import type { OperationSnippets, SnippetLanguage, SnippetLine, Step } from '@/types/step-engine'

type View = 'pseudocode' | SnippetLanguage
const VIEWS: View[] = ['pseudocode', 'cpp', 'java', 'python']
const STORAGE_KEY = 'dsa-explorer-code-lang'

function readStoredView(): View {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v && (VIEWS as string[]).includes(v)) return v as View
  } catch {
    /* storage unavailable */
  }
  return 'pseudocode'
}

interface CodePanelProps {
  lines: string[]
  snippets?: OperationSnippets
  currentStep: Step<unknown> | null
  operationLabel: string | null
}

export function CodePanel({ lines, snippets, currentStep, operationLabel }: CodePanelProps) {
  const [view, setView] = useState<View>(readStoredView)

  const changeView = (v: string) => {
    setView(v as View)
    try {
      localStorage.setItem(STORAGE_KEY, v)
    } catch {
      /* storage unavailable */
    }
  }

  const shown: SnippetLine[] =
    view === 'pseudocode' ? lines.map((text, i) => ({ text, pseudo: i + 1 })) : (snippets?.[view] ?? [])
  const highlightLine = currentStep?.highlightLine

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
        <>
          <Tabs value={view} onValueChange={changeView}>
            <TabsList className="h-8 w-full">
              <TabsTrigger value="pseudocode" className="flex-1 text-xs">
                Pseudocode
              </TabsTrigger>
              {(['cpp', 'java', 'python'] as SnippetLanguage[]).map((lang) => (
                <TabsTrigger key={lang} value={lang} className="flex-1 text-xs" disabled={!snippets?.[lang]}>
                  {LANGUAGE_LABEL[lang]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ol className="rounded-lg border bg-card p-3 font-mono text-xs leading-5" aria-label={view === 'pseudocode' ? 'Pseudocode' : `${LANGUAGE_LABEL[view]} code`}>
            {shown.map((line, i) => {
              const lineNo = i + 1
              const active = highlightLine !== undefined && line.pseudo === highlightLine
              const indent = line.text.length - line.text.trimStart().length
              return (
                <li
                  key={lineNo}
                  className={cn('-mx-1 flex gap-2 rounded px-1 py-0.5', active && 'bg-accent/40 font-bold')}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="w-5 shrink-0 select-none text-right text-muted-foreground">{lineNo}</span>
                  {/* Hanging indent: the line starts at its own indent, wrapped continuations two columns deeper. */}
                  <span
                    className="min-w-0 flex-1 whitespace-pre-wrap [overflow-wrap:anywhere]"
                    style={{ paddingLeft: `${indent + 2}ch`, textIndent: '-2ch' }}
                  >
                    {line.text.trimStart() || ' '}
                  </span>
                </li>
              )
            })}
          </ol>
        </>
      )}
    </div>
  )
}
