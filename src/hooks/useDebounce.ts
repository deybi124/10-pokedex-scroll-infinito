"use client";

import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(valor), delayMs);
    return () => window.clearTimeout(id);
  }, [valor, delayMs]);

  return debounced;
}
