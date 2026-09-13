// d3-force wrapper — SPEC.md §10.4 "Canvas layout".
// Runs the simulation to completion synchronously and returns positions; the caller
// caches the result and only recomputes when the vertex/edge set changes.
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'

export interface GraphLayoutOptions {
  width?: number
  height?: number
  linkDistance?: number
  charge?: number
  ticks?: number
}

interface LayoutNode extends SimulationNodeDatum {
  id: string
}

export function layoutGraph(
  vertexIds: string[],
  edges: { from: string; to: string }[],
  { width = 600, height = 400, linkDistance = 90, charge = -300, ticks = 300 }: GraphLayoutOptions = {},
): Record<string, { x: number; y: number }> {
  const nodes: LayoutNode[] = vertexIds.map((id) => ({ id }))
  const links: SimulationLinkDatum<LayoutNode>[] = edges.map((e) => ({ source: e.from, target: e.to }))

  const simulation = forceSimulation(nodes)
    .force('charge', forceManyBody().strength(charge))
    .force(
      'link',
      forceLink<LayoutNode, SimulationLinkDatum<LayoutNode>>(links)
        .id((d) => d.id)
        .distance(linkDistance),
    )
    .force('center', forceCenter(width / 2, height / 2))
    .force('collide', forceCollide(28))
    .stop()

  simulation.tick(ticks)

  const positions: Record<string, { x: number; y: number }> = {}
  for (const node of nodes) {
    positions[node.id] = { x: node.x ?? 0, y: node.y ?? 0 }
  }
  return positions
}
