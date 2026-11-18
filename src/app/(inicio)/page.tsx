import { Suspense } from "react";
import { EsqueletoLista } from "@/components/EsqueletoLista";
import { ListaPokemon } from "@/components/ListaPokemon";

export default function PaginaInicio() {
  return (
    <div className="flex flex-col gap-6">
      <h1 id="titulo-lista" className="text-3xl font-semibold tracking-tight">
        Pokédex
      </h1>
      <p className="max-w-prose text-zinc-700 dark:text-zinc-300">
        Explora Pokémon de 20 en 20. El listado se carga al llegar al final.
      </p>
      <Suspense fallback={<EsqueletoLista />}>
        <ListaPokemon />
      </Suspense>
    </div>
  );
}
