import type { CaseStudyModule } from '@/types/case-study'
import { reasoning, scenario } from './content'
import { studyPlanDecisions } from './decisions'
import { studyPlanQuiz } from './quiz'
import { studyPlanSimulator } from './simulator'
import type { StudyPlanSnapshot } from './types'

export const studyPlan: CaseStudyModule<StudyPlanSnapshot> = {
  slug: 'study-plan',
  title: 'Study plan builder',
  weekLabel: 'Weeks 12–15',
  summary: 'Order a curriculum so every prerequisite comes first, with a hash index for course codes and a topological sort.',
  topicSlugs: ['hash-table', 'graph'],
  content: { scenario, reasoning },
  decisions: studyPlanDecisions,
  simulator: studyPlanSimulator,
  quiz: studyPlanQuiz,
}
