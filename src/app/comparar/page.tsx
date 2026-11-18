import { Suspense } from "react";
import { ComparadorPokemon } from "@/components/ComparadorPokemon";

function CargandoComparador() {
  return (
    <div aria-busy="true" aria-label="Cargando comparador">
      <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function PaginaComparar() {
  return (
    <section aria-labelledby="titulo-comparador" className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 id="titulo-comparador" className="text-3xl font-semibold tracking-tight">
          Comparar Pokémon
        </h1>
        <p className="max-w-prose text-zinc-700 dark:text-zinc-300">
          Compara tipos y estadísticas base lado a lado.
        </p>
      </header>
      <Suspense fallback={<CargandoComparador />}>
        <ComparadorPokemon />
      </Suspense>
    </section>
  );
}
