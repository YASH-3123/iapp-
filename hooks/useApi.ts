import { useState, useCallback } from "react";

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetch_ = useCallback(async (url: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Request failed");
      const json: T = await res.json();
      setData(json);
      return json;
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch_ };
}