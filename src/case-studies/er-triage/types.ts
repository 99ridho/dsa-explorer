// SPEC.md §19.2: snapshot shape. The archive reuses the B-tree topic's snapshot, keyed by record number.
import type { BTreeSnapshot } from '@/topics/b-tree/types'

export const MAX_WAITING = 15
export const FIRST_ARRIVAL = 101

export type TriageMode = 'priority' | 'arrival'

export interface Patient {
  arrival: number
  severity: number
  record: number
}

export interface TriageSnapshot {
  mode: TriageMode
  focus: 'triage' | 'archive'
  waiting: Patient[] // priority: heap order, waiting[k - 1] is heap position k; arrival: front first
  archive: BTreeSnapshot
  nextArrival: number
  treated: number
  bypassed: number
  highlight?: { positions: number[]; kind: 'new' | 'compare' | 'swap' | 'treat' }
}

export type TriageState = TriageSnapshot
