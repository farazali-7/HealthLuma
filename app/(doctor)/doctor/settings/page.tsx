import { getDoctorSettingsAction } from "./actions";
import SettingsClient from "./_settings-client";

export default async function SettingsPage() {
  const { profile, clinic } = await getDoctorSettingsAction();
  return <SettingsClient initialProfile={profile} initialClinic={clinic} />;
}
