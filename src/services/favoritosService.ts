import { obtenerDetallePokemon } from "@/services/pokemonService";
import {
  agregarFavorito as guardarFavorito,
  listarFavoritos as leerFavoritos,
  quitarFavorito as borrarFavorito,
} from "@/repositories/favoritosRepository";
import type { Favorito } from "@/schemas/favoritos";

export function listarFavoritos(uid: string): Promise<Favorito[]> {
  return leerFavoritos(uid);
}

export async function agregarFavorito(
  uid: string,
  pokemonId: number,
): Promise<Favorito> {
  const pokemon = await obtenerDetallePokemon(pokemonId);
  return guardarFavorito(uid, pokemon.id, pokemon.nombre);
}

export function quitarFavorito(
  uid: string,
  pokemonId: number,
): Promise<void> {
  return borrarFavorito(uid, pokemonId);
}
