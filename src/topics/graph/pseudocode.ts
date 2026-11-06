// SPEC.md §10.4: pseudocode, verbatim.

export const graphPseudocode: Record<string, string[]> = {
  'add-edge': ['ADD_EDGE(start, end):', '  create start and end if they do not exist', '  adjacent[start].add(end); if undirected, adjacent[end].add(start)'],
  bfs: [
    'BFS(source):',
    '  mark source visited; enqueue source',
    '  while queue not empty:',
    '    vertex = dequeue()',
    '    for each neighbor adjacent to vertex:',
    '      if neighbor not visited:',
    '        mark neighbor visited; edgeTo[neighbor] = vertex',
    '        enqueue neighbor',
  ],
  dfs: ['DFS(vertex):', '  mark vertex visited', '  for each neighbor adjacent to vertex:', '    if neighbor not visited:', '      edgeTo[neighbor] = vertex', '      DFS(neighbor)'],
  'connected-components': [
    'CONNECTED_COMPONENTS():',
    '  count = 0',
    '  for each vertex:',
    '    if vertex not visited:',
    '      count = count + 1',
    '      DFS(vertex), assigning component = count to every reached vertex',
  ],
  'topological-sort': [
    'TOPOLOGICAL_SORT():',
    '  for each vertex:',
    '    if vertex not visited:',
    '      DFS_POSTORDER(vertex)   // pushes vertex onto a stack after visiting all its descendants',
    '  return REVERSE(postorder stack)',
  ],
  'strong-components': [
    'KOSARAJU_SHARIR():',
    '  order = REVERSE_POSTORDER(REVERSE(graph))',
    '  for each vertex in order:',
    '    if vertex not visited:',
    '      DFS(vertex) in graph, assigning the same component id to every reached vertex',
  ],
}
