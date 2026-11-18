import { z } from "zod";
import { esquemaIdPokemon } from "@/schemas/pokemon";

const esquemaPokemonId = z
  .number()
  .int()
  .positive()
  .refine(Number.isSafeInteger, "El ID está fuera del rango permitido");

export const LIMITE_FAVORITOS = 50;

export const esquemaCrearFavorito = z
  .object({
    pokemonId: esquemaPokemonId,
  })
  .strict();

export const esquemaEliminarFavorito = z
  .object({
    pokemonId: esquemaIdPokemon,
  })
  .strict();

export const esquemaFavoritoDocumento = z
  .object({
    nombre: z.string().min(1),
    agregadoEn: z.string().datetime(),
  })
  .strict();

export const esquemaContadorFavoritos = z
  .object({
    cantidad: z.number().int().nonnegative(),
  })
  .strict();

export const esquemaFavorito = esquemaFavoritoDocumento.extend({
  pokemonId: esquemaPokemonId,
});

export const esquemaRespuestaFavoritos = z
  .object({
    items: z.array(esquemaFavorito),
  })
  .strict();

export const esquemaErrorFavoritos = z
  .object({
    error: z.string(),
  })
  .passthrough();

export type Favorito = z.infer<typeof esquemaFavorito>;
