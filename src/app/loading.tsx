import { EsqueletoLista } from "@/components/EsqueletoLista";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Cargando contenido"
      className="flex flex-col gap-6"
    >
      <EsqueletoLista />
    </section>
  );
}
