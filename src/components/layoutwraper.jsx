// /src/components/LayoutWrapper.js
"use client"

import { usePathname } from 'next/navigation';
import Navbar from "@/components/ui/navbar-menu";
import Footer from "@/components/ui/footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname.includes('/dashboard');

  return (
    <>
      {!isDashboard && <Navbar />}
      <main>{children}</main>
      {!isDashboard && <Footer />}
    </>
  );
}