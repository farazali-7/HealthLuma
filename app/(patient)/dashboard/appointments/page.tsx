import { getPatientAppointmentsAction } from "./actions";
import AppointmentsClient from "./_appointments-client";

export default async function AppointmentsPage() {
  const appointments = await getPatientAppointmentsAction();

  return <AppointmentsClient initialData={appointments} />;
}
