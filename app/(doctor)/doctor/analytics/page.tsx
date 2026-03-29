import { getDoctorAnalyticsAction } from "./actions";
import AnalyticsClient from "./_analytics-client";

export default async function AnalyticsPage() {
  const data = await getDoctorAnalyticsAction();
  return <AnalyticsClient initialData={data} />;
}
