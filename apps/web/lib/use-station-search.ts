import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";

export function useStationSearch() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setResults(null);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiGet<any>(`/discover/search?q=${encodeURIComponent(search)}`);
        setResults(data);
      } catch {
        setResults(null);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  return { search, setSearch, results, searching };
}
