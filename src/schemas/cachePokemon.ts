import { z } from "zod";
import { esquemaRespuestaListaPokemon } from "@/schemas/pokemon";

export const esquemaDocumentoCacheListaPokemon = z
  .object({
    datos: esquemaRespuestaListaPokemon,
    obtenidoEn: z.string().datetime(),
  })
  .strict();

export type DocumentoCacheListaPokemon = z.infer<
  typeof esquemaDocumentoCacheListaPokemon
>;
