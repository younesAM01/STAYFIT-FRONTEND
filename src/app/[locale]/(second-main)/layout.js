'use client'
import "../../globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react"// Make sure path is correct based on your file structure

export default function SecondMainLayout({ children }) {
  return (
    <div className="min-h-screen subtle-brand-background">
    <SidebarProvider>
      <AppSidebar collapsible="icon" />
      <SidebarInset>
        <SidebarTrigger className="md:hidden" /> {/* Show only on mobile */}
        <main className="flex-1 subtle-brand-background">
          <div className="p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  </div>
  );
}