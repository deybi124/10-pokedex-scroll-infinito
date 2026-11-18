export function EsqueletoLista() {
  return (
    <ul
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-hidden="true"
    >
      {Array.from({ length: 6 }, (_, indice) => (
        <li
          key={indice}
          className="h-44 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        />
      ))}
    </ul>
  );
}
