import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

import Link from 'next/link'

export default function AdminDashboard(){
    return(
    <Sidebar>
      <SidebarContent className="pt-16">

        <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin" className="flex items-center gap-3 hover:text-white">
                      Dashboard
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
        <SidebarGroupLabel>Bin Manager</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/manager/map" className="flex items-center gap-3 hover:text-white">
                      Bin Map
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/manager" className="flex items-center gap-3 hover:text-white">
                      View Bin Managers
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/manager/create" className="flex items-center gap-3 hover:text-white">
                      Create Bin Manager
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Bins</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin" className="flex items-center gap-3 hover:text-white">
                      View Bins
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/test" className="flex items-center gap-3 hover:text-white">
                      Test Bins
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/heartbeat" className="flex items-center gap-3 hover:text-white">
                      Bins Online
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Materials</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/material" className="flex items-center gap-3 hover:text-white">
                      View Materials
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/bin/material/create" className="flex items-center gap-3 hover:text-white">
                      Create Material
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        

        <SidebarGroup>
          <SidebarGroupLabel>Members</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/member" className="flex items-center gap-3 hover:text-white">
                      View Members
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/member/dashboard" className="flex items-center gap-3 hover:text-white">
                      Leaderboard
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/member/feedback" className="flex items-center gap-3 hover:text-white">
                      Feedback
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/member/fault-reports" className="flex items-center gap-3 hover:text-white">
                      Fault Reports
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Activity</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/activity/quest" className="flex items-center gap-3 hover:text-white">
                      View Active Quest
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/activity/event" className="flex items-center gap-3 hover:text-white">
                      View Events
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/activity/quest-template" className="flex items-center gap-3 hover:text-white">
                      View Quest Templates
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/activity/quest-template/create" className="flex items-center gap-3 hover:text-white">
                      Create Quest Templates
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/activity/event/create" className="flex items-center gap-3 hover:text-white">
                      Create Event Templates
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/store" className="flex items-center gap-3 hover:text-white">
                      View Stores
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/store/create" className="flex items-center gap-3 hover:text-white">
                      Create Store
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Crash Log</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/admin/crashlog" className="flex items-center gap-3 hover:text-white">
                      Messages
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>  
    )

}
