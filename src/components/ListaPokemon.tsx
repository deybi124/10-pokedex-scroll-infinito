"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EsqueletoLista } from "@/components/EsqueletoLista";
import { TarjetaPokemon } from "@/components/TarjetaPokemon";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import {
  LIMITE_PAGINA_DEFECTO,
  esquemaNombreBusqueda,
  esquemaRespuestaListaPokemon,
  type PokemonLista,
} from "@/schemas/pokemon";

type EstadoLista = "carga" | "listo" | "vacio" | "error";

function mensajeError(estado: number): string {
  if (estado === 429) {
    return "Demasiadas solicitudes. Espera un momento y reintenta.";
  }
  if (estado === 504) {
    return "La consulta tardó demasiado. Reintenta.";
  }
  return "No se pudo cargar la lista. Reintenta.";
}

function parsearBusqueda(valor: string):
  | { valida: true; q: string | undefined }
  | { valida: false; mensaje: string } {
  const recortado = valor.trim();
  if (recortado.length === 0) {
    return { valida: true, q: undefined };
  }

  const parsed = esquemaNombreBusqueda.safeParse(recortado);
  if (!parsed.success) {
    return {
      valida: false,
      mensaje: parsed.error.issues[0]?.message ?? "Búsqueda inválida",
    };
  }

  return { valida: true, q: parsed.data };
}

export function ListaPokemon() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qInicial = searchParams.get("q") ?? "";

  const [texto, setTexto] = useState(qInicial);
  const textoDebounced = useDebounce(texto, 300);
  const [items, setItems] = useState<PokemonLista[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoLista>("carga");
  const [error, setError] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState("");
  const [cargandoMas, setCargandoMas] = useState(false);
  const peticionId = useRef(0);

  const validacionTexto = parsearBusqueda(texto);
  const consultaDebounced = parsearBusqueda(textoDebounced);
  const qConsulta = consultaDebounced.valida ? consultaDebounced.q : undefined;

  const cargar = useCallback(
    async (offset: number, q: string | undefined, concatenar: boolean) => {
      const id = ++peticionId.current;
      if (concatenar) {
        setCargandoMas(true);
      } else {
        setEstado("carga");
        setError(null);
        setItems([]);
        setCursor(null);
      }

      try {
        const params = new URLSearchParams({
          offset: String(offset),
          limite: String(LIMITE_PAGINA_DEFECTO),
        });
        if (q) {
          params.set("q", q);
        }

        const respuesta = await fetch(`/api/pokemon?${params.toString()}`);
        if (id !== peticionId.current) {
          return;
        }

        if (!respuesta.ok) {
          setEstado("error");
          setError(mensajeError(respuesta.status));
          return;
        }

        const datos = esquemaRespuestaListaPokemon.parse(await respuesta.json());
        setItems((actuales) =>
          concatenar ? [...actuales, ...datos.items] : datos.items,
        );
        setCursor(datos.siguienteCursor);

        if (datos.items.length === 0 && !concatenar) {
          setEstado("vacio");
          setAnuncio("No encontrado");
          return;
        }

        setEstado("listo");
        if (concatenar) {
          setAnuncio(`${datos.items.length} resultados más cargados`);
        } else {
          setAnuncio(
            q
              ? `${datos.items.length} Pokémon encontrados`
              : `${datos.items.length} Pokémon cargados`,
          );
        }
      } catch {
        if (id !== peticionId.current) {
          return;
        }
        setEstado("error");
        setError("No se pudo cargar la lista. Reintenta.");
      } finally {
        if (id === peticionId.current) {
          setCargandoMas(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!consultaDebounced.valida) {
      return;
    }

    const qs = consultaDebounced.q
      ? `?q=${encodeURIComponent(consultaDebounced.q)}`
      : "";
    router.replace(`${pathname}${qs}`, { scroll: false });
    void cargar(0, consultaDebounced.q, false);
  }, [cargar, consultaDebounced.valida, qConsulta, pathname, router]);

  const cargarSiguiente = useCallback(() => {
    if (cargandoMas || estado === "carga" || !cursor || !consultaDebounced.valida) {
      return;
    }
    void cargar(Number(cursor), consultaDebounced.q, true);
  }, [cargar, cargandoMas, consultaDebounced, cursor, estado]);

  const { centinelaRef, soportaObserver } = useInfiniteScroll({
    habilitado:
      estado === "listo" &&
      Boolean(cursor) &&
      !cargandoMas &&
      consultaDebounced.valida,
    alIntersectar: cargarSiguiente,
  });

  return (
    <section aria-labelledby="titulo-lista" className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(evento) => evento.preventDefault()}
        className="flex flex-col gap-2"
      >
        <label htmlFor="busqueda-pokemon" className="text-sm font-medium">
          Buscar por nombre
        </label>
        <input
          id="busqueda-pokemon"
          type="search"
          name="q"
          autoComplete="off"
          spellCheck={false}
          maxLength={30}
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          aria-invalid={validacionTexto.valida ? undefined : true}
          aria-describedby="ayuda-busqueda"
          placeholder="pikachu"
          className="min-h-11 w-full max-w-md rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-100"
        />
        <p id="ayuda-busqueda" className="text-sm text-zinc-600 dark:text-zinc-400">
          {validacionTexto.valida
            ? "De 2 a 30 letras o guiones. Los resultados se actualizan al pausar la escritura."
            : validacionTexto.mensaje}
        </p>
      </form>

      <div className="sr-only" aria-live="polite">
        {anuncio}
      </div>

      {estado === "carga" ? (
        <div aria-busy="true" aria-label="Cargando Pokémon">
          <EsqueletoLista />
        </div>
      ) : null}

      {estado === "error" && error ? (
        <div role="alert" className="flex flex-col gap-3">
          <p>{error}</p>
          <button
            type="button"
            className="min-h-11 w-fit rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
            onClick={() => {
              if (consultaDebounced.valida) {
                void cargar(0, consultaDebounced.q, false);
              }
            }}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {estado === "vacio" ? <p role="status">No encontrado</p> : null}

      {estado === "listo" && items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((pokemon) => (
            <li key={pokemon.id}>
              <TarjetaPokemon pokemon={pokemon} />
            </li>
          ))}
        </ul>
      ) : null}

      {cargandoMas ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Cargando más…</p>
      ) : null}

      {estado === "listo" && cursor ? (
        soportaObserver ? (
          <div ref={centinelaRef} className="h-8" aria-hidden="true" />
        ) : (
          <button
            type="button"
            className="min-h-11 w-fit rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
            onClick={cargarSiguiente}
          >
            Cargar más
          </button>
        )
      ) : null}
    </section>
  );
}
