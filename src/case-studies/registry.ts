// SPEC.md §19.0: case studies in week order. Each simulator is a TopicModule kept out of `topics`.
import type { CaseStudyModule } from '@/types/case-study'
import { canteenOrders } from './canteen-orders'
import { erTriage } from './er-triage'
import { studyPlan } from './study-plan'

// Cast: each module is strongly typed internally; the registry erases the snapshot param.
export const caseStudies: CaseStudyModule[] = [
  canteenOrders as unknown as CaseStudyModule,
  erTriage as unknown as CaseStudyModule,
  studyPlan as unknown as CaseStudyModule,
]

export function getCaseStudy(slug: string | undefined): CaseStudyModule | undefined {
  return caseStudies.find((c) => c.slug === slug)
}
