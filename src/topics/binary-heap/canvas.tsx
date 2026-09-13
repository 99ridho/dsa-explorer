import { PlaceholderCanvas } from '@/components/PlaceholderCanvas'
import type { HeapSnapshot } from './types'

// SPEC.md §10.2: dual view — tree (children of k at 2k, 2k+1 via lib/layout/tree-layout) above the array row.
export function HeapCanvas(_props: { snapshot: HeapSnapshot; variant?: string }) {
  return <PlaceholderCanvas title="Binary Heap" specSection="§10.2" />
}
