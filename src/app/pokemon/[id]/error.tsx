"use client";

type Props = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPokemon({ error, retry }: Props) {
  return (
    <section role="alert" className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">No se pudo cargar la ficha</h1>
      <p>Comprueba tu conexión e inténtalo de nuevo.</p>
      {error.digest ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Referencia: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={retry}
        className="min-h-11 w-fit rounded-lg border border-zinc-300 px-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:focus-visible:outline-zinc-100"
      >
        Reintentar
      </button>
    </section>
  );
}
