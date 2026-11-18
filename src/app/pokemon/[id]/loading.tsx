export default function LoadingPokemon() {
  return (
    <section
      aria-busy="true"
      aria-label="Cargando ficha del Pokémon"
      className="flex flex-col items-center gap-8"
    >
      <div className="h-11 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-48 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-8 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </section>
  );
}
