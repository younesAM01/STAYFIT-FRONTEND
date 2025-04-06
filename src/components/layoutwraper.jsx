// /src/components/LayoutWrapper.js
"use client"

import { usePathname } from 'next/navigation';
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





// if (isDashboard) {
//   return (
//     <SidebarProvider>
//       <div className="flex min-h-screen">
//         <AppSidebar collapsible="icon" />
//         <SidebarInset>
//           <main className="flex-1">
//             <div className="p-8">
//               {children}
//             </div>
//           </main>
//         </SidebarInset>
//       </div>
//     </SidebarProvider>
//   );
// }