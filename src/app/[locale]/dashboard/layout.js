// /src/app/[locale]/dashboard/layout.js
"use client"

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      {/* You can add dashboard-specific elements here, like a sidebar */}
      <main>{children}</main>
    </div>
  )
}