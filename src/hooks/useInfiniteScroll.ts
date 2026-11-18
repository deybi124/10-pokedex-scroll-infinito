"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type OpcionesInfiniteScroll = {
  habilitado: boolean;
  alIntersectar: () => void;
  margen?: string;
};

export function useInfiniteScroll({
  habilitado,
  alIntersectar,
  margen = "240px",
}: OpcionesInfiniteScroll): {
  centinelaRef: RefObject<HTMLDivElement | null>;
  soportaObserver: boolean;
} {
  const centinelaRef = useRef<HTMLDivElement | null>(null);
  const alIntersectarRef = useRef(alIntersectar);
  const [soportaObserver, setSoportaObserver] = useState(false);

  alIntersectarRef.current = alIntersectar;

  useEffect(() => {
    setSoportaObserver(typeof IntersectionObserver === "function");
  }, []);

  useEffect(() => {
    const nodo = centinelaRef.current;
    if (!soportaObserver || !habilitado || !nodo) {
      return;
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          alIntersectarRef.current();
        }
      },
      { rootMargin: margen },
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, [habilitado, margen, soportaObserver]);

  return { centinelaRef, soportaObserver };
}
