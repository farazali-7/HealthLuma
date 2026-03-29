import { getDoctorAppointmentsAction } from "./actions";
import AppointmentsClient from "./_appointments-client";

export default async function AppointmentsPage() {
  const appointments = await getDoctorAppointmentsAction();
  return <AppointmentsClient initialData={appointments} />;
}
