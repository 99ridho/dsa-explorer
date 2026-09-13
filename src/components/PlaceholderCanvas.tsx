import { Card, CardContent } from '@/components/ui/card'

/** Shown by topics whose operations/canvas haven't been implemented yet. */
export function PlaceholderCanvas({ title, specSection }: { title: string; specSection: string }) {
  return (
    <Card className="border-dashed bg-muted/40 shadow-none">
      <CardContent className="flex h-48 flex-col items-center justify-center gap-1 text-center">
        <p className="font-medium">{title} visualization is planned.</p>
        <p className="text-sm text-muted-foreground">
          Snapshot shape, canvas rule, and step tables are specified in SPEC.md {specSection}.
        </p>
      </CardContent>
    </Card>
  )
}
