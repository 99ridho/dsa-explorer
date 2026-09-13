// SPEC.md §10.4 — pseudocode, verbatim.

export const graphPseudocode: Record<string, string[]> = {
  bfs: [
    'BFS(source):',
    '  mark source visited; enqueue source',
    '  while queue not empty:',
    '    v = dequeue()',
    '    for each w adjacent to v:',
    '      if w not visited:',
    '        mark w visited; edgeTo[w] = v',
    '        enqueue w',
  ],
  dfs: [
    'DFS(v):',
    '  mark v visited',
    '  for each w adjacent to v:',
    '    if w not visited:',
    '      edgeTo[w] = v',
    '      DFS(w)',
  ],
  'connected-components': [
    'CONNECTED_COMPONENTS():',
    '  count = 0',
    '  for each vertex v:',
    '    if v not visited:',
    '      count = count + 1',
    '      DFS(v), assigning component = count to every reached vertex',
  ],
  'topological-sort': [
    'TOPOLOGICAL_SORT():',
    '  for each vertex v:',
    '    if v not visited:',
    '      DFS_POSTORDER(v)   // pushes v onto a stack after visiting all its descendants',
    '  return REVERSE(postorder stack)',
  ],
  'strong-components': [
    'KOSARAJU_SHARIR():',
    '  order = REVERSE_POSTORDER(REVERSE(G))',
    '  for each vertex v in order:',
    '    if v not visited:',
    '      DFS(v) in G, assigning the same component id to every reached vertex',
  ],
}
