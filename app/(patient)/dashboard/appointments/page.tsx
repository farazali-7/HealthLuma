import { getPatientAppointmentsAction } from "./actions";
import AppointmentsClient from "./_appointments-client";

export default async function AppointmentsPage() {
  const { data: appointments, hasMore } = await getPatientAppointmentsAction();

  return <AppointmentsClient initialData={appointments} initialHasMore={hasMore} />;
}
