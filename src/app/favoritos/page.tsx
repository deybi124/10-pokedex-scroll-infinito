import { ListaFavoritos } from "@/components/ListaFavoritos";

export default function PaginaFavoritos() {
  return (
    <section aria-labelledby="titulo-favoritos" className="flex flex-col gap-6">
      <h1 id="titulo-favoritos" className="text-3xl font-semibold tracking-tight">
        Mis favoritos
      </h1>
      <ListaFavoritos />
    </section>
  );
}
