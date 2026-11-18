import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/pokemon/route";
import { GET as GETDetalle } from "@/app/api/pokemon/[id]/route";
import { listarPokemon } from "@/services/pokemonService";

function resultados(desde: number, cantidad: number) {
  return Array.from({ length: cantidad }, (_, indice) => {
    const id = desde + indice;
    return {
      name: `poke-${id}`,
      url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
    };
  });
}

function detalleDeBulbasaur() {
  return {
    id: 1,
    name: "bulbasaur",
    types: [
      { slot: 1, type: { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" } },
      { slot: 2, type: { name: "poison", url: "https://pokeapi.co/api/v2/type/4/" } },
    ],
    stats: [
      { base_stat: 45, stat: { name: "hp", url: "https://pokeapi.co/api/v2/stat/1/" } },
      { base_stat: 49, stat: { name: "attack", url: "https://pokeapi.co/api/v2/stat/2/" } },
    ],
    abilities: [
      {
        ability: { name: "overgrow", url: "https://pokeapi.co/api/v2/ability/65/" },
        is_hidden: false,
        slot: 1,
      },
      {
        ability: { name: "chlorophyll", url: "https://pokeapi.co/api/v2/ability/34/" },
        is_hidden: true,
        slot: 3,
      },
    ],
  };
}

describe("listarPokemon", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devuelve 20 ítems y el cursor de la siguiente página", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          count: 40,
          results: resultados(1, 20),
        }),
      }),
    );

    const pagina = await listarPokemon({
      offset: 0,
      limite: 20,
    });

    expect(pagina.items).toHaveLength(20);
    expect(pagina.items[0]).toMatchObject({
      id: 1,
      nombre: "poke-1",
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    });
    expect(pagina.siguienteCursor).toBe("20");
  });

  it("filtra por prefijo de nombre", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          count: 3,
          results: [
            { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
            { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon/2/" },
            { name: "pikachu", url: "https://pokeapi.co/api/v2/pokemon/25/" },
          ],
        }),
      }),
    );

    const pagina = await listarPokemon({
      offset: 0,
      limite: 20,
      q: "pi",
    });

    expect(pagina.items.map((item) => item.nombre)).toEqual(["pikachu"]);
    expect(pagina.siguienteCursor).toBeNull();
  });
});

describe("GET /api/pokemon", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("responde 400 si la búsqueda es inválida", async () => {
    const respuesta = await GET(
      new Request("http://localhost:3000/api/pokemon?q=1"),
    );

    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.error).toBe("Datos inválidos");
    expect(cuerpo.detalles).toEqual(
      expect.arrayContaining([expect.objectContaining({ campo: "q" })]),
    );
  });

  it("responde 429 al superar 60 solicitudes por minuto desde la misma IP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ count: 0, results: [] }),
      }),
    );

    const respuestas = await Promise.all(
      Array.from({ length: 61 }, () =>
        GET(
          new Request("http://localhost:3000/api/pokemon", {
            headers: { "x-real-ip": "203.0.113.211" },
          }),
        ),
      ),
    );
    const limitada = respuestas.find((respuesta) => respuesta.status === 429);

    expect(respuestas.filter((respuesta) => respuesta.status === 200)).toHaveLength(
      60,
    );
    expect(limitada).toBeDefined();
    expect(await limitada?.json()).toMatchObject({
      error: "Demasiadas solicitudes",
    });
  });
});

describe("GET /api/pokemon/[id]", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("valida el ID y devuelve tipos, estadísticas y habilidades", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => detalleDeBulbasaur(),
      }),
    );

    const respuesta = await GETDetalle(
      new Request("http://localhost:3000/api/pokemon/1"),
    );

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toMatchObject({
      id: 1,
      nombre: "bulbasaur",
      tipos: ["grass", "poison"],
      estadisticas: [
        { nombre: "hp", valor: 45 },
        { nombre: "attack", valor: 49 },
      ],
      habilidades: [
        { nombre: "overgrow", oculta: false },
        { nombre: "chlorophyll", oculta: true },
      ],
    });
  });

  it("responde 400 sin consultar PokéAPI cuando el ID es inválido", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    const respuesta = await GETDetalle(
      new Request("http://localhost:3000/api/pokemon/1.5"),
    );

    expect(respuesta.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("responde 502 si PokéAPI devuelve datos con formato inválido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 1, name: "bulbasaur" }),
      }),
    );

    const respuesta = await GETDetalle(
      new Request("http://localhost:3000/api/pokemon/1"),
    );

    expect(respuesta.status).toBe(502);
  });
});
