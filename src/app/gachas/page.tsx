import { getGachas, getCategories, getBrands } from "@/lib/db";
import GachasClient from "./GachasClient";

export const revalidate = 60; // 60초마다 재검증

export default async function GachasPage() {
  const [gachas, categories, brands] = await Promise.all([
    getGachas(),
    getCategories(),
    getBrands(),
  ]);

  return <GachasClient gachas={gachas} categories={categories} brands={brands} />;
}
