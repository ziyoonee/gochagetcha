import { searchAll } from "@/lib/db";
import SearchClient from "./SearchClient";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";

  const results = query ? await searchAll(query) : { gachashops: [], gachas: [] };

  return <SearchClient query={query} results={results} />;
}
