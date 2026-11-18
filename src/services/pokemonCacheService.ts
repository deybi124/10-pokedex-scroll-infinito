import {
  guardarCacheListaPokemon,
  obtenerCacheListaPokemon,
} from "@/repositories/pokemonCacheRepository";
import type {
  ConsultaPokemon,
  RespuestaListaPokemon,
} from "@/schemas/pokemon";
import { listarPokemon } from "@/services/pokemonService";

export async function listarPokemonConCache(
  consulta: ConsultaPokemon,
): Promise<RespuestaListaPokemon> {
  const almacenado = await obtenerCacheListaPokemon(consulta);
  if (almacenado) {
    return almacenado;
  }

  const resultado = await listarPokemon(consulta);
  await guardarCacheListaPokemon(consulta, resultado);
  return resultado;
}
