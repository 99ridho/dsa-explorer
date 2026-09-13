// Contract for SPEC.md §7/§8/§10: every operation has C++, Java, and Python snippets, every
// line map points inside the pseudocode, and every pseudocode line a step can highlight has a
// mapped code line in each language, so the synced highlight never goes dark.
import { describe, expect, it } from 'vitest'
import type { SnippetLanguage, Step, TopicModule } from '@/types/step-engine'
import { topics } from './registry'

const LANGS: SnippetLanguage[] = ['cpp', 'java', 'python']

/**
 * Inputs that drive each operation through its interesting branches on the seed state.
 * Every input runs on the fresh seed, so branches that need a prior state (a halving pop, a
 * second push that resizes, a B-tree root split) are covered by each topic's own test file.
 */
const INPUTS: Record<string, unknown[]> = {
  'queue/array-enqueue': [7],
  'queue/linked-enqueue': [7],
  'stack/array-push': [7],
  'stack/linked-push': [7],
  'stack/evaluate': ['( 1 + ( ( 2 + 3 ) * ( 4 * 5 ) ) )', '( 1 + x )', '( 1 / 0 )', '( 1 )'],
  'linked-list/insert-first': [3],
  'linked-list/insert-last': [3],
  'sorting/load': [[5, 3, 8], [1]],
  'searching/seq-get': [5, 99],
  'searching/seq-put': [5, 99],
  'searching/bin-get': [21, 22, 99],
  'searching/bin-put': [21, 22],
  'bst/insert': [45, 50],
  'bst/search': [60, 99],
  'bst/delete': [20, 30, 99],
  'binary-heap/insert': [85],
  'binary-heap/build-heap': [[5, 3, 8, 1, 9]],
  'hash-table/chain-insert': [56, 34],
  'hash-table/chain-search': [45, 67],
  'hash-table/chain-delete': [23, 67],
  'hash-table/probe-insert': [56, 12],
  'hash-table/probe-search': [45, 67],
  'hash-table/probe-delete': [23, 67],
  'graph/add-edge': [{ from: '4', to: '5' }, { from: '2', to: '2' }, { from: '0', to: '1' }],
  'graph/bfs': [0, 9],
  'graph/dfs': [0, 9],
}

function emittedLines(topic: TopicModule, opId: string): Set<number> {
  const lines = new Set<number>()
  const variantsToTry = topic.variant ? topic.variant.options.map((o) => o.value) : [undefined]
  for (const variant of variantsToTry) {
    const op = topic.operations.find((o) => o.id === opId)!
    if (op.variants && (!variant || !op.variants.includes(variant))) continue
    const state = topic.createInitialState(variant)
    const inputs = INPUTS[`${topic.slug}/${opId}`] ?? [undefined]
    for (const input of inputs) {
      const result = op.run(state, input)
      for (const step of result.steps as Step<unknown>[]) lines.add(step.highlightLine)
    }
  }
  return lines
}

describe.each(topics.map((t) => [t.slug, t] as const))('%s snippets', (_slug, topic) => {
  for (const op of topic.operations) {
    it(`${op.id}: three languages, mapped inside the listing, covering every emitted line`, () => {
      const pseudo = topic.pseudocode[op.id]
      const snippets = topic.snippets[op.id]
      expect(pseudo, 'pseudocode listing').toBeDefined()
      expect(snippets, 'snippets').toBeDefined()
      const emitted = emittedLines(topic, op.id)
      expect(emitted.size).toBeGreaterThan(0)
      for (const lang of LANGS) {
        const lines = snippets[lang]
        expect(lines.length, lang).toBeGreaterThan(0)
        const mapped = new Set(lines.map((l) => l.pseudo).filter((n): n is number => n !== undefined))
        for (const n of mapped) expect(n, `${lang} maps line ${n}`).toBeLessThanOrEqual(pseudo.length)
        for (const n of emitted) expect(mapped.has(n), `${lang} has no line for pseudocode line ${n}`).toBe(true)
      }
    })
  }
})
