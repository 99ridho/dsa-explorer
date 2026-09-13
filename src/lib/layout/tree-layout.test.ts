import { describe, expect, it } from 'vitest'
import { layoutBinaryTree, layoutMultiwayTree } from './tree-layout'

describe('layoutBinaryTree', () => {
  it('assigns in-order x and depth y', () => {
    const kids: Record<string, { left: string | null; right: string | null }> = {
      b: { left: 'a', right: 'c' },
      a: { left: null, right: null },
      c: { left: null, right: null },
    }
    const pos = layoutBinaryTree('b', (id) => kids[id], { hGap: 10, vGap: 5 })
    expect(pos).toEqual({ a: { x: 0, y: 5 }, b: { x: 10, y: 0 }, c: { x: 20, y: 5 } })
  })
})

describe('layoutMultiwayTree', () => {
  const children: Record<string, string[]> = { root: ['l', 'm', 'r'], l: [], m: [], r: [] }
  const width: Record<string, number> = { root: 90, l: 60, m: 60, r: 90 }

  it('centers a parent over its children and never overlaps siblings', () => {
    const pos = layoutMultiwayTree('root', (id) => children[id], (id) => width[id], { hGap: 10, vGap: 70 })
    expect(pos.l).toEqual({ x: 30, y: 70 })
    expect(pos.m).toEqual({ x: 100, y: 70 })
    expect(pos.r).toEqual({ x: 185, y: 70 })
    expect(pos.root).toEqual({ x: 115, y: 0 })
    const right = (id: string) => pos[id].x + width[id] / 2
    const left = (id: string) => pos[id].x - width[id] / 2
    expect(right('l')).toBeLessThan(left('m'))
    expect(right('m')).toBeLessThan(left('r'))
  })

  it('a single node sits at its own center', () => {
    expect(layoutMultiwayTree('root', () => [], () => 40)).toEqual({ root: { x: 20, y: 0 } })
    expect(layoutMultiwayTree(null, () => [], () => 40)).toEqual({})
  })
})
