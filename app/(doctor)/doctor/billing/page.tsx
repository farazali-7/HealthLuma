import { getDoctorBillingAction } from "./actions";
import BillingClient from "./_billing-client";

export default async function BillingPage() {
  const billingData = await getDoctorBillingAction();
  return <BillingClient initialData={billingData} />;
}
