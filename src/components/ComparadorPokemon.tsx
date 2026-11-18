"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { GraficoEstadisticasPokemon } from "@/components/GraficoEstadisticasPokemon";
import { esquemaConsultaComparacion } from "@/schemas/comparar";
import {
  esquemaDetallePokemon,
  type PokemonDetalle,
} from "@/schemas/pokemon";

type PropsFormulario = {
  parametroA: string | null;
  parametroB: string | null;
  duplicado: boolean;
};

async function cargarPokemon(
  id: number,
  signal: AbortSignal,
): Promise<PokemonDetalle> {
  const respuesta = await fetch(`/api/pokemon/${id}`, {
    cache: "no-store",
    signal,
  });

  if (!respuesta.ok) {
    if (respuesta.status === 404) {
      throw new Error(`No se encontró un Pokémon con el ID ${id}.`);
    }
    if (respuesta.status === 429) {
      throw new Error("Demasiadas consultas. Espera un momento y reintenta.");
    }
    throw new Error(`No se pudo cargar el Pokémon con el ID ${id}.`);
  }

  const detalle = esquemaDetallePokemon.safeParse(await respuesta.json());
  if (!detalle.success) {
    throw new Error("La respuesta de la Pokédex tiene un formato inválido.");
  }
  return detalle.data;
}

function PanelPokemon({ pokemon }: { pokemon: PokemonDetalle }) {
  const nombreVisible = pokemon.nombre.replace(/-/g, " ");

  return (
    <article className="flex flex-col gap-5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-2xl font-semibold capitalize">
        <Link
          href={`/pokemon/${pokemon.id}`}
          className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
        >
          {nombreVisible} <span className="text-zinc-500">#{pokemon.id}</span>
        </Link>
      </h2>
      <section aria-label={`Tipos de ${nombreVisible}`} className="flex flex-col gap-2">
        <h3 className="font-semibold">Tipos</h3>
        <ul className="flex flex-wrap gap-2">
          {pokemon.tipos.map((tipo) => (
            <li
              key={tipo}
              className="rounded-full border border-zinc-300 px-3 py-1 capitalize dark:border-zinc-700"
            >
              {tipo}
            </li>
          ))}
        </ul>
      </section>
      <section
        aria-label={`Estadísticas de ${nombreVisible}`}
        className="flex flex-col gap-2"
      >
        <h3 className="font-semibold">Estadísticas base</h3>
        <GraficoEstadisticasPokemon estadisticas={pokemon.estadisticas} />
      </section>
    </article>
  );
}

function FormularioComparacion({
  parametroA,
  parametroB,
  duplicado,
}: PropsFormulario) {
  const pathname = usePathname();
  const router = useRouter();
  const consulta = esquemaConsultaComparacion.safeParse({
    a: parametroA,
    b: parametroB,
  });
  const hayParametros = parametroA !== null || parametroB !== null || duplicado;
  const comparacion = !duplicado && consulta.success ? consulta.data : null;
  const errorParametros = duplicado
    ? "El enlace debe incluir un solo ID para cada Pokémon."
    : hayParametros && !consulta.success
      ? consulta.error.issues[0]?.message ?? "IDs de Pokémon inválidos."
      : null;
  const idPokemonA = comparacion?.a ?? null;
  const idPokemonB = comparacion?.b ?? null;
  const [idA, setIdA] = useState(parametroA ?? "");
  const [idB, setIdB] = useState(parametroB ?? "");
  const [pokemon, setPokemon] = useState<
    [PokemonDetalle, PokemonDetalle] | null
  >(null);
  const [cargando, setCargando] = useState(comparacion !== null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (idPokemonA === null || idPokemonB === null) {
      return;
    }

    const controlador = new AbortController();
    void Promise.all([
      cargarPokemon(idPokemonA, controlador.signal),
      cargarPokemon(idPokemonB, controlador.signal),
    ])
      .then(([primerPokemon, segundoPokemon]) => {
        setPokemon([primerPokemon, segundoPokemon]);
        setErrorCarga(null);
        setCargando(false);
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) {
          return;
        }
        setErrorCarga(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los Pokémon.",
        );
        setCargando(false);
      });

    return () => controlador.abort();
  }, [idPokemonA, idPokemonB, intento]);

  const enviar = useCallback(
    (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault();
      const resultado = esquemaConsultaComparacion.safeParse({
        a: idA,
        b: idB,
      });
      if (!resultado.success) {
        setErrorFormulario(
          resultado.error.issues[0]?.message ?? "Ingresa dos IDs válidos.",
        );
        return;
      }

      setErrorFormulario("");
      const parametros = new URLSearchParams();
      parametros.set("a", String(resultado.data.a));
      parametros.set("b", String(resultado.data.b));
      router.push(`${pathname}?${parametros.toString()}`, { scroll: false });
    },
    [idA, idB, pathname, router],
  );

  return (
    <div className="flex flex-col gap-6">
      <form
        noValidate
        onSubmit={enviar}
        className="grid gap-4 rounded-xl border border-zinc-200 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end dark:border-zinc-800"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="pokemon-a" className="text-sm font-medium">
            ID del primer Pokémon
          </label>
          <input
            id="pokemon-a"
            name="a"
            type="number"
            min="1"
            step="1"
            required
            value={idA}
            onChange={(evento) => {
              setIdA(evento.target.value);
              setErrorFormulario("");
            }}
            aria-invalid={errorFormulario ? true : undefined}
            aria-describedby="ayuda-comparacion"
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-100"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pokemon-b" className="text-sm font-medium">
            ID del segundo Pokémon
          </label>
          <input
            id="pokemon-b"
            name="b"
            type="number"
            min="1"
            step="1"
            required
            value={idB}
            onChange={(evento) => {
              setIdB(evento.target.value);
              setErrorFormulario("");
            }}
            aria-invalid={errorFormulario ? true : undefined}
            aria-describedby="ayuda-comparacion"
            className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-100"
          />
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-zinc-900 px-4 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:focus-visible:outline-zinc-100"
        >
          Comparar
        </button>
        <p
          id="ayuda-comparacion"
          className="text-sm text-zinc-600 sm:col-span-3 dark:text-zinc-400"
        >
          Usa los IDs que aparecen en la{" "}
          <Link
            href="/"
            className="underline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Pokédex
          </Link>
          ; el enlace se actualizará con ambos IDs para que puedas compartir la comparación.
        </p>
        {errorFormulario ? (
          <p role="alert" className="sm:col-span-3">
            {errorFormulario}
          </p>
        ) : null}
      </form>

      {errorParametros ? (
        <p role="alert">{errorParametros}</p>
      ) : null}

      {!hayParametros ? (
        <p role="status">Ingresa dos IDs distintos para iniciar la comparación.</p>
      ) : null}

      {cargando ? (
        <div aria-busy="true" aria-label="Cargando comparación">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ) : null}

      {errorCarga ? (
        <div role="alert" className="flex flex-col gap-3">
          <p>{errorCarga}</p>
          <button
            type="button"
            onClick={() => {
              setCargando(true);
              setErrorCarga(null);
              setIntento((actual) => actual + 1);
            }}
            className="min-h-11 w-fit rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {pokemon ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {pokemon.map((detalle) => (
            <PanelPokemon key={detalle.id} pokemon={detalle} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ComparadorPokemon() {
  const searchParams = useSearchParams();
  const valoresA = searchParams.getAll("a");
  const valoresB = searchParams.getAll("b");

  return (
    <FormularioComparacion
      key={searchParams.toString()}
      parametroA={valoresA[0] ?? null}
      parametroB={valoresB[0] ?? null}
      duplicado={valoresA.length > 1 || valoresB.length > 1}
    />
  );
}
