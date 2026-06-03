"use client";

import { useEffect, useState } from "react";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Client data fetching with loading / error states.
export function useApi<T>(fetcher: () => Promise<T>): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: null });
    fetcher()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((e) =>
        active &&
        setState({ data: null, loading: false, error: e?.message ?? "Failed to load" }),
      );
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
