// /src/components/LayoutWrapper.js
"use client"
import Navbar from "@/components/ui/navbar-menu";
import Footer from "@/components/ui/footer";

export default function LayoutWrapper({ children }) {
 
 
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}