import type { TopicModule } from '@/types/step-engine'
import { TriageCanvas } from './canvas'
import { buildTriage, triageOperations } from './operations'
import { triagePseudocode } from './pseudocode'
import { triageSnippets } from './snippets'
import { triageStructure } from './structure'
import type { TriageMode, TriageSnapshot, TriageState } from './types'

/** [severity, record] in arrival order: #101 to #105. */
export const SEED_ADMISSIONS: [number, number][] = [
  [2, 42],
  [4, 17],
  [1, 88],
  [5, 63],
  [3, 25],
]

const asMode = (v?: string): TriageMode => (v === 'arrival' ? 'arrival' : 'priority')
const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1))

function randomTriage(mode: TriageMode): TriageState {
  const records = new Set<number>()
  const count = randInt(5, 8)
  while (records.size < count) records.add(randInt(10, 99))
  return buildTriage(mode, [...records].map((record) => [randInt(1, 5), record] as [number, number]))
}

export const triageSimulator: TopicModule<TriageState, TriageSnapshot> = {
  slug: 'er-triage',
  title: 'ER triage desk',
  weekLabel: 'Weeks 9–11',
  operations: triageOperations,
  pseudocode: triagePseudocode,
  snippets: triageSnippets,
  CanvasComponent: TriageCanvas,
  content: { realWorldUsage: '', coreMaterial: '' },
  structure: triageStructure,
  variant: {
    id: 'triage',
    label: 'Waiting list design',
    options: [
      { value: 'priority', label: 'Priority queue' },
      { value: 'arrival', label: 'Arrival queue' },
    ],
    default: 'priority',
  },
  createInitialState: (variant) => buildTriage(asMode(variant), SEED_ADMISSIONS),
  randomize: (_state, variant) => randomTriage(asMode(variant)),
}
