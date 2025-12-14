import { getGachashops, getGachas } from "@/lib/db";
import FavoritesClient from "./FavoritesClient";

export const revalidate = 60;

export default async function FavoritesPage() {
  const [gachashops, gachas] = await Promise.all([
    getGachashops(),
    getGachas(),
  ]);

  return <FavoritesClient allGachashops={gachashops} allGachas={gachas} />;
}
