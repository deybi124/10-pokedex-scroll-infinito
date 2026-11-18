import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">
        Página no encontrada
      </h1>
      <p>La página que buscas no existe o ya no está disponible.</p>
      <Link
        href="/"
        className="min-h-11 rounded-lg border border-zinc-300 px-4 py-2 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
      >
        Volver a la Pokédex
      </Link>
    </section>
  );
}
