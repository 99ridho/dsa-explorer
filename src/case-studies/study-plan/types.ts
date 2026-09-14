// SPEC.md §19.1: snapshot shape. The index is a separate-chaining table from course code to
// vertex number; the digraph reuses the graph topic's snapshot with codes as vertex labels.
import type { GraphSnapshot } from '@/topics/graph/types'

export const COURSE_M = 11
export const MAX_COURSES = 10

export type PlanOrder = 'topological' | 'alphabetical'

export interface CourseEntry {
  code: string
  v: number
}

export interface StudyPlanSnapshot {
  focus: 'index' | 'graph' | 'plan'
  M: number
  buckets: CourseEntry[][]
  codes: string[] // codes[v]
  graph: GraphSnapshot
  plan?: { order: string[]; late: string[] }
  highlight?: { bucket: number; index?: number }
}

export type StudyPlanState = StudyPlanSnapshot
