import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/app/[locale]/(main-layout)/auth/actions";

export default async function AdminLayout({ children }) {
  // Check if user is authenticated with Supabase
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login page
  if (!session) {
    redirect("/en/auth/login?returnUrl=/en/admin");
  }

  // Use the existing getUser server action to check role in MongoDB
  const userData = await getUser(session.user.id);

  // If failed to get user data or user doesn't have admin/super admin role
  if (
    !userData ||
    userData.success === false ||
    (userData.role !== "admin" && userData.role !== "super admin")
  ) {
    // Redirect to home page
    redirect("/en");
  }

  // If user is authenticated and has admin role, render the admin layout
  return <div className="admin-layout">{children}</div>;
}