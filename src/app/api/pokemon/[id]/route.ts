import { limitarTasa, manejar } from "@/lib/http";
import { esquemaIdPokemon } from "@/schemas/pokemon";
import { obtenerDetallePokemon } from "@/services/pokemonService";

export const GET = manejar(async (request: Request) => {
  limitarTasa(request);
  const segmentoId = new URL(request.url).pathname.split("/").pop() ?? "";
  const id = esquemaIdPokemon.parse(segmentoId);
  const pokemon = await obtenerDetallePokemon(id);

  return Response.json(pokemon, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
});
