// Contract for SPEC.md §7/§8/§10: every operation has C++, Java, and Python snippets, every
// line map points inside the pseudocode, and every pseudocode line a step can highlight has a
// mapped code line in each language, so the synced highlight never goes dark.
import { describe, expect, it } from 'vitest'
import type { SnippetLanguage, Step, TopicModule } from '@/types/step-engine'
import { topics } from './registry'
import { INPUTS } from './test-inputs'

const LANGS: SnippetLanguage[] = ['cpp', 'java', 'python']

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
