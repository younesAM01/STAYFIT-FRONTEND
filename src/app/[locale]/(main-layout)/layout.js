// src/app/[local]/(main)/layout.js

import LayoutWrapper from "@/components/layoutwraper";

export default function MainLayout({ children }) {
  return (
    <LayoutWrapper>
      {/* Common elements for aboutus, auth, services */}
      {children}
    </LayoutWrapper>
  );
}