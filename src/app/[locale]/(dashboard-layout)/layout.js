// src/app/[local]/(dashboard)/layout.js
'use client'

import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar collapsible="icon" />
        {!isMobile && (
          <SidebarInset>
            <main className="flex-1">
              <div className="p-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        )}
        {isMobile && (
          <main className="flex-1 w-full">
            <div className="p-4 mt-16">
              {children}
            </div>
          </main>
        )}
      </div>
    </SidebarProvider>
  );
}