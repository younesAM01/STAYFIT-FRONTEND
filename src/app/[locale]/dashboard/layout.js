// /src/app/[locale]/dashboard/layout.js

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* You can add dashboard-specific elements here, like a sidebar */}
      <main className="p-4">{children}</main>
    </div>
  )
}