import type { TopicModule } from '@/types/step-engine'
import { StudyPlanCanvas } from './canvas'
import { buildPlan, studyPlanOperations } from './operations'
import { studyPlanPseudocode } from './pseudocode'
import { studyPlanSnippets } from './snippets'
import { studyPlanStructure } from './structure'
import type { StudyPlanSnapshot, StudyPlanState } from './types'

export const SEED_CODES = ['MTH', 'PR1', 'DSC', 'PR2', 'DSA', 'DB', 'WEB', 'AI']
export const SEED_PREREQUISITES: [string, string][] = [
  ['PR1', 'PR2'],
  ['PR2', 'DSA'],
  ['DSC', 'DSA'],
  ['PR2', 'DB'],
  ['DB', 'WEB'],
  ['PR2', 'WEB'],
  ['DSA', 'AI'],
  ['MTH', 'AI'],
]

/** Illustrative course pool for Randomize. Every candidate edge runs from an earlier course to a later one, so any subset is a DAG. */
export const COURSE_POOL = ['MTH', 'STA', 'PR1', 'DSC', 'PR2', 'OOP', 'DSA', 'DB', 'WEB', 'NET', 'OS', 'AI']
export const CANDIDATE_PREREQUISITES: [string, string][] = [
  ['PR1', 'PR2'],
  ['PR2', 'OOP'],
  ['PR2', 'DSA'],
  ['DSC', 'DSA'],
  ['PR2', 'DB'],
  ['DB', 'WEB'],
  ['OOP', 'WEB'],
  ['NET', 'WEB'],
  ['PR1', 'NET'],
  ['DSA', 'OS'],
  ['MTH', 'STA'],
  ['STA', 'AI'],
  ['DSA', 'AI'],
  ['MTH', 'AI'],
]

function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Random candidate prerequisites until 6 to 9 courses take part, so every course has at least one edge. */
export function randomPlan(): StudyPlanState {
  for (;;) {
    const target = 6 + Math.floor(Math.random() * 4)
    const chosen = new Set<string>()
    const edges: [string, string][] = []
    for (const [a, b] of shuffle(CANDIDATE_PREREQUISITES)) {
      const added = [a, b].filter((c) => !chosen.has(c)).length
      if (chosen.size + added > target) continue
      chosen.add(a)
      chosen.add(b)
      edges.push([a, b])
    }
    // A greedy walk can stop one course short of 6; draw again rather than return a thin plan.
    if (chosen.size >= 6) return buildPlan(shuffle([...chosen]), edges)
  }
}

export const studyPlanSimulator: TopicModule<StudyPlanState, StudyPlanSnapshot> = {
  slug: 'study-plan',
  title: 'Study plan builder',
  weekLabel: 'Weeks 12–15',
  operations: studyPlanOperations,
  pseudocode: studyPlanPseudocode,
  snippets: studyPlanSnippets,
  CanvasComponent: StudyPlanCanvas,
  content: { realWorldUsage: '', coreMaterial: '' },
  structure: studyPlanStructure,
  variant: {
    id: 'order',
    label: 'Plan design',
    options: [
      { value: 'topological', label: 'Topological' },
      { value: 'alphabetical', label: 'Alphabetical' },
    ],
    default: 'topological',
  },
  createInitialState: () => buildPlan(SEED_CODES, SEED_PREREQUISITES),
  randomize: () => randomPlan(),
}
