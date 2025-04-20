// /src/components/LayoutWrapper.js
"use client"
import Navbar from "@/components/ui/navbar-menu";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/sonner";
export default function LayoutWrapper({ children }) {
 
 
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Toaster />
      <Footer />
    </>
  );
}