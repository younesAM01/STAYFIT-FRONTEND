'use client'
import React, { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Settings,
  Users,
  Menu, 
  X
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

// Sample navigation data
const data = {
  navMain: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/en/dashboard",
    },
    {
      title: "Users",
      icon: Users,
      href: "/en/users",
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
  const [isMobile, setIsMobile] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-[#0d111a] px-4 py-2 h-16">
          <div className="text-[#B4E90E] font-bold">LOGO</div>
          <button 
            onClick={toggleMobileMenu}
            className="text-[#B4E90E] p-2"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <div 
          className={`fixed top-16 left-0 right-0 z-20 bg-[#0d111a] transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          <nav className="p-4">
            {/* Main Navigation Items */}
            <ul className="space-y-4 mb-6 border-b border-gray-700 pb-4">
              {data.navMain.map((item) => (
                <li key={item.title}>
                  <a 
                    href={item.href || item.url} 
                    className="flex items-center gap-3 text-white py-2 px-1"
                  >
                    <item.icon className="text-[#B4E90E]" size={20} />
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Bottom Navigation Items */}
            <ul className="space-y-4">
              {data.navBottom.map((item) => (
                <li key={item.title}>
                  <a 
                    href={item.url} 
                    className="flex items-center gap-3 text-white py-2 px-1"
                  >
                    <item.icon className="text-[#B4E90E]" size={20} />
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Add spacer for fixed header */}
        <div className="h-16"></div>
      </>
    )
  }
  
  // Desktop sidebar
  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#0d111a]">
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
                <a href={item.href || item.url} className="font-medium text-white">
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