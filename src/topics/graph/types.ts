// SPEC.md §10.4: state & snapshot shapes. Vertices are integers 0..V-1 (algs4 convention).

export type VertexState = 'unvisited' | 'frontier' | 'visiting' | 'visited'
export type EdgeState = 'default' | 'active' | 'tree'

export interface GraphVertex {
  id: string
  label: string
  x: number
  y: number
  state?: VertexState
  component?: number
}

export interface GraphEdge {
  from: string
  to: string
  state?: EdgeState
}

export interface GraphSnapshot {
  vertices: GraphVertex[]
  edges: GraphEdge[]
  directed: boolean
  /** Set during phase 1 of Kosaraju-Sharir so the canvas draws the reversed graph dimmed. */
  phase?: 'reversed'
}

export type GraphState = GraphSnapshot

export const MAX_VERTICES = 10
export const LAYOUT_WIDTH = 600
export const LAYOUT_HEIGHT = 400
