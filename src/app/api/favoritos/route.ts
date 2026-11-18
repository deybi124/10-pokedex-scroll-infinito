import { requerirUsuario } from "@/lib/auth";
import { exigirOrigenDelSitio, leerJson, manejar } from "@/lib/http";
import {
  esquemaCrearFavorito,
  esquemaEliminarFavorito,
} from "@/schemas/favoritos";
import {
  agregarFavorito,
  listarFavoritos,
  quitarFavorito,
} from "@/services/favoritosService";

const CABECERAS_PRIVADAS = { "Cache-Control": "no-store" };

export const GET = manejar(async (request: Request) => {
  const usuario = await requerirUsuario(request);
  const items = await listarFavoritos(usuario.uid);

  return Response.json({ items }, { headers: CABECERAS_PRIVADAS });
});

export const POST = manejar(async (request: Request) => {
  exigirOrigenDelSitio(request);
  const usuario = await requerirUsuario(request);
  const entrada = esquemaCrearFavorito.parse(await leerJson(request));
  const item = await agregarFavorito(usuario.uid, entrada.pokemonId);

  return Response.json(
    { item },
    { status: 201, headers: CABECERAS_PRIVADAS },
  );
});

export const DELETE = manejar(async (request: Request) => {
  exigirOrigenDelSitio(request);
  const usuario = await requerirUsuario(request);
  const url = new URL(request.url);
  const entrada = esquemaEliminarFavorito.parse({
    pokemonId: url.searchParams.get("pokemonId"),
  });
  await quitarFavorito(usuario.uid, entrada.pokemonId);

  return new Response(null, { status: 204, headers: CABECERAS_PRIVADAS });
});
