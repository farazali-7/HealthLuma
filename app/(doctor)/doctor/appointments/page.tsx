import { getDoctorAppointmentsAction } from "./actions";
import AppointmentsClient from "./_appointments-client";

export default async function AppointmentsPage() {
  const { data: appointments, hasMore } = await getDoctorAppointmentsAction();
  return <AppointmentsClient initialData={appointments} initialHasMore={hasMore} />;
}
