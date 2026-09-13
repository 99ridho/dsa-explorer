// SPEC.md §6 — generic topic page: realWorldUsage → VisualizerShell → coreMaterial.
import { Navigate, useParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { MarkdownContent } from '@/components/MarkdownContent'
import { VisualizerShell } from '@/components/visualizer/VisualizerShell'
import { getTopic } from '@/topics/registry'

export function TopicPage() {
  const { slug } = useParams()
  const topic = getTopic(slug)

  if (!topic) return <Navigate to="/" replace />

  return (
    <article className="space-y-10">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        <Badge className="font-mono">{topic.weekLabel}</Badge>
      </header>

      <section aria-labelledby="real-world-usage">
        <h2 id="real-world-usage" className="text-xl font-semibold tracking-tight">
          Real-World Usage and Reasoning
        </h2>
        <MarkdownContent markdown={topic.content.realWorldUsage} />
      </section>

      <section aria-labelledby="visualizer">
        <h2 id="visualizer" className="mb-4 text-xl font-semibold tracking-tight">
          Visualizer
        </h2>
        {/* key={slug} guarantees a fresh state when navigating between topics */}
        <VisualizerShell key={topic.slug} topic={topic} />
      </section>

      <section aria-labelledby="core-material">
        <h2 id="core-material" className="text-xl font-semibold tracking-tight">
          Core Material
        </h2>
        <MarkdownContent markdown={topic.content.coreMaterial} />
      </section>
    </article>
  )
}
