// Executable form of the SPEC.md §19.1 step tables, on the seed curriculum.
import { describe, expect, it } from 'vitest'
import { hashCode, runAddCourse, runAddPrerequisite, runPlanAlphabetical, runPlanTopological } from './operations'
import { CANDIDATE_PREREQUISITES, COURSE_POOL, randomPlan, studyPlanSimulator } from './simulator'

const lines = (steps: { highlightLine: number }[]) => steps.map((s) => s.highlightLine)
const descs = (steps: { description: string }[]) => steps.map((s) => s.description)
const seed = () => studyPlanSimulator.createInitialState()

describe('index', () => {
  it('hashes codes with R = 31 mod 11', () => {
    expect(hashCode('PR3')).toBe(9)
    expect(hashCode('MTH')).toBe(3)
    expect(seed().buckets[7].map((e) => e.code)).toEqual(['PR1', 'DB'])
  })
})

describe('add course', () => {
  it('hashes, scans the bucket, adds a vertex, then appends', () => {
    const { steps, finalSnapshot } = runAddCourse(seed(), 'pr3')
    expect(lines(steps)).toEqual([2, 3, 4, 5])
    expect(descs(steps)).toEqual([
      'PR3 hashes to bucket 9.',
      'Comparing PR3 with AI in bucket 9.',
      'PR3 becomes vertex 8 of the digraph, with no prerequisites yet.',
      'Appending PR3 to bucket 9: the index now holds 9 courses.',
    ])
    expect(steps.map((s) => s.snapshot.focus)).toEqual(['index', 'index', 'graph', 'index'])
    expect(finalSnapshot.codes[8]).toBe('PR3')
    expect(finalSnapshot.graph.vertices[8].label).toBe('PR3')
    expect(finalSnapshot.focus).toBe('graph')
  })

  it('leaves a known code alone', () => {
    const { steps, finalSnapshot } = runAddCourse(seed(), 'MTH')
    expect(descs(steps).at(-1)).toBe('MTH is already course 0, so nothing changes.')
    expect(finalSnapshot.codes).toHaveLength(8)
  })

  it('rejects a malformed code and a full plan', () => {
    expect(descs(runAddCourse(seed(), 'toolong').steps)).toEqual(['A course code has 2 to 4 letters or digits, such as PR3.'])
    let s = seed()
    s = runAddCourse(s, 'X1').finalSnapshot
    s = runAddCourse(s, 'X2').finalSnapshot
    const full = runAddCourse(s, 'X3')
    expect(descs(full.steps).at(-1)).toBe('The plan holds at most 10 courses, so X3 is not added.')
    expect(full.steps.at(-1)!.highlightLine).toBe(4)
  })
})

describe('add prerequisite', () => {
  it('looks up both codes and adds the edge', () => {
    const { steps, finalSnapshot } = runAddPrerequisite(seed(), 'PR1 before AI')
    expect(lines(steps)).toEqual([2, 2, 2, 3, 3, 3, 5])
    expect(descs(steps).at(-1)).toBe('Added edge PR1 to AI: take PR1 first.')
    expect(steps.at(-1)!.variables).toEqual({ compares: 2 })
    expect(finalSnapshot.graph.edges).toHaveLength(9)
    expect(finalSnapshot.graph.edges.every((e) => e.state === undefined)).toBe(true)
  })

  it('reads the course taken first on the left of before', () => {
    const { finalSnapshot } = runAddPrerequisite(seed(), '  mth   BEFORE  pr1 ')
    const codes = finalSnapshot.codes
    expect(finalSnapshot.graph.edges.some((e) => codes[Number(e.from)] === 'MTH' && codes[Number(e.to)] === 'PR1')).toBe(true)
    for (const text of ['PR1-PR2', 'PR1 after PR2', 'PR1 before', 'toolong before PR2']) {
      expect(descs(runAddPrerequisite(seed(), text).steps), text).toEqual([
        'Type the course taken first, then before, then the next course, such as PR1 before PR2.',
      ])
    }
  })

  it('stops on a missing code, a self-loop, and an existing edge', () => {
    expect(descs(runAddPrerequisite(seed(), 'X9 before PR1').steps)).toEqual([
      'X9 hashes to bucket 2.',
      'X9 is not in the index. Add it as a course first.',
    ])
    expect(descs(runAddPrerequisite(seed(), 'DB before db').steps)).toEqual(['A course cannot be its own prerequisite.'])
    expect(descs(runAddPrerequisite(seed(), 'pr1 before PR2').steps).at(-1)).toBe('PR1 is already a prerequisite of PR2.')
  })
})

describe('build study plan', () => {
  it('topological: DFS postorder, reversed', () => {
    const { steps, finalSnapshot } = runPlanTopological(seed())
    expect(descs(steps).slice(0, 7)).toEqual([
      'MTH is unmarked, so start a DFS from MTH.',
      'Visiting MTH.',
      'AI lists MTH as a prerequisite.',
      'AI is unmarked, so visit AI next.',
      'Visiting AI.',
      'Finished AI: it joins the postorder.',
      'Finished MTH: it joins the postorder.',
    ])
    expect(lines(steps).slice(0, 7)).toEqual([3, 6, 7, 9, 6, 10, 10])
    expect(descs(steps)).toContain('AI is already marked, so skip it.')
    const last = steps.at(-1)!
    expect(last.description).toBe('Study plan: DSC, PR1, PR2, DB, WEB, DSA, MTH, AI.')
    expect(last.highlightLine).toBe(4)
    expect(last.snapshot.plan).toEqual({ order: ['DSC', 'PR1', 'PR2', 'DB', 'WEB', 'DSA', 'MTH', 'AI'], late: [] })
    expect(finalSnapshot.plan).toBeUndefined()
  })

  it('topological: reports a cycle and stops', () => {
    const cyclic = runAddPrerequisite(seed(), 'AI before PR1').finalSnapshot
    const { steps } = runPlanTopological(cyclic)
    expect(steps.at(-1)!.description).toBe('AI is still on the call stack, so the prerequisites form a cycle and no study plan exists.')
    expect(steps.at(-1)!.highlightLine).toBe(8)
    expect(steps.some((s) => s.snapshot.focus === 'plan')).toBe(false)
  })

  it('alphabetical: counts every broken prerequisite', () => {
    const { steps } = runPlanAlphabetical(seed())
    expect(lines(steps)).toEqual([2, 3, 4, 4, 4, 3, 3, 4, 4, 5])
    expect(descs(steps)[0]).toBe('Sorting the codes from A to Z gives AI, DB, DSA, DSC, MTH, PR1, PR2, WEB.')
    expect(descs(steps)[2]).toBe('DSA comes before its prerequisite PR2: violation 1.')
    expect(descs(steps).at(-1)).toBe('The alphabetical plan breaks 5 prerequisites.')
    expect(steps.at(-1)!.snapshot.plan!.late).toEqual(['DSA', 'DB', 'AI'])
  })
})

describe('randomize', () => {
  it('draws 6 to 9 pool courses, each on a candidate prerequisite, always a DAG', () => {
    const candidates = new Set(CANDIDATE_PREREQUISITES.map(([a, b]) => `${a}>${b}`))
    for (let i = 0; i < 500; i++) {
      const s = randomPlan()
      expect(s.codes.length).toBeGreaterThanOrEqual(6)
      expect(s.codes.length).toBeLessThanOrEqual(9)
      for (const code of s.codes) expect(COURSE_POOL).toContain(code)
      expect(s.graph.edges.length).toBeGreaterThanOrEqual(3)
      const linked = new Set(s.graph.edges.flatMap((e) => [e.from, e.to]))
      expect(linked.size, 'every course has a prerequisite edge').toBe(s.codes.length)
      for (const e of s.graph.edges) expect(candidates.has(`${s.codes[Number(e.from)]}>${s.codes[Number(e.to)]}`)).toBe(true)
      expect(s.focus).toBe('graph')
      expect(runPlanTopological(s).steps.at(-1)!.description).toMatch(/^Study plan: /)
    }
  })
})
