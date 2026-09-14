import type { CaseStudyModule } from '@/types/case-study'
import { reasoning, scenario } from './content'
import { canteenDecisions } from './decisions'
import { canteenQuiz } from './quiz'
import { canteenSimulator } from './simulator'
import type { CanteenSnapshot } from './types'

export const canteenOrders: CaseStudyModule<CanteenSnapshot> = {
  slug: 'canteen-orders',
  title: 'Canteen order counter',
  weekLabel: 'Weeks 1–7',
  summary: 'Serve orders in the order they came with a queue, and find a served order by binary search on a log that stays sorted.',
  topicSlugs: ['complexity', 'arrays', 'queue', 'stack', 'sorting', 'linked-list', 'searching'],
  content: { scenario, reasoning },
  decisions: canteenDecisions,
  simulator: canteenSimulator,
  quiz: canteenQuiz,
}
