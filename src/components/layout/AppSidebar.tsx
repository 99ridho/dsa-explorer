// SPEC.md §8: topic nav grouped by week range, driven entirely by the registry.
import { NavLink } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { topicsByWeek } from '@/topics/registry'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          Algoritma dan Struktur Data
        </p>
        <p className="text-sm text-muted-foreground">Universitas Negeri Jakarta</p>
      </SidebarHeader>
      <SidebarContent>
        {topicsByWeek().map((group) => (
          <SidebarGroup key={group.weekLabel}>
            <SidebarGroupLabel>{group.weekLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.topics.map((topic) => (
                  <SidebarMenuItem key={topic.slug}>
                    <NavLink to={`/topic/${topic.slug}`}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} className="justify-between">
                          <span>{topic.title}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {topic.weekLabel}
                          </Badge>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Reference: Sedgewick &amp; Wayne, <em>Algorithms</em>, 4th ed.
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
