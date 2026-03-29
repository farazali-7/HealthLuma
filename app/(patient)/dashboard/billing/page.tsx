import { getBillingDataAction } from "./actions";
import BillingClient from "./_billing-client";

export default async function BillingPage() {
  const billingData = await getBillingDataAction();

  return <BillingClient initialData={billingData} />;
}
