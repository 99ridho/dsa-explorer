// SPEC.md §10.6: pseudocode, verbatim.
export const arraysPseudocode: Record<string, string[]> = {
  create: ['CREATE(values):', '  items = new int[N]', '  for i = 0 to N - 1: items[i] = values[i]'],
  access: ['ACCESS(index):', '  if index < 0 or index >= N: OUT_OF_BOUNDS', '  return items[index]'],
  set: ['SET(index, value):', '  if index < 0 or index >= N: OUT_OF_BOUNDS', '  items[index] = value'],
  resize: ['RESIZE():', '  resized = new int[2 * N]', '  for i = 0 to N - 1: resized[i] = items[i]', '  items = resized'],
  memory: ['MEMORY(items):', '  header = 16 + 4 + 4 = 24 bytes', '  return 24 + 4 * N'],
}
