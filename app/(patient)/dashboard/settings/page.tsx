import { createClient } from "@/lib/supabase/server";
import { getSettingsDataAction } from "./actions";
import SettingsClient from "./_settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initialProfile = await getSettingsDataAction();
  return (
    <SettingsClient
      initialProfile={initialProfile}
      authEmail={user?.email ?? ""}
      authMetadata={(user?.user_metadata as Record<string, unknown>) ?? null}
    />
  );
}
