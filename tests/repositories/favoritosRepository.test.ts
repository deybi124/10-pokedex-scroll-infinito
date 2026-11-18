import { beforeEach, describe, expect, it, vi } from "vitest";

const crear = vi.fn();
const guardarContador = vi.fn();
const borrar = vi.fn();
const getTransaccional = vi.fn();
const ejecutarTransaccion = vi.fn();
const coleccion = {
  doc: vi.fn((id: string) => ({ id, tipo: "favorito" })),
  get: vi.fn(),
};
const contadores = {
  doc: vi.fn((id: string) => ({ id, tipo: "contador" })),
};
const documentoUsuario = {
  collection: vi.fn((nombre: string) =>
    nombre === "favoritos" ? coleccion : contadores,
  ),
};
const usuarios = {
  doc: vi.fn(() => documentoUsuario),
};
const firestore = {
  collection: vi.fn(() => usuarios),
  runTransaction: ejecutarTransaccion,
};

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => firestore,
}));
vi.mock("@/lib/firebaseAdmin", () => ({
  appAdmin: () => ({}),
}));

import {
  agregarFavorito,
  quitarFavorito,
} from "@/repositories/favoritosRepository";

describe("agregarFavorito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ejecutarTransaccion.mockImplementation(
      (callback: (transaccion: unknown) => Promise<unknown>) =>
        callback({
          get: getTransaccional,
          create: crear,
          set: guardarContador,
          delete: borrar,
        }),
    );
    getTransaccional.mockImplementation(async (referencia: { tipo: string }) => {
      if (referencia.tipo === "favorito") {
        return { exists: false };
      }
      if (referencia.tipo === "contador") {
        return { exists: true, data: () => ({ cantidad: 50 }) };
      }
      return { size: 50 };
    });
  });

  it("aplica el límite dentro de la transacción antes de escribir", async () => {
    await expect(
      agregarFavorito("usuario-1", 25, "pikachu"),
    ).rejects.toMatchObject({ estado: 409 });

    expect(getTransaccional).toHaveBeenCalledTimes(2);
    expect(crear).not.toHaveBeenCalled();
  });

  it("permite el favorito número 50 y actualiza el contador atómicamente", async () => {
    getTransaccional.mockImplementation(async (referencia: { tipo: string }) =>
      referencia.tipo === "favorito"
        ? { exists: false }
        : { exists: true, data: () => ({ cantidad: 49 }) },
    );

    await expect(
      agregarFavorito("usuario-1", 25, "pikachu"),
    ).resolves.toMatchObject({ pokemonId: 25, nombre: "pikachu" });

    expect(crear).toHaveBeenCalledWith(
      expect.objectContaining({ id: "25" }),
      expect.objectContaining({ nombre: "pikachu" }),
    );
    expect(guardarContador).toHaveBeenCalledWith(
      expect.objectContaining({ id: "favoritos" }),
      { cantidad: 50 },
    );
  });

  it("reduce el contador al quitar un favorito", async () => {
    getTransaccional.mockImplementation(async (referencia: { tipo: string }) =>
      referencia.tipo === "favorito"
        ? { exists: true }
        : { exists: true, data: () => ({ cantidad: 1 }) },
    );

    await quitarFavorito("usuario-1", 25);

    expect(borrar).toHaveBeenCalledWith(expect.objectContaining({ id: "25" }));
    expect(guardarContador).toHaveBeenCalledWith(
      expect.objectContaining({ id: "favoritos" }),
      { cantidad: 0 },
    );
  });
});
