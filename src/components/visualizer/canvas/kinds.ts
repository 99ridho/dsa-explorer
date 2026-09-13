// Highlight kind to Tailwind classes, shared by the row canvases. Theme colors only, so dark mode follows.
export const ARRAY_KIND: Record<string, string> = {
  write: 'border-accent bg-accent text-accent-foreground',
  read: 'border-chart-5 bg-chart-5/30',
  copy: 'border-secondary-foreground bg-secondary',
  full: 'border-destructive bg-destructive/15',
}

export const LINKED_KIND: Record<string, string> = {
  new: 'border-accent bg-accent text-accent-foreground',
  current: 'border-chart-5 bg-chart-5/30',
  visited: 'border-secondary-foreground bg-secondary',
  found: 'border-chart-5 bg-chart-5/30',
}
