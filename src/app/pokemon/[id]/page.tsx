import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonFavorito } from "@/components/BotonFavorito";
import { GraficoEstadisticasPokemon } from "@/components/GraficoEstadisticasPokemon";
import { ErrorHttp } from "@/lib/errores";
import { esquemaIdPokemon } from "@/schemas/pokemon";
import { obtenerDetallePokemon } from "@/services/pokemonService";

export default async function PaginaPokemon(
  props: PageProps<"/pokemon/[id]">,
) {
  const { id: parametroId } = await props.params;
  const resultadoId = esquemaIdPokemon.safeParse(parametroId);
  if (!resultadoId.success) {
    notFound();
  }

  let pokemon;
  try {
    pokemon = await obtenerDetallePokemon(resultadoId.data);
  } catch (error) {
    if (error instanceof ErrorHttp && error.estado === 404) {
      notFound();
    }
    throw error;
  }

  const nombreVisible = pokemon.nombre.replace(/-/g, " ");

  return (
    <article className="flex flex-col gap-8">
      <Link
        href="/"
        className="min-h-11 w-fit rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
      >
        ← Volver a la Pokédex
      </Link>

      <header className="flex flex-col items-center gap-3 text-center">
        <Image
          src={pokemon.sprite}
          alt={`Ilustración de ${nombreVisible}`}
          width={192}
          height={192}
          priority
        />
        <h1 className="text-3xl font-semibold capitalize">
          {nombreVisible} <span className="text-zinc-500">#{pokemon.id}</span>
        </h1>
      </header>

      <BotonFavorito pokemonId={pokemon.id} />

      <section aria-labelledby="titulo-tipos" className="flex flex-col gap-3">
        <h2 id="titulo-tipos" className="text-xl font-semibold">
          Tipos
        </h2>
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

      <section aria-labelledby="titulo-estadisticas" className="flex flex-col gap-3">
        <h2 id="titulo-estadisticas" className="text-xl font-semibold">
          Estadísticas base
        </h2>
        <GraficoEstadisticasPokemon estadisticas={pokemon.estadisticas} />
      </section>

      <section aria-labelledby="titulo-habilidades" className="flex flex-col gap-3">
        <h2 id="titulo-habilidades" className="text-xl font-semibold">
          Habilidades
        </h2>
        <ul className="flex flex-wrap gap-2">
          {pokemon.habilidades.map((habilidad) => (
            <li
              key={habilidad.nombre}
              className="rounded-lg border border-zinc-300 px-3 py-2 capitalize dark:border-zinc-700"
            >
              {habilidad.nombre.replace(/-/g, " ")}
              {habilidad.oculta ? " (oculta)" : ""}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
