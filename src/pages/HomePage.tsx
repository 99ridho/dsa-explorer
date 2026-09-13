import { Link } from 'react-router'
import { ArrowRightIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { topicsByWeek } from '@/topics/registry'

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">DSA Interactive Explorer</h1>
        <p className="max-w-prose text-muted-foreground">
          Build and operate on the data structures from Weeks 9–15 of the course, one step at a time. Each
          operation animates against its pseudocode; scrub back and forth to see how the structure changes.
        </p>
      </section>

      {topicsByWeek().map((group) => (
        <section key={group.weekLabel} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{group.weekLabel}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.topics.map((topic) => (
              <Link key={topic.slug} to={`/topic/${topic.slug}`} className="group rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full transition-colors group-hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <Badge variant="outline" className="font-mono">
                        {topic.weekLabel}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      {topic.operations.length > 0
                        ? `${topic.operations.length} operations`
                        : 'Visualization planned'}
                      <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
