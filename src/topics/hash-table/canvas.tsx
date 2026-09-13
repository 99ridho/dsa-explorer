import { PlaceholderCanvas } from '@/components/PlaceholderCanvas'
import type { HashTableSnapshot } from './types'

// SPEC.md §10.3: `strategy` selects between ChainingCanvas (M rows of linked boxes)
// and ProbingCanvas (a single row of M slots).
export function HashTableCanvas(_props: { snapshot: HashTableSnapshot; variant?: string }) {
  return <PlaceholderCanvas title="Hash Table" />
}
