// SPEC.md §8/§9: owns the persistent TState and the playback for the last operation's steps.
import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePlayback } from '@/lib/step-engine'
import type { Step, TopicModule } from '@/types/step-engine'
import { CodePanel } from './CodePanel'
import { OperationBar } from './OperationBar'
import { PlaybackControls } from './PlaybackControls'
import { parseInput } from './input-parsing'

const NO_STEPS: Step<unknown>[] = []

// v1 contract: every topic defines TState = TSnapshot (SPEC.md §10), so an operation's
// finalSnapshot becomes the next persistent state.
export function VisualizerShell({ topic }: { topic: TopicModule }) {
  const [state, setState] = useState<unknown>(() => topic.createInitialState())
  const [steps, setSteps] = useState<Step<unknown>[]>(NO_STEPS)
  const [currentOperationId, setCurrentOperationId] = useState<string | null>(topic.operations[0]?.id ?? null)
  const [variant, setVariant] = useState<string | undefined>(topic.variant?.default)
  const [inputText, setInputText] = useState('')
  const [inputError, setInputError] = useState<string | null>(null)

  const playback = usePlayback(steps)
  const currentOperation = topic.operations.find((op) => op.id === currentOperationId) ?? null
  const displayedSnapshot = playback.currentStep?.snapshot ?? state
  const Canvas = topic.CanvasComponent

  const handleGo = useCallback(() => {
    if (!currentOperation) return
    const parsed = parseInput(currentOperation.inputKind, inputText)
    if (!parsed.ok) {
      setInputError(parsed.error)
      return
    }
    setInputError(null)
    const result = currentOperation.run(state, parsed.value)
    setSteps(result.steps)
    setState(result.finalSnapshot)
  }, [currentOperation, inputText, state])

  // Randomize and Reset bypass the step engine entirely (§9).
  const handleRandomize = () => {
    setState((s: unknown) => topic.randomize(s, variant))
    setSteps(NO_STEPS)
    setInputError(null)
  }
  const handleReset = () => {
    setState(topic.createInitialState())
    setSteps(NO_STEPS)
    setInputError(null)
  }
  // Switching the variant resets the structure (§10.3): the representations don't share live data.
  const handleVariantChange = (value: string) => {
    setVariant(value)
    setState(topic.randomize(topic.createInitialState(), value))
    setSteps(NO_STEPS)
  }

  // Keyboard playback (§12): Space play/pause, ←/→ step: ignored while typing in a field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
      if (target?.isContentEditable) return
      if (steps.length === 0) return
      if (e.key === ' ') {
        e.preventDefault()
        if (playback.isPlaying) playback.pause()
        else playback.play()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        playback.stepForward()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        playback.stepBackward()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [steps.length, playback])

  return (
    // Mobile order: Canvas → OperationBar → CodePanel → PlaybackControls (§12): the DOM order.
    // From md up: canvas spans the full width; Operation + Playback stack beside a tall Pseudocode.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
      <Card className="min-w-0 md:col-span-2">
        <CardContent>
          <Canvas snapshot={displayedSnapshot} variant={variant} />
        </CardContent>
      </Card>

      <Card className="min-w-0 md:col-start-1 md:row-start-2">
        <CardHeader>
          <CardTitle className="text-base">Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <OperationBar
            operations={topic.operations}
            currentOperationId={currentOperationId}
            onOperationChange={(id) => {
              setCurrentOperationId(id)
              setInputError(null)
            }}
            inputText={inputText}
            onInputChange={(t) => {
              setInputText(t)
              if (inputError) setInputError(null)
            }}
            inputError={inputError}
            onGo={handleGo}
            onRandomize={handleRandomize}
            onReset={handleReset}
            variant={topic.variant}
            variantValue={variant}
            onVariantChange={handleVariantChange}
          />
        </CardContent>
      </Card>

      <Card className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-2">
        <CardHeader>
          <CardTitle className="text-base">Pseudocode</CardTitle>
        </CardHeader>
        <CardContent>
          <CodePanel
            lines={currentOperationId ? (topic.pseudocode[currentOperationId] ?? []) : []}
            currentStep={playback.currentStep}
            operationLabel={currentOperation?.label ?? null}
          />
        </CardContent>
      </Card>

      <Card className="min-w-0 md:col-start-1 md:row-start-3">
        <CardHeader>
          <CardTitle className="text-base">Playback</CardTitle>
        </CardHeader>
        <CardContent>
          <PlaybackControls playback={playback} stepCount={steps.length} />
        </CardContent>
      </Card>
    </div>
  )
}
