import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requerirUsuario: vi.fn(),
  agregarFavorito: vi.fn(),
  listarFavoritos: vi.fn(),
  quitarFavorito: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requerirUsuario: mocks.requerirUsuario,
}));
vi.mock("@/repositories/favoritosRepository", () => ({
  agregarFavorito: mocks.agregarFavorito,
  listarFavoritos: mocks.listarFavoritos,
  quitarFavorito: mocks.quitarFavorito,
}));

import { POST } from "@/app/api/favoritos/route";

describe("POST /api/favoritos (integración)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("verifica sesión, obtiene el nombre del Pokémon y lo persiste por UID", async () => {
    mocks.requerirUsuario.mockResolvedValue({
      uid: "usuario-1",
      correo: null,
      rol: null,
    });
    mocks.agregarFavorito.mockImplementation(
      async (_uid: string, pokemonId: number, nombre: string) => ({
        pokemonId,
        nombre,
        agregadoEn: "2026-11-17T12:00:00.000Z",
      }),
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 25,
          name: "pikachu",
          types: [{ type: { name: "electric" } }],
          stats: [{ base_stat: 35, stat: { name: "hp" } }],
          abilities: [{ ability: { name: "static" }, is_hidden: false }],
        }),
      }),
    );

    const respuesta = await POST(
      new Request("http://localhost:3000/api/favoritos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({ pokemonId: 25 }),
      }),
    );

    expect(respuesta.status).toBe(201);
    expect(mocks.agregarFavorito).toHaveBeenCalledWith(
      "usuario-1",
      25,
      "pikachu",
    );
    await expect(respuesta.json()).resolves.toMatchObject({
      item: { pokemonId: 25, nombre: "pikachu" },
    });
  });
});
