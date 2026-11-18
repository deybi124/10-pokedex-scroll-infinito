import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyIdToken = vi.fn();
const createSessionCookie = vi.fn();
const verifySessionCookie = vi.fn();
const revokeRefreshTokens = vi.fn();

vi.mock("@/lib/firebaseAdmin", () => ({
  authAdmin: () => ({
    verifyIdToken,
    createSessionCookie,
    verifySessionCookie,
    revokeRefreshTokens,
  }),
}));

import { DELETE, POST } from "@/app/api/auth/sesion/route";
import { GET } from "@/app/api/auth/yo/route";
import { DURACION_SESION_MS } from "@/lib/auth";

const ORIGEN = "http://localhost:3000";

function peticion(
  url: string,
  init: RequestInit = {},
): Request {
  return new Request(url, init);
}

describe("POST /api/auth/sesion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde 400 si faltan campos", async () => {
    const respuesta = await POST(
      peticion(`${ORIGEN}/api/auth/sesion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: ORIGEN,
        },
        body: JSON.stringify({}),
      }),
    );

    expect(respuesta.status).toBe(400);
    const cuerpo = await respuesta.json();
    expect(cuerpo.error).toBe("Datos inválidos");
    expect(cuerpo.detalles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campo: "idToken" }),
      ]),
    );
  });

  it("responde 204 y fija la cookie HttpOnly", async () => {
    verifyIdToken.mockResolvedValue({
      uid: "u1",
      email: "ash@example.com",
      auth_time: Math.floor(Date.now() / 1000),
    });
    createSessionCookie.mockResolvedValue("cookie-sesion");

    const respuesta = await POST(
      peticion(`${ORIGEN}/api/auth/sesion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: ORIGEN,
        },
        body: JSON.stringify({ idToken: "token-valido" }),
      }),
    );

    expect(respuesta.status).toBe(204);
    expect(createSessionCookie).toHaveBeenCalledWith("token-valido", {
      expiresIn: DURACION_SESION_MS,
    });
    const setCookie = respuesta.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("sesion=cookie-sesion");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Secure");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
  });

  it("registra errores inesperados de Firebase antes de responder 401", async () => {
    const error = {
      code: "auth/invalid-credential",
      message: "Error de credenciales de prueba",
    };
    const registro = vi.spyOn(console, "error").mockImplementation(() => {});
    verifyIdToken.mockRejectedValue(error);

    const respuesta = await POST(
      peticion(`${ORIGEN}/api/auth/sesion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: ORIGEN,
        },
        body: JSON.stringify({ idToken: "token-de-prueba" }),
      }),
    );

    expect(respuesta.status).toBe(401);
    expect(registro).toHaveBeenCalledWith(
      "ERROR_SESION:",
      error.code,
      error.message,
    );
    registro.mockRestore();
  });
});

describe("GET /api/auth/yo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde 401 sin sesión", async () => {
    const respuesta = await GET(peticion(`${ORIGEN}/api/auth/yo`));

    expect(respuesta.status).toBe(401);
    await expect(respuesta.json()).resolves.toEqual({ error: "No autenticado" });
  });

  it("acepta Authorization Bearer para clientes de API", async () => {
    verifyIdToken.mockResolvedValue({
      uid: "u1",
      email: "ash@example.com",
      rol: "entrenador",
    });

    const respuesta = await GET(
      peticion(`${ORIGEN}/api/auth/yo`, {
        headers: { Authorization: "Bearer id-token" },
      }),
    );

    expect(respuesta.status).toBe(200);
    await expect(respuesta.json()).resolves.toEqual({
      usuario: { uid: "u1", correo: "ash@example.com", rol: "entrenador" },
    });
  });
});

describe("DELETE /api/auth/sesion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde 204 y borra la cookie", async () => {
    verifySessionCookie.mockResolvedValue({ uid: "u1" });
    revokeRefreshTokens.mockResolvedValue(undefined);

    const respuesta = await DELETE(
      peticion(`${ORIGEN}/api/auth/sesion`, {
        method: "DELETE",
        headers: {
          Origin: ORIGEN,
          Cookie: "sesion=cookie-sesion",
        },
      }),
    );

    expect(respuesta.status).toBe(204);
    expect(revokeRefreshTokens).toHaveBeenCalledWith("u1");
    expect(respuesta.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
