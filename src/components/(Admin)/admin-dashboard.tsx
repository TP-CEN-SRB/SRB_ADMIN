"use client"

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
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Map, 
  UserCog, 
  UserPlus, 
  Trash2, 
  TestTube, 
  Wifi, 
  Recycle,
  Users,
  Trophy, 
  MessageSquare,
  Target,
  Calendar,
  ClipboardList,
  Store,
  MailCheck,
  Ticket,
  Receipt,
  ScrollText
} from 'lucide-react'

export default function AdminDashboard() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent className="pt-16">

        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                  <Link href="/admin" className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Bin Manager Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Bin Manager</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/manager/map'}>
                  <Link href="/admin/bin/manager/map" className="flex items-center gap-3">
                    <Map className="h-4 w-4" />
                    Bin Map
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/manager/create'}>
                  <Link href="/admin/bin/manager/create" className="flex items-center gap-3">
                    <UserPlus className="h-4 w-4" />
                    Create Bin Manager
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/manager'}>
                  <Link href="/admin/bin/manager" className="flex items-center gap-3">
                    <UserCog className="h-4 w-4" />
                    View Bin Managers
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/manager/subscription'}>
                  <Link href="/admin/bin/manager/subscription" className="flex items-center gap-3">
                    <MailCheck className="h-4 w-4" />
                    Subscriptions
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bins Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Bins</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin'}>
                  <Link href="/admin/bin" className="flex items-center gap-3">
                    <Trash2 className="h-4 w-4" />
                    View Bins
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/test'}>
                  <Link href="/admin/bin/test" className="flex items-center gap-3">
                    <TestTube className="h-4 w-4" />
                    Test Bins
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/heartbeat'}>
                  <Link href="/admin/bin/heartbeat" className="flex items-center gap-3">
                    <Wifi className="h-4 w-4" />
                    Bins Online
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Materials Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Materials</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/bin/material'}>
                  <Link href="/admin/bin/material" className="flex items-center gap-3">
                    <Recycle className="h-4 w-4" />
                    Materials
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Members Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Members</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/member'}>
                  <Link href="/admin/member" className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    View Members
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/member/leaderboard'}>
                  <Link href="/admin/member/leaderboard" className="flex items-center gap-3">
                    <Trophy className="h-4 w-4" />
                    Leaderboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/member/feedback'}>
                  <Link href="/admin/member/feedback" className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    Feedback & Reports
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Activity Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Activity</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/activity/quest'}>
                  <Link href="/admin/activity/quest" className="flex items-center gap-3">
                    <Target className="h-4 w-4" />
                    View Active Quest
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/activity/event'}>
                  <Link href="/admin/activity/event" className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    View Events
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/activity/quest-template'}>
                  <Link href="/admin/activity/quest-template" className="flex items-center gap-3">
                    <ClipboardList className="h-4 w-4" />
                    View Quest Templates
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Store Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/store'}>
                  <Link href="/admin/store" className="flex items-center gap-3">
                    <Store className="h-4 w-4" />
                    Stores
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Rewards Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Rewards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/voucher'}>
                  <Link href="/admin/voucher" className="flex items-center gap-3">
                    <Ticket className="h-4 w-4" />
                    Vouchers
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Transactions Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Transactions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/transaction'}>
                  <Link href="/admin/transaction" className="flex items-center gap-3">
                    <Receipt className="h-4 w-4" />
                    All Transactions
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Activity Log Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Activity Log</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/crashlog'}>
                  <Link href="/admin/crashlog" className="flex items-center gap-3">
                    <ScrollText className="h-4 w-4" />
                    Activity Log
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