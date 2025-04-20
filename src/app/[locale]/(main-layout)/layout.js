// src/app/[local]/(main)/layout.js

import LayoutWrapper from "@/components/layoutwraper";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout({ children }) {
  return (
    <LayoutWrapper>
      {/* Common elements for aboutus, auth, services */}
      {children}
      <Toaster />
    </LayoutWrapper>
  );
}