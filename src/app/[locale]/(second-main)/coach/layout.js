import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUser } from "@/app/[locale]/(main-layout)/auth/actions";

export default async function CoachLayout({ children }) {
  // Check if user is authenticated with Supabase
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login page
  if (!session) {
    redirect("/en/auth/login?returnUrl=/en/coach");
  }

  // Use the existing getUser server action to check role in MongoDB
  const userData = await getUser(session.user.id);

  // If failed to get user data or user doesn't have coach role
  if (
    !userData ||
    userData.success === false ||
    userData.role !== "coach"
  ) {
    // Redirect to home page
    redirect("/en");
  }

  // If user is authenticated and has coach role, render the coach layout
  return <div className="coach-layout">{children}</div>;
}
