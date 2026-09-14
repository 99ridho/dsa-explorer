// SPEC.md §19.1: pseudocode, verbatim.

export const studyPlanPseudocode: Record<string, string[]> = {
  'add-course': [
    'ADD_COURSE(code):',
    '  i = HASH(code)',
    '  if code is in bucket[i]: return',
    '  v = V; V = V + 1; add vertex v to the digraph',
    '  append (code, v) to bucket[i]',
  ],
  'add-prereq': [
    'ADD_PREREQUISITE(before, after):',
    '  v = GET(before)',
    '  w = GET(after)',
    '  if v or w is missing, or v == w: return',
    '  add edge v to w',
  ],
  'plan-topological': [
    'BUILD_PLAN():',
    '  for each course v, in vertex order:',
    '    if v is unmarked: DFS(v)',
    '  return the reverse of postorder',
    'DFS(v):',
    '  mark v; put v on the call stack',
    '  for each course w that lists v as a prerequisite:',
    '    if w is on the call stack: report a cycle',
    '    else if w is unmarked: DFS(w)',
    '  take v off the call stack; add v to postorder',
  ],
  'plan-alphabetical': [
    'BUILD_PLAN_ALPHABETICAL():',
    '  order = every course code, sorted A to Z',
    '  for each prerequisite edge v to w:',
    '    if w comes before v in order: count a violation',
    '  return order',
  ],
}
