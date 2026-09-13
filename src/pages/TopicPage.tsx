// SPEC.md §6 — generic topic page: visualizer (left, sticky) beside the course materials (right, tabbed).
import { Navigate, useParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MarkdownContent } from '@/components/MarkdownContent'
import { VisualizerShell } from '@/components/visualizer/VisualizerShell'
import { getTopic } from '@/topics/registry'

export function TopicPage() {
  const { slug } = useParams()
  const topic = getTopic(slug)

  if (!topic) return <Navigate to="/" replace />

  return (
    <article className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        <Badge className="font-mono">{topic.weekLabel}</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Sticks below the 3.5rem header + 1rem breathing room while the materials scroll. */}
        <section
          aria-labelledby="visualizer"
          className="min-w-0 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:self-start lg:overflow-y-auto"
        >
          <h2 id="visualizer" className="sr-only">
            Visualizer
          </h2>
          {/* key={slug} guarantees a fresh state when navigating between topics */}
          <VisualizerShell key={topic.slug} topic={topic} />
        </section>

        <section aria-label="Course materials" className="min-w-0">
          <Tabs key={topic.slug} defaultValue="usage">
            <TabsList className="w-full">
              <TabsTrigger value="usage" className="flex-1">
                Real-World Usage
              </TabsTrigger>
              <TabsTrigger value="core" className="flex-1">
                Core Material
              </TabsTrigger>
            </TabsList>
            <TabsContent value="usage">
              <MarkdownContent markdown={topic.content.realWorldUsage} />
            </TabsContent>
            <TabsContent value="core">
              <MarkdownContent markdown={topic.content.coreMaterial} />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </article>
  )
}
