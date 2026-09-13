// SPEC.md §10.6: pseudocode, verbatim.
export const arraysPseudocode: Record<string, string[]> = {
  create: ['CREATE(values):', '  a = new int[N]', '  for i = 0 to N - 1: a[i] = values[i]'],
  access: ['ACCESS(i):', '  if i < 0 or i >= N: OUT_OF_BOUNDS', '  return a[i]'],
  set: ['SET(i, v):', '  if i < 0 or i >= N: OUT_OF_BOUNDS', '  a[i] = v'],
  resize: ['RESIZE():', '  copy = new int[2 * N]', '  for i = 0 to N - 1: copy[i] = a[i]', '  a = copy'],
  memory: ['MEMORY(a):', '  header = 16 + 4 + 4 = 24 bytes', '  return 24 + 4 * N'],
}
