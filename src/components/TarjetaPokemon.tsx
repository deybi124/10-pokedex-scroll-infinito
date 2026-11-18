import Image from "next/image";
import { memo } from "react";
import Link from "next/link";
import type { PokemonLista } from "@/schemas/pokemon";

type Props = {
  pokemon: PokemonLista;
};

const PLACEHOLDER_POKEMON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Crect width='8' height='8' fill='%23e4e4e7'/%3E%3C/svg%3E";

function TarjetaPokemonBase({ pokemon }: Props) {
  const nombreVisible = pokemon.nombre.replace(/-/g, " ");

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-500">
      <Link
        href={`/pokemon/${pokemon.id}`}
        className="flex min-h-11 flex-col items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
      >
        <Image
          src={pokemon.sprite}
          alt=""
          width={96}
          height={96}
          sizes="96px"
          loading="lazy"
          placeholder="blur"
          blurDataURL={PLACEHOLDER_POKEMON}
        />
        <h2 className="text-center text-base font-semibold capitalize">
          {nombreVisible}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          #{String(pokemon.id).padStart(4, "0")}
        </p>
      </Link>
    </article>
  );
}

export const TarjetaPokemon = memo(TarjetaPokemonBase);
