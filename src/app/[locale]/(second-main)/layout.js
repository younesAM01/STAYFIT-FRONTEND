"use client";
import "../../globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AuthProvider } from "@/context/authContext";
import { store } from "@/redux/store";
import React from "react"; // Make sure path is correct based on your file structure
import { Provider } from "react-redux";

export default function SecondMainLayout({ children }) {
  return (
    
       
    <Provider store={store}>
      <AuthProvider>
        <div className="min-h-screen subtle-brand-background">
          <SidebarProvider>
            <AppSidebar collapsible="icon" />
            <SidebarInset>
              {/* Mobile Navigation Bar */}
              <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d111a] border-b border-gray-800">
                <div className="flex items-center justify-between px-4 h-16">
                  <span className="text-[#B4E90E] font-semibold">StayFit</span>
                  <SidebarTrigger className="text-[#B4E90E]" />
                </div>
              </div>

              <main className="flex-1 subtle-brand-background">
                <div className="p-8 pt-24 md:pt-8 ">{children}</div>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </AuthProvider>
    </Provider>
  );
}