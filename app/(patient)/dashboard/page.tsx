import { createClient } from "@/lib/supabase/server";
import { getDashboardDataAction } from "./dashboard-data";
import { DashboardClient } from "./_dashboard-client";

/**
 * Server Component — fetches all dashboard data before rendering.
 * No client-side loading state, no useEffect waterfall.
 * The loading.tsx skeleton is shown by Next.js during the server fetch.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  // Run auth lookup and 5-query data fetch in parallel
  const [{ data: { user } }, dashData] = await Promise.all([
    supabase.auth.getUser(),
    getDashboardDataAction(),
  ]);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name    ||
    user?.email?.split("@")[0]   ||
    "Patient";

  return <DashboardClient data={dashData} displayName={displayName} />;
}
