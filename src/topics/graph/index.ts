import type { TopicModule } from '@/types/step-engine'
import { GraphCanvas } from './canvas'
import { coreMaterial, realWorldUsage } from './content'
import { graphOperations } from './operations'
import { graphPseudocode } from './pseudocode'
import type { GraphSnapshot, GraphState } from './types'

const emptyGraph = (variant?: string): GraphState => ({ vertices: [], edges: [], directed: variant === 'directed' })

export const graph: TopicModule<GraphState, GraphSnapshot> = {
  slug: 'graph',
  title: 'Graph',
  weekLabel: 'Weeks 13–15',
  operations: graphOperations,
  pseudocode: graphPseudocode,
  CanvasComponent: GraphCanvas,
  content: { realWorldUsage, coreMaterial },
  variant: {
    id: 'directed',
    label: 'Graph type',
    options: [
      { value: 'undirected', label: 'Undirected' },
      { value: 'directed', label: 'Directed' },
    ],
    default: 'undirected',
  },
  createInitialState: () => emptyGraph('undirected'),
  randomize: (_state, variant) => emptyGraph(variant),
}
