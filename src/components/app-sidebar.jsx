'use client'
import React from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
  Calendar
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/authContext"
import { useLocale } from "next-intl"

export function AppSidebar({ ...props }) {
  const locale = useLocale()
  const { mongoUser } = useAuth()
  const { state } = useSidebar()
  console.log(mongoUser)

  // Define navigation items based on user role
  const getNavItems = () => {
    const isAdmin = mongoUser?.role === 'admin' || mongoUser?.role === 'super_admin'
    
    // Dashboard link differs based on role
    const dashboardItem = {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: isAdmin ? `/${locale}/admin` : `/${locale}/coach`,
    }
    
    // Calendar link differs based on role
    const calendarItem = {
      title: "Calendar",
      icon: Calendar,
      href: isAdmin ? `/${locale}/admin/calendar` : `/${locale}/coach/calendar`,
    }
    
    const usersItem = {
      title: "Users",
      icon: Users,
      href: `/${locale}/admin/users`
    }
    
    // Build nav items array based on role
    let navItems = [dashboardItem, calendarItem]
    
    // If user is admin or super admin, add the users link
    if (isAdmin) {
      navItems = [dashboardItem, usersItem, calendarItem]
    }
    
    return navItems
  }

  const navMain = getNavItems()
  
  const navBottom = [
    {
      title: "Settings",
      icon: Settings,
      url: "#",
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props} className="subtle-brand-background">
      <SidebarHeader className="relative">
        {state === "expanded" && (
          <SidebarTrigger className="absolute right-2 top-2 z-10 text-[#B4E90E] hover:bg-sidebar-accent hover:text-[#B4E90E]" />
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lime Platform">
              <a className="text-[#B4E90E]">
                LOGO
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                <a href={item.href} className="font-medium text-white">
                  {item.customIcon || <item.icon className="text-[#B4E90E]" />}
                  <span className="text-white">{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url} className="text-white">{subItem.title}</a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {navBottom.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} className="font-medium text-white">
                  {item.customIcon || <item.icon className="text-[#B4E90E]" />}
                  <span className="text-white">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {state === "collapsed" && (
            <SidebarMenuItem>
              <SidebarTrigger className="mx-auto my-4 text-[#B4E90E] hover:bg-sidebar-accent hover:text-[#B4E90E]" />
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}