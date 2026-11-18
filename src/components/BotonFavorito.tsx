"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  esquemaErrorFavoritos,
  esquemaRespuestaFavoritos,
} from "@/schemas/favoritos";

type Props = {
  pokemonId: number;
};

type Estado = "cargando" | "listo" | "no-autenticado" | "error";

export function BotonFavorito({ pokemonId }: Props) {
  const [marcado, setMarcado] = useState(false);
  const [estado, setEstado] = useState<Estado>("cargando");
  const [idConsultado, setIdConsultado] = useState<number | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [intento, setIntento] = useState(0);
  const operacionActiva = useRef(false);

  useEffect(() => {
    const controlador = new AbortController();

    async function cargarEstado() {
      try {
        const respuesta = await fetch("/api/favoritos", {
          cache: "no-store",
          signal: controlador.signal,
        });
        if (respuesta.status === 401) {
          setIdConsultado(pokemonId);
          setEstado("no-autenticado");
          return;
        }
        if (!respuesta.ok) {
          throw new Error("No se pudo consultar el estado del favorito");
        }

        const datos = esquemaRespuestaFavoritos.parse(await respuesta.json());
        setMarcado(datos.items.some((favorito) => favorito.pokemonId === pokemonId));
        setIdConsultado(pokemonId);
        setEstado("listo");
        setMensaje("");
      } catch {
        if (!controlador.signal.aborted) {
          setIdConsultado(pokemonId);
          setEstado("error");
          setMensaje("No se pudo consultar el estado del favorito.");
        }
      }
    }

    void cargarEstado();
    return () => controlador.abort();
  }, [intento, pokemonId]);

  const estadoActual = idConsultado === pokemonId ? estado : "cargando";

  const alternarFavorito = useCallback(async () => {
    if (estadoActual !== "listo" || operacionActiva.current) {
      return;
    }

    operacionActiva.current = true;
    setActualizando(true);
    setMensaje("");

    try {
      const respuesta = marcado
        ? await fetch(`/api/favoritos?pokemonId=${pokemonId}`, {
            method: "DELETE",
          })
        : await fetch("/api/favoritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pokemonId }),
          });

      if (respuesta.status === 401) {
        setEstado("no-autenticado");
        setMensaje("Inicia sesión para guardar tus favoritos.");
        return;
      }
      if (!respuesta.ok) {
        const error = esquemaErrorFavoritos.safeParse(await respuesta.json());
        throw new Error(
          error.success
            ? error.data.error
            : "No se pudo actualizar el favorito.",
        );
      }

      setMarcado(!marcado);
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el favorito.",
      );
    } finally {
      operacionActiva.current = false;
      setActualizando(false);
    }
  }, [estadoActual, marcado, pokemonId]);

  useEffect(() => {
    function manejarTecla(evento: KeyboardEvent) {
      if (
        evento.key.toLowerCase() !== "f" ||
        evento.repeat ||
        evento.altKey ||
        evento.ctrlKey ||
        evento.metaKey
      ) {
        return;
      }

      const objetivo = evento.target;
      if (
        objetivo instanceof HTMLElement &&
        (objetivo.isContentEditable ||
          objetivo.matches("input, textarea, select, [role='textbox']"))
      ) {
        return;
      }

      evento.preventDefault();
      void alternarFavorito();
    }

    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [alternarFavorito]);

  const deshabilitado = estadoActual !== "listo" || actualizando;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-pressed={estadoActual === "listo" && marcado}
        aria-busy={actualizando || estadoActual === "cargando"}
        disabled={deshabilitado}
        onClick={() => void alternarFavorito()}
        className="min-h-11 rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
      >
        {estadoActual === "cargando"
          ? "Cargando favoritos…"
          : marcado
            ? "Quitar de favoritos"
            : "Añadir a favoritos"}
      </button>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Atajo: pulsa F para {marcado ? "quitar de" : "añadir a"} favoritos.
      </p>
      {estadoActual === "no-autenticado" ? (
        <p role="status" className="flex flex-wrap gap-1">
          Inicia sesión para guardar tus favoritos.
          <Link href="/login" className="underline">
            Iniciar sesión
          </Link>
        </p>
      ) : null}
      {mensaje && (estadoActual === "listo" || estadoActual === "error") ? (
        <p role="status" aria-live="polite">
          {mensaje}
        </p>
      ) : null}
      {estadoActual === "error" ? (
        <button
          type="button"
          onClick={() => {
            setEstado("cargando");
            setIntento((actual) => actual + 1);
          }}
          className="min-h-11 rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
