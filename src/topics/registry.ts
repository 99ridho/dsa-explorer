// Single source of truth for navigation and routes: SPEC.md §7.
// Adding a topic = adding one entry here (§14).
import type { TopicModule } from '@/types/step-engine'
import { queue } from './queue'
import { stack } from './stack'
import { linkedList } from './linked-list'
import { bst } from './bst'
import { binaryHeap } from './binary-heap'
import { hashTable } from './hash-table'
import { graph } from './graph'

// Cast: each module is strongly typed internally; the registry erases those params.
// Registry order is week order: it drives the sidebar and the home page.
export const topics: TopicModule[] = [
  queue as unknown as TopicModule,
  stack as unknown as TopicModule,
  linkedList as unknown as TopicModule,
  bst as unknown as TopicModule,
  binaryHeap as unknown as TopicModule,
  hashTable as unknown as TopicModule,
  graph as unknown as TopicModule,
]

export function getTopic(slug: string | undefined): TopicModule | undefined {
  return topics.find((t) => t.slug === slug)
}

/** Groups topics by their weekLabel, preserving registry order. */
export function topicsByWeek(): { weekLabel: string; topics: TopicModule[] }[] {
  const groups: { weekLabel: string; topics: TopicModule[] }[] = []
  for (const topic of topics) {
    const group = groups.find((g) => g.weekLabel === topic.weekLabel)
    if (group) group.topics.push(topic)
    else groups.push({ weekLabel: topic.weekLabel, topics: [topic] })
  }
  return groups
}
