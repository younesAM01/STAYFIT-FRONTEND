// src/app/[local]/(main)/layout.js
'use client'
import LayoutWrapper from "@/components/layoutwraper";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
export default function MainLayout({ children }) {
  return (
    <Provider store={store}>
    <LayoutWrapper>
      {/* Common elements for aboutus, auth, services */}
      {children}
      <Toaster />
    </LayoutWrapper>
    </Provider>
  );
}