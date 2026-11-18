import { z } from "zod";
import { esquemaIdPokemon } from "@/schemas/pokemon";

export const esquemaConsultaComparacion = z
  .object({
    a: esquemaIdPokemon,
    b: esquemaIdPokemon,
  })
  .strict()
  .refine((consulta) => consulta.a !== consulta.b, {
    path: ["b"],
    message: "Elige dos Pokémon distintos",
  });
