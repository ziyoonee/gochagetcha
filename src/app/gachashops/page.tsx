import { Suspense } from "react";
import { getGachashops } from "@/lib/db";
import GachashopsClient from "./GachashopsClient";

export const revalidate = 60;

export default async function GachashopsPage() {
  const gachashops = await getGachashops();

  return (
    <Suspense fallback={<GachashopsLoading />}>
      <GachashopsClient gachashops={gachashops} />
    </Suspense>
  );
}

function GachashopsLoading() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-md bg-gray-100 rounded-full animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
