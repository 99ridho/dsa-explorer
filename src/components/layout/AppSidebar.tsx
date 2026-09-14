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
        <p className="text-sm font-medium text-muted-foreground">
          Data Structure & Algorithms Course
        </p>
        <div className='gap-y-2'>
          <p className="text-xs text-muted-foreground">Information System & Technology</p>
          <p className="text-xs text-muted-foreground">Universitas Negeri Jakarta</p>
        </div>
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
                          <Badge className="font-mono text-[10px]">
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
          Reference: <a href='https://algs4.cs.princeton.edu/home/'>Sedgewick &amp; Wayne, <em>Algorithms</em>, 4th ed.</a>
        </p>
        <p className="text-xs text-muted-foreground">
          Built by <a href='https://github.com/99ridho/dsa-explorer'>@99ridho</a> + Claude
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
