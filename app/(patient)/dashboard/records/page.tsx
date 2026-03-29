import { getPatientPrescriptionsAction, getPatientDocumentsAction } from "./actions";
import RecordsClient from "./_records-client";

export default async function RecordsPage() {
  const [rxList, docList] = await Promise.all([
    getPatientPrescriptionsAction(),
    getPatientDocumentsAction(),
  ]);
  return <RecordsClient initialRx={rxList} initialDocs={docList} />;
}
