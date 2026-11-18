import { FormularioLogin } from "@/components/FormularioLogin";

export default function PaginaLogin() {
  return (
    <section aria-labelledby="titulo-login" className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 id="titulo-login" className="text-3xl font-semibold tracking-tight">
          Iniciar sesión
        </h1>
        <p className="max-w-prose text-zinc-700 dark:text-zinc-300">
          Inicia sesión para guardar y consultar tus Pokémon favoritos.
        </p>
      </header>
      <FormularioLogin />
    </section>
  );
}
