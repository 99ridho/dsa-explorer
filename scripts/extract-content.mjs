// One-off generator: copies §2 and §3 of each references/Week-*.md into src/topics/<slug>/content.ts verbatim.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const topics = [
  ['complexity', 'Week-1-Complexity.md'],
  ['arrays', 'Week-2-ArraysDataRepresentation.md'],
  ['queue', 'Week-3-Queue.md'],
  ['stack', 'Week-4-Stack.md'],
  ['sorting', 'Week-5-Sorting.md'],
  ['linked-list', 'Week-6-LinkedList.md'],
  ['searching', 'Week-7-Searching.md'],
  ['bst', 'Week-9-BST.md'],
  ['b-tree', 'Week-10-BTree.md'],
  ['binary-heap', 'Week-11-BinaryHeap.md'],
  ['hash-table', 'Week-12-HashTable.md'],
  ['graph', 'Week-13-15-Graph.md'],
]

function section(md, startRe, endRe) {
  const lines = md.split('\n')
  const start = lines.findIndex((l) => startRe.test(l))
  let end = lines.findIndex((l, i) => i > start && endRe.test(l))
  if (start < 0) throw new Error(`missing ${startRe}`)
  if (end < 0) end = lines.length
  let body = lines.slice(start + 1, end)
  while (body.length && (body[body.length - 1].trim() === '' || body[body.length - 1].trim() === '---')) body.pop()
  while (body.length && body[0].trim() === '') body.shift()
  return body.join('\n')
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

for (const [slug, file] of topics) {
  const md = readFileSync(`references/${file}`, 'utf8')
  const real = section(md, /^## 2\. Real-World Usage/, /^## 3\. /)
  const core = section(md, /^## 3\. Core Material/, /^## 4\. /)
  mkdirSync(`src/topics/${slug}`, { recursive: true })
  const out = `// SPEC.md §11: copied verbatim from references/${file} (§2 and §3).
// Do not rewrite or summarize: this text has been through the course's citation-integrity process.
// Regenerate with \`node scripts/extract-content.mjs\` if the reference markdown changes.

export const realWorldUsage = \`
${esc(real)}
\`.trim()

export const coreMaterial = \`
${esc(core)}
\`.trim()
`
  writeFileSync(`src/topics/${slug}/content.ts`, out)
  console.log(`${slug}: real=${real.length} chars, core=${core.length} chars`)
}
