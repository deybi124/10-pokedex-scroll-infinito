/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { FirebaseError } from "firebase/app";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: {},
  signInWithEmailAndPassword: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/firebaseClient", () => ({
  firebaseAuthWeb: () => mocks.auth,
}));
vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
    refresh: mocks.refresh,
  }),
}));

import { FormularioLogin } from "@/components/FormularioLogin";

describe("FormularioLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("intercambia el idToken por una cookie y redirige al inicio", async () => {
    const getIdToken = vi.fn().mockResolvedValue("id-token-seguro");
    mocks.signInWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken },
    });
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    vi.stubGlobal("fetch", fetch);

    render(<FormularioLogin />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ash@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "contraseña-válida" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      mocks.auth,
      "ash@example.com",
      "contraseña-válida",
    );
    expect(getIdToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/sesion",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ idToken: "id-token-seguro" }),
      }),
    );
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("muestra un error comprensible para credenciales incorrectas", async () => {
    mocks.signInWithEmailAndPassword.mockRejectedValue(
      new FirebaseError("auth/invalid-credential", "Invalid credentials"),
    );
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    render(<FormularioLogin />);
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ash@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    const error = await screen.findByRole("alert");
    expect(error.textContent).toContain("Correo o contraseña incorrectos.");
    expect(fetch).not.toHaveBeenCalled();
  });
});
