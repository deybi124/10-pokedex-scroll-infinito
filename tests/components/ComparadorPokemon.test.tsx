/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  query: "a=1&b=25",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/comparar",
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

import { ComparadorPokemon } from "@/components/ComparadorPokemon";

function detalle(id: number, nombre: string, tipo: string) {
  return {
    id,
    nombre,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    tipos: [tipo],
    estadisticas: [{ nombre: "hp", valor: 45 }],
    habilidades: [],
  };
}

describe("ComparadorPokemon", () => {
  beforeEach(() => {
    mocks.query = "a=1&b=25";
    mocks.push.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("carga los IDs de la URL y actualiza la URL al elegir otros Pokémon", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => detalle(1, "bulbasaur", "grass"),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => detalle(25, "pikachu", "electric"),
      });
    vi.stubGlobal("fetch", fetch);

    render(<ComparadorPokemon />);

    expect(await screen.findByRole("heading", { name: /bulbasaur/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /pikachu/i })).toBeTruthy();
    expect(screen.getAllByRole("meter")).toHaveLength(2);

    fireEvent.change(screen.getByRole("spinbutton", { name: /primer/i }), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /segundo/i }), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Comparar" }));

    await waitFor(() =>
      expect(mocks.push).toHaveBeenCalledWith("/comparar?a=4&b=6", {
        scroll: false,
      }),
    );
  });

  it("muestra un error recuperable si un Pokémon no existe", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    render(<ComparadorPokemon />);

    expect(
      await screen.findByText("No se encontró un Pokémon con el ID 1."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeTruthy();
  });

  it("rechaza comparar el mismo ID", () => {
    mocks.query = "a=1&b=1";

    render(<ComparadorPokemon />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Elige dos Pokémon distintos",
    );
  });
});
