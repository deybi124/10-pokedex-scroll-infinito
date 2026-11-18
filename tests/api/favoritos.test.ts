import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requerirUsuario: vi.fn(),
  agregarFavorito: vi.fn(),
  listarFavoritos: vi.fn(),
  quitarFavorito: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  requerirUsuario: mocks.requerirUsuario,
}));
vi.mock("@/services/favoritosService", () => ({
  agregarFavorito: mocks.agregarFavorito,
  listarFavoritos: mocks.listarFavoritos,
  quitarFavorito: mocks.quitarFavorito,
}));

import { DELETE, GET, POST } from "@/app/api/favoritos/route";
import { ErrorHttp } from "@/lib/errores";

const ORIGEN = "http://localhost:3000";

function peticion(url: string, init: RequestInit = {}) {
  return new Request(url, init);
}

describe("/api/favoritos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requerirUsuario.mockResolvedValue({
      uid: "usuario-1",
      correo: "entrenador@example.com",
      rol: null,
    });
  });

  it("rechaza sin sesión y no consulta Firestore", async () => {
    mocks.requerirUsuario.mockRejectedValue(
      new ErrorHttp(401, "No autenticado"),
    );

    const respuesta = await GET(peticion(`${ORIGEN}/api/favoritos`));

    expect(respuesta.status).toBe(401);
    expect(mocks.listarFavoritos).not.toHaveBeenCalled();
  });

  it("devuelve los favoritos del UID de la sesión sin caché", async () => {
    mocks.listarFavoritos.mockResolvedValue([
      {
        pokemonId: 25,
        nombre: "pikachu",
        agregadoEn: "2026-11-17T12:00:00.000Z",
      },
    ]);

    const respuesta = await GET(peticion(`${ORIGEN}/api/favoritos`));

    expect(respuesta.status).toBe(200);
    expect(respuesta.headers.get("Cache-Control")).toBe("no-store");
    expect(mocks.listarFavoritos).toHaveBeenCalledWith("usuario-1");
    await expect(respuesta.json()).resolves.toMatchObject({
      items: [{ pokemonId: 25, nombre: "pikachu" }],
    });
  });

  it("rechaza cuerpos inválidos antes de agregar", async () => {
    const respuesta = await POST(
      peticion(`${ORIGEN}/api/favoritos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: ORIGEN,
        },
        body: JSON.stringify({ pokemonId: 0 }),
      }),
    );

    expect(respuesta.status).toBe(400);
    expect(mocks.agregarFavorito).not.toHaveBeenCalled();
  });

  it("propaga el conflicto al intentar superar el máximo", async () => {
    mocks.agregarFavorito.mockRejectedValue(
      new ErrorHttp(409, "No puedes guardar más de 50 favoritos"),
    );

    const respuesta = await POST(
      peticion(`${ORIGEN}/api/favoritos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: ORIGEN,
        },
        body: JSON.stringify({ pokemonId: 25 }),
      }),
    );

    expect(respuesta.status).toBe(409);
    expect(mocks.agregarFavorito).toHaveBeenCalledWith("usuario-1", 25);
  });

  it("valida el ID antes de quitar un favorito", async () => {
    const respuesta = await DELETE(
      peticion(`${ORIGEN}/api/favoritos?pokemonId=0`, {
        method: "DELETE",
        headers: { Origin: ORIGEN },
      }),
    );

    expect(respuesta.status).toBe(400);
    expect(mocks.quitarFavorito).not.toHaveBeenCalled();
  });
});
