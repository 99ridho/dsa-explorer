// Executable form of the SPEC.md §10.8 step tables.
import { describe, expect, it } from 'vitest'
import {
  buildArrayStack,
  buildLinkedStack,
  runArrayPop,
  runArrayPush,
  runEvaluate,
  runLinkedPop,
  runLinkedPush,
  tokenize,
} from './operations'
import type { ArrayStackSnapshot, LinkedStackSnapshot } from './types'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const seed = () => buildArrayStack([5, 9, 2], 4)

describe('resizing array', () => {
  it('push with room writes at n', () => {
    const { steps, finalSnapshot } = runArrayPush(seed(), 7)
    expect(lines(steps)).toEqual([2, 3])
    expect(steps[1].description).toBe('Placing 7 at index 3: the stack holds 4 items.')
    expect(steps[1].snapshot.highlight).toEqual({ indices: [3], kind: 'write' })
    expect((finalSnapshot as ArrayStackSnapshot).highlight).toBeUndefined()
  })

  it('the second push doubles the array', () => {
    const full = runArrayPush(seed(), 7).finalSnapshot as ArrayStackSnapshot
    const { steps, finalSnapshot } = runArrayPush(full, 1)
    expect(lines(steps)).toEqual([2, 10, 3])
    expect(steps[0].description).toBe('The array is full (4 of 4), so double it to 8.')
    expect(steps[1].description).toBe('Copying the 4 items into the new array of 8.')
    const a = finalSnapshot as ArrayStackSnapshot
    expect(a.slots.length).toBe(8)
    expect(a.slots.slice(0, 5)).toEqual([5, 9, 2, 7, 1])
  })

  it('pop reads the top and keeps the size, then halves at one-quarter full', () => {
    const one = runArrayPop(seed())
    expect(lines(one.steps)).toEqual([5, 6])
    expect(one.steps[0].description).toBe('Removing 2 from index 2: the stack holds 2 items.')
    const two = runArrayPop(one.finalSnapshot as ArrayStackSnapshot)
    expect(lines(two.steps)).toEqual([5, 6, 10])
    expect(two.steps[1].description).toBe('The array is one-quarter full (1 of 4), so halve it to 2.')
    expect((two.finalSnapshot as ArrayStackSnapshot).slots).toEqual([5, null])
  })

  it('pop on an empty stack is one step', () => {
    const { steps } = runArrayPop(buildArrayStack([], 4))
    expect(lines(steps)).toEqual([5])
    expect(steps[0].description).toBe('The stack is empty, so there is nothing to pop.')
  })
})

describe('linked list', () => {
  it('push creates a detached node then links it to the old first', () => {
    const { steps, finalSnapshot } = runLinkedPush(buildLinkedStack([5, 9, 2]), 7)
    expect(lines(steps)).toEqual([3, 4])
    expect(steps[0].description).toBe('Creating a node for 7: first now points at it.')
    expect((steps[0].snapshot as LinkedStackSnapshot).nodes.n3.next).toBeNull()
    expect(steps[1].description).toBe('Linking 7 to the old first node 2: the stack holds 4 items.')
    const s = finalSnapshot as LinkedStackSnapshot
    expect([s.firstId, s.nodes.n3.next]).toEqual(['n3', 'n2'])
  })

  it('push on an empty stack', () => {
    const { steps } = runLinkedPush(buildLinkedStack([]), 7)
    expect(lines(steps)).toEqual([3, 4])
    expect(steps[1].description).toBe('There was no old first node, so 7 is the only node: the stack holds 1 item.')
  })

  it('pop takes first and advances, ending empty', () => {
    const one = runLinkedPop(buildLinkedStack([5, 9]))
    expect(lines(one.steps)).toEqual([7, 8])
    expect(one.steps[0].description).toBe('Taking 9 from first.')
    expect(one.steps[1].description).toBe('first moves to 5: the stack holds 1 item.')
    const two = runLinkedPop(one.finalSnapshot as LinkedStackSnapshot)
    expect(two.steps[1].description).toBe('first becomes null: the stack is empty.')
    expect(lines(runLinkedPop(two.finalSnapshot as LinkedStackSnapshot).steps)).toEqual([7])
  })
})

describe('evaluate', () => {
  const expr = '( 1 + ( ( 2 + 3 ) * ( 4 * 5 ) ) )'

  it('tokenizes spaced and unspaced input the same way', () => {
    expect(tokenize('(1+(2*3))')).toEqual(tokenize('( 1 + ( 2 * 3 ) )'))
  })

  it('evaluates the reference expression to 101 without touching the stack', () => {
    const state = seed()
    const { steps, finalSnapshot } = runEvaluate(state, expr)
    expect(steps.at(-1)!.description).toBe('Every token is read, so the result is 101.')
    expect(steps.at(-1)!.highlightLine).toBe(9)
    expect(steps.every((s) => s.snapshot.eval !== undefined)).toBe(true)
    expect(finalSnapshot).toEqual(state)
    expect(steps[1].description).toBe('Token 1 is a number, so push it onto the operand stack.')
    expect(steps[2].description).toBe('Token + is an operator, so push it onto the operator stack.')
    const apply = steps.find((s) => s.description.startsWith('Token ) closes'))!
    expect(apply.description).toBe('Token ) closes a group, so pop +, 3, and 2.')
    expect(apply.snapshot.eval?.focus).toBe('apply')
  })

  it('stops on an unknown token, a division by zero, and an underflow', () => {
    const bad = runEvaluate(seed(), '( 1 + x )')
    expect(lines(bad.steps).at(-1)).toBe(2)
    expect(bad.steps.at(-1)!.description).toBe('Token x is not a number, an operator, or a parenthesis, so evaluation stops.')
    const zero = runEvaluate(seed(), '( 1 / 0 )')
    expect(lines(zero.steps).at(-1)).toBe(7)
    expect(zero.steps.at(-1)!.description).toBe('1 / 0 has no value, so evaluation stops.')
    const under = runEvaluate(seed(), '( 1 )')
    expect(lines(under.steps).at(-1)).toBe(6)
  })

  it('prints a non-integer result with two decimals', () => {
    const { steps } = runEvaluate(buildLinkedStack([1]), '( 1 / 4 )')
    expect(steps.at(-1)!.description).toBe('Every token is read, so the result is 0.25.')
  })
})
