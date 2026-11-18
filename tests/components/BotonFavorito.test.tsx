/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BotonFavorito } from "@/components/BotonFavorito";

describe("BotonFavorito", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("actualiza aria-pressed al hacer clic y con la tecla F", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ items: [] }),
      })
      .mockResolvedValueOnce({ ok: true, status: 201 })
      .mockResolvedValueOnce({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetch);

    render(<BotonFavorito pokemonId={25} />);

    const boton = await screen.findByRole("button", {
      name: "Añadir a favoritos",
    });
    expect(boton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(boton);
    await waitFor(() =>
      expect(boton.getAttribute("aria-pressed")).toBe("true"),
    );

    fireEvent.keyDown(window, { key: "f" });
    await waitFor(() =>
      expect(boton.getAttribute("aria-pressed")).toBe("false"),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/favoritos",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ pokemonId: 25 }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      "/api/favoritos?pokemonId=25",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("ignora F cuando el foco está en un campo de texto", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [] }),
    });
    vi.stubGlobal("fetch", fetch);

    render(
      <>
        <input aria-label="Búsqueda" />
        <BotonFavorito pokemonId={25} />
      </>,
    );

    await screen.findByRole("button", { name: "Añadir a favoritos" });
    screen.getByRole("textbox", { name: "Búsqueda" }).focus();
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "f" });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
