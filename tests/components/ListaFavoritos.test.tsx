/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ListaFavoritos } from "@/components/ListaFavoritos";

describe("ListaFavoritos", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra los favoritos guardados con enlace a sus fichas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          items: [
            {
              pokemonId: 25,
              nombre: "pikachu",
              agregadoEn: "2026-11-17T12:00:00.000Z",
            },
          ],
        }),
      }),
    );

    render(<ListaFavoritos />);

    const enlace = await screen.findByRole("link", {
      name: /pikachu/i,
    });
    expect(enlace.getAttribute("href")).toBe("/pokemon/25");
  });
});
