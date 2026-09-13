import { Card, CardContent } from '@/components/ui/card'

/** Shown by topics whose operations and canvas are not built yet. The spec section for each lives in the topic's canvas.tsx. */
export function PlaceholderCanvas({ title }: { title: string }) {
  return (
    <Card className="border-dashed bg-muted/40 shadow-none">
      <CardContent className="flex h-48 flex-col items-center justify-center gap-1 text-center">
        <p className="font-medium">The {title} visualization is not built yet.</p>
        <p className="text-sm text-muted-foreground">The course material for this week is complete.</p>
      </CardContent>
    </Card>
  )
}
