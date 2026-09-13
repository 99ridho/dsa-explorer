import { describe, expect, it } from 'vitest'
import { topics, topicsByWeek } from './registry'

const weekStart = (label: string) => Number(/\d+/.exec(label)![0])

describe('registry', () => {
  it('has unique slugs', () => {
    expect(new Set(topics.map((t) => t.slug)).size).toBe(topics.length)
  })

  it('lists topics in week order', () => {
    const starts = topics.map((t) => weekStart(t.weekLabel))
    expect([...starts].sort((a, b) => a - b)).toEqual(starts)
    expect(topicsByWeek().map((g) => g.weekLabel)).toEqual([...new Set(topics.map((t) => t.weekLabel))])
  })
})
