"use client";

import { useEffect, useState } from "react";
import { getSchools, type SchoolDTO } from "@/lib/api";

// Module-level cache so the navbar fetches schools once per session, not per
// component. New schools created in the admin appear automatically on reload.
let _cache: SchoolDTO[] | null = null;

export function useNavSchools(limit = 8): SchoolDTO[] {
  const [schools, setSchools] = useState<SchoolDTO[]>(_cache ?? []);

  useEffect(() => {
    if (_cache) return;
    getSchools()
      .then((d) => {
        _cache = d;
        setSchools(d);
      })
      .catch(() => {
        /* nav simply omits the dropdown if the API is unavailable */
      });
  }, []);

  return schools.slice(0, limit);
}
