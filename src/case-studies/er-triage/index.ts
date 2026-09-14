import type { CaseStudyModule } from '@/types/case-study'
import { reasoning, scenario } from './content'
import { triageDecisions } from './decisions'
import { triageQuiz } from './quiz'
import { triageSimulator } from './simulator'
import type { TriageSnapshot } from './types'

export const erTriage: CaseStudyModule<TriageSnapshot> = {
  slug: 'er-triage',
  title: 'ER triage desk',
  weekLabel: 'Weeks 9–11',
  summary: 'Treat the most urgent patient next with a binary heap, and find records on disk with a B-tree.',
  topicSlugs: ['bst', 'b-tree', 'binary-heap'],
  content: { scenario, reasoning },
  decisions: triageDecisions,
  simulator: triageSimulator,
  quiz: triageQuiz,
}
