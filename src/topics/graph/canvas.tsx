import { PlaceholderCanvas } from '@/components/PlaceholderCanvas'
import type { GraphSnapshot } from './types'

// SPEC.md §10.4: positions from lib/layout/graph-layout (d3-force), cached per vertex/edge set;
// directed edges get an arrowhead marker.
export function GraphCanvas(_props: { snapshot: GraphSnapshot; variant?: string }) {
  return <PlaceholderCanvas title="Graph" specSection="§10.4" />
}
