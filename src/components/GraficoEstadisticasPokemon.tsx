import type { PokemonDetalle } from "@/schemas/pokemon";

const ETIQUETAS_ESTADISTICAS: Record<string, string> = {
  hp: "PS",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "Ataque especial",
  "special-defense": "Defensa especial",
  speed: "Velocidad",
};

function etiquetaEstadistica(nombre: string): string {
  return (
    ETIQUETAS_ESTADISTICAS[nombre] ??
    nombre.replace(/-/g, " ").replace(/^\w/, (letra) => letra.toUpperCase())
  );
}

type Props = {
  estadisticas: PokemonDetalle["estadisticas"];
};

export function GraficoEstadisticasPokemon({ estadisticas }: Props) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {estadisticas.map((estadistica) => {
        const etiqueta = etiquetaEstadistica(estadistica.nombre);
        const porcentaje = Math.min((estadistica.valor / 255) * 100, 100);

        return (
          <li key={estadistica.nombre} className="flex flex-col gap-1">
            <div className="flex justify-between gap-4 text-sm">
              <span>{etiqueta}</span>
              <span>{estadistica.valor}</span>
            </div>
            <div
              role="meter"
              aria-label={etiqueta}
              aria-valuemin={0}
              aria-valuemax={255}
              aria-valuenow={estadistica.valor}
              className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
