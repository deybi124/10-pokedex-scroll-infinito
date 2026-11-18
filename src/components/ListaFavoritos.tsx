"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  esquemaRespuestaFavoritos,
  type Favorito,
} from "@/schemas/favoritos";

type Estado = "cargando" | "listo" | "no-autenticado" | "error";

export function ListaFavoritos() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarFavoritos() {
      try {
        const respuesta = await fetch("/api/favoritos", {
          cache: "no-store",
          signal: controlador.signal,
        });
        if (respuesta.status === 401) {
          setEstado("no-autenticado");
          return;
        }
        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los favoritos");
        }

        const datos = esquemaRespuestaFavoritos.parse(await respuesta.json());
        setFavoritos(datos.items);
        setEstado("listo");
      } catch {
        if (!controlador.signal.aborted) {
          setEstado("error");
        }
      }
    }

    void cargarFavoritos();
    return () => controlador.abort();
  }, [intento]);

  if (estado === "cargando") {
    return (
      <div aria-busy="true" aria-label="Cargando favoritos">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, indice) => (
            <li
              key={indice}
              className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </ul>
      </div>
    );
  }

  if (estado === "no-autenticado") {
    return (
      <p role="status">
        Inicia sesión para consultar tus favoritos.{" "}
        <Link href="/login" className="underline">
          Iniciar sesión
        </Link>
      </p>
    );
  }

  if (estado === "error") {
    return (
      <div role="alert" className="flex flex-col gap-3">
        <p>No se pudieron cargar tus favoritos.</p>
        <button
          type="button"
          onClick={() => {
            setEstado("cargando");
            setIntento((actual) => actual + 1);
          }}
          className="min-h-11 w-fit rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (favoritos.length === 0) {
    return <p role="status">Todavía no tienes Pokémon favoritos.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {favoritos.map((favorito) => (
        <li
          key={favorito.pokemonId}
          className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <Link
            href={`/pokemon/${favorito.pokemonId}`}
            className="inline-flex min-h-11 items-center gap-2 rounded font-medium capitalize focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
          >
            {favorito.nombre.replace(/-/g, " ")}
            <span className="text-zinc-500">
              #{String(favorito.pokemonId).padStart(4, "0")}
            </span>
          </Link>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Guardado{" "}
            <time dateTime={favorito.agregadoEn}>
              {new Date(favorito.agregadoEn).toLocaleDateString("es")}
            </time>
          </p>
        </li>
      ))}
    </ul>
  );
}
