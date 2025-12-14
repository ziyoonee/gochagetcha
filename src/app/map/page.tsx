import { getGachashops } from "@/lib/db";
import MapClient from "./MapClient";

export const revalidate = 60;

export default async function MapPage() {
  const gachashops = await getGachashops();

  return <MapClient gachashops={gachashops} />;
}
