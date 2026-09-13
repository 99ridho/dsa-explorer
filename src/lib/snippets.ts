// Authoring helper for topic snippets (SPEC.md §7): a plain string is an unmapped code line,
// a [text, pseudoLine] tuple is a line that implements that pseudocode line.
import type { SnippetLine } from '@/types/step-engine'

export type SnippetSource = (string | [string, number])[]

export function code(lines: SnippetSource): SnippetLine[] {
  return lines.map((l) => (typeof l === 'string' ? { text: l } : { text: l[0], pseudo: l[1] }))
}

export const LANGUAGE_LABEL = { cpp: 'C++', java: 'Java', python: 'Python' } as const
