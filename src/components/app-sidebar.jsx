'use client'
import React, { useState, useRef, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  LogOut,
  ChevronRight
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
import logo from "@/assets/stayfit11.png";
import { useAuth } from "@/context/authContext"
import { useLocale } from "next-intl"
import Image from "next/image"

export function AppSidebar({ ...props }) {
  const locale = useLocale()
  const { mongoUser, signOut } = useAuth()
  const { state } = useSidebar()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileRef = useRef(null)
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
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!mongoUser?.firstName) return "U";
    
    const nameParts = mongoUser.firstName.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  }

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  return (
    <Sidebar collapsible="icon" {...props} className="subtle-brand-background">
      <SidebarHeader className="relative">
        {state === "expanded" && (
          <SidebarTrigger className="absolute right-2 top-2 z-10 text-[#B4E90E] hover:bg-sidebar-accent hover:text-[#B4E90E]" />
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Lime Platform">
              <Image src={logo} alt="STAY FiT" width={40} height={40} />
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
          <SidebarMenuItem>
            <div ref={profileRef} className="relative">
              <SidebarMenuButton 
                onClick={toggleProfileMenu} 
                tooltip="Profile"
                className="font-medium text-white relative"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#B4E90E] text-black text-xs font-bold">
                  {getUserInitials()}
                </div>
                {state === "expanded" && (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-white">Profile</span>
                    <ChevronRight 
                      className={`w-4 h-4 text-[#B4E90E] transition-transform ${showProfileMenu ? 'rotate-90' : ''}`} 
                    />
                  </div>
                )}
              </SidebarMenuButton>
              {showProfileMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-48 p-3 bg-slate-800 rounded-md shadow-lg text-xs z-10">
                  <div className="absolute -bottom-2 left-3 w-4 h-4 bg-slate-800 transform rotate-45"></div>
                  <div className="flex">
                  <p className="text-white font-medium mb-1 mr-1">{mongoUser?.firstName || "User"}</p><p className="text-white font-medium mb-1">{mongoUser?.lastName || "lastName"}</p>
                  </div>
                  <p className="text-gray-300 mb-2 break-words">{mongoUser?.email || "email@example.com"}</p>
                  <a 
                    href={`/${locale}/profile`} 
                    className="block text-[#B4E90E] hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut} 
              tooltip="Sign Out"
              className="font-medium text-white"
            >
              <LogOut className="text-[#B4E90E]" />
              {state === "expanded" && <span className="text-white">Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
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