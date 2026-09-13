// SPEC.md §10.4: state & snapshot shapes.

export interface GraphVertex {
  id: string
  label: string
  x: number
  y: number
  state?: 'unvisited' | 'frontier' | 'visiting' | 'visited'
  component?: number
}

export interface GraphEdge {
  from: string
  to: string
  state?: 'default' | 'active' | 'tree'
}

export interface GraphSnapshot {
  vertices: GraphVertex[]
  edges: GraphEdge[]
  directed: boolean
}

export type GraphState = GraphSnapshot
