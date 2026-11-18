import { limitarTasa, manejar } from "@/lib/http";
import { esquemaConsultaPokemon } from "@/schemas/pokemon";
import { listarPokemon } from "@/services/pokemonService";

export const GET = manejar(async (request: Request) => {
  limitarTasa(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() || undefined;
  const consulta = esquemaConsultaPokemon.parse({
    offset: url.searchParams.get("offset") ?? undefined,
    limite: url.searchParams.get("limite") ?? undefined,
    q,
  });

  const resultado = await listarPokemon(consulta);

  return Response.json(resultado, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
});
