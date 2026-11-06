// SPEC.md §19.1: pseudocode, verbatim.

export const studyPlanPseudocode: Record<string, string[]> = {
  'add-course': [
    'ADD_COURSE(code):',
    '  index = HASH(code)',
    '  if code is in buckets[index]: return',
    '  course = V; V = V + 1; add vertex course to the digraph',
    '  append (code, course) to buckets[index]',
  ],
  'add-prereq': [
    'ADD_PREREQUISITE(before, after):',
    '  beforeCourse = GET(before)',
    '  afterCourse = GET(after)',
    '  if either is missing, or beforeCourse == afterCourse: return',
    '  add edge beforeCourse to afterCourse',
  ],
  'plan-topological': [
    'BUILD_PLAN():',
    '  for each course, in vertex order:',
    '    if course is unvisited: DFS(course)',
    '  return the reverse of postorder',
    'DFS(course):',
    '  mark course visited; put course on the call stack',
    '  for each dependent that lists course as a prerequisite:',
    '    if dependent is on the call stack: report a cycle',
    '    else if dependent is unvisited: DFS(dependent)',
    '  take course off the call stack; add course to postorder',
  ],
  'plan-alphabetical': [
    'BUILD_PLAN_ALPHABETICAL():',
    '  order = every course code, sorted A to Z',
    '  for each prerequisite edge course to dependent:',
    '    if dependent comes before course in order: count a violation',
    '  return order',
  ],
}
