import { z } from "zod";

export const LIMITE_PAGINA_DEFECTO = 20;

export const esquemaNombreBusqueda = z
  .string()
  .trim()
  .regex(/^[A-Za-z-]{2,30}$/, "Usa de 2 a 30 letras o guiones");

export const esquemaConsultaPokemon = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limite: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(LIMITE_PAGINA_DEFECTO),
  q: esquemaNombreBusqueda.optional(),
});

export const esquemaPokemonLista = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1),
  sprite: z.string().url(),
});

export const esquemaRespuestaListaPokemon = z.object({
  items: z.array(esquemaPokemonLista),
  siguienteCursor: z.string().nullable(),
});

export const esquemaIdPokemon = z
  .string()
  .regex(/^[1-9]\d*$/, "El ID debe ser un entero positivo")
  .transform(Number)
  .refine(Number.isSafeInteger, "El ID está fuera del rango permitido");

export const esquemaDetallePokemon = z.object({
  id: z.number().int().positive(),
  nombre: z.string().min(1),
  sprite: z.string().url(),
  tipos: z.array(z.string().min(1)),
  estadisticas: z.array(
    z.object({
      nombre: z.string().min(1),
      valor: z.number().int().nonnegative(),
    }),
  ),
  habilidades: z.array(
    z.object({
      nombre: z.string().min(1),
      oculta: z.boolean(),
    }),
  ),
});

export const esquemaIndicePokeApi = z.object({
  count: z.number().int().nonnegative(),
  results: z.array(
    z.object({
      name: z.string().min(1),
      url: z.string().url(),
    }),
  ),
});

export const esquemaPokemonPokeApi = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  types: z.array(z.object({ type: z.object({ name: z.string().min(1) }) })),
  stats: z.array(
    z.object({
      base_stat: z.number().int().nonnegative(),
      stat: z.object({ name: z.string().min(1) }),
    }),
  ),
  abilities: z.array(
    z.object({
      ability: z.object({ name: z.string().min(1) }),
      is_hidden: z.boolean(),
    }),
  ),
});

export type ConsultaPokemon = z.infer<typeof esquemaConsultaPokemon>;
export type PokemonLista = z.infer<typeof esquemaPokemonLista>;
export type RespuestaListaPokemon = z.infer<typeof esquemaRespuestaListaPokemon>;
export type PokemonDetalle = z.infer<typeof esquemaDetallePokemon>;
