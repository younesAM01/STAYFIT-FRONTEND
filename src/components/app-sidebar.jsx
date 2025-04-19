'use client'
import React from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
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



const data = {
  navMain: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Users",
      icon: Users,
      href: "/users",
    },
  ],
  navBottom: [
    {
      title: "Settings",
      icon: Settings,
      url: "#",
    },
    
  ],
}

export function AppSidebar({ ...props }) {
  const { state } = useSidebar()

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
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                <a href={item.url} className="font-medium text-white">
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
          {data.navBottom.map((item) => (
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
