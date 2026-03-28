import { getDoctorDashboardAction } from "./actions";
import { DoctorDashboardClient } from "./_doctor-dashboard-client";

export default async function DoctorPage() {
  const data = await getDoctorDashboardAction();

  const displayName = data.doctorName
    ? `Dr. ${data.doctorName.split(" ").at(-1) ?? data.doctorName}`
    : "Doctor";

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  return (
    <DoctorDashboardClient
      data={data}
      displayName={displayName}
      greeting={greeting}
      dateStr={dateStr}
    />
  );
}
