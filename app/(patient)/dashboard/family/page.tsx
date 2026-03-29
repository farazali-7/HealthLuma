import { getFamilyPageDataAction } from "./actions";
import FamilyClient from "./_family-client";

export default async function FamilyPage() {
  const data = await getFamilyPageDataAction();
  return <FamilyClient initialData={data} />;
}
