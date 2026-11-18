import { z } from "zod";
import { ErrorHttp } from "@/lib/errores";
import {
  esquemaIndicePokeApi,
  esquemaPokemonPokeApi,
  type ConsultaPokemon,
  type PokemonDetalle,
  type PokemonLista,
  type RespuestaListaPokemon,
} from "@/schemas/pokemon";

const POKEAPI = "https://pokeapi.co/api/v2";
const SPRITE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const TIEMPO_MAXIMO_MS = 8000;
const REVALIDATE_SEGUNDOS = 60 * 60 * 24;

type FetchConCache = RequestInit & { next?: { revalidate: number } };

function idDesdeUrl(url: string): number {
  const segmentos = url.replace(/\/+$/, "").split("/");
  const id = Number(segmentos[segmentos.length - 1]);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHttp(502, "PokéAPI devolvió un identificador inválido");
  }
  return id;
}

function aPokemonLista(entrada: { name: string; url: string }): PokemonLista {
  const id = idDesdeUrl(entrada.url);
  return {
    id,
    nombre: entrada.name,
    sprite: `${SPRITE}/${id}.png`,
  };
}

async function pokeFetch<T>(ruta: string, esquema: z.ZodType<T>): Promise<T> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${POKEAPI}${ruta}`, {
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEGUNDOS },
    } as FetchConCache);
  } catch (error) {
    const nombre = error instanceof Error ? error.name : "";
    if (nombre === "TimeoutError" || nombre === "AbortError") {
      throw new ErrorHttp(504, "Tiempo de espera agotado al consultar PokéAPI");
    }
    throw new ErrorHttp(502, "PokéAPI no disponible");
  }

  if (respuesta.status === 404) {
    throw new ErrorHttp(404, "No encontrado");
  }
  if (respuesta.status === 429) {
    throw new ErrorHttp(429, "Demasiadas solicitudes");
  }
  if (!respuesta.ok) {
    throw new ErrorHttp(502, "PokéAPI no disponible");
  }

  let contenido: unknown;
  try {
    contenido = await respuesta.json();
  } catch {
    throw new ErrorHttp(502, "PokéAPI devolvió una respuesta inválida");
  }

  const resultado = esquema.safeParse(contenido);
  if (!resultado.success) {
    throw new ErrorHttp(502, "PokéAPI devolvió datos inválidos");
  }
  return resultado.data;
}

export async function listarPokemon(
  consulta: ConsultaPokemon,
): Promise<RespuestaListaPokemon> {
  const { offset, limite, q } = consulta;

  if (q) {
    const indice = await pokeFetch(
      `/pokemon?offset=0&limit=2000`,
      esquemaIndicePokeApi,
    );
    const busqueda = q.toLowerCase();
    const coincidencias = indice.results.filter((item) =>
      item.name.toLowerCase().startsWith(busqueda),
    );
    const pagina = coincidencias.slice(offset, offset + limite);
    const siguienteOffset = offset + limite;

    return {
      items: pagina.map(aPokemonLista),
      siguienteCursor:
        siguienteOffset < coincidencias.length ? String(siguienteOffset) : null,
    };
  }

  const lista = await pokeFetch(
    `/pokemon?offset=${offset}&limit=${limite}`,
    esquemaIndicePokeApi,
  );
  const siguienteOffset = offset + limite;

  return {
    items: lista.results.map(aPokemonLista),
    siguienteCursor:
      siguienteOffset < lista.count ? String(siguienteOffset) : null,
  };
}

export async function obtenerDetallePokemon(
  id: number,
): Promise<PokemonDetalle> {
  const pokemon = await pokeFetch(`/pokemon/${id}`, esquemaPokemonPokeApi);

  return {
    id: pokemon.id,
    nombre: pokemon.name,
    sprite: `${SPRITE}/${pokemon.id}.png`,
    tipos: pokemon.types.map(({ type }) => type.name),
    estadisticas: pokemon.stats.map(({ stat, base_stat }) => ({
      nombre: stat.name,
      valor: base_stat,
    })),
    habilidades: pokemon.abilities.map(({ ability, is_hidden }) => ({
      nombre: ability.name,
      oculta: is_hidden,
    })),
  };
}
