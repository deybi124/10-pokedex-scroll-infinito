import type { DecodedIdToken } from "firebase-admin/auth";
import { authAdmin } from "@/lib/firebaseAdmin";
import { ErrorHttp } from "@/lib/errores";
import { leerCookie } from "@/lib/http";

export const NOMBRE_COOKIE_SESION = "sesion";
export const DURACION_SESION_MS = 5 * 24 * 60 * 60 * 1000;
const SEGUNDOS_INICIO_RECIENTE = 5 * 60;

export type UsuarioSesion = {
  uid: string;
  correo: string | null;
  rol: string | null;
};

function mapearUsuario(decoded: DecodedIdToken): UsuarioSesion {
  const rol = typeof decoded.rol === "string" ? decoded.rol : null;
  return {
    uid: decoded.uid,
    correo: decoded.email ?? null,
    rol,
  };
}

function tokenPortador(request: Request): string | undefined {
  const authorization = request.headers.get("authorization");
  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return undefined;
  }

  const token = authorization.slice(7).trim();
  return token.length > 0 ? token : undefined;
}

export function valorCookieSesion(valor: string, maxAgeSegundos: number): string {
  return [
    `${NOMBRE_COOKIE_SESION}=${encodeURIComponent(valor)}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAgeSegundos}`,
  ].join("; ");
}

export function cookieSesionVacia(): string {
  return valorCookieSesion("", 0);
}

export async function crearCookieSesion(idToken: string): Promise<string> {
  const decoded = await authAdmin().verifyIdToken(idToken);
  const ahora = Math.floor(Date.now() / 1000);

  if (ahora - decoded.auth_time > SEGUNDOS_INICIO_RECIENTE) {
    throw new ErrorHttp(401, "El inicio de sesión no es reciente");
  }

  return authAdmin().createSessionCookie(idToken, {
    expiresIn: DURACION_SESION_MS,
  });
}

export async function cerrarSesion(request: Request): Promise<void> {
  const cookie = leerCookie(request, NOMBRE_COOKIE_SESION);
  const portador = tokenPortador(request);

  try {
    if (portador) {
      const decoded = await authAdmin().verifyIdToken(portador);
      await authAdmin().revokeRefreshTokens(decoded.uid);
      return;
    }

    if (cookie) {
      const decoded = await authAdmin().verifySessionCookie(cookie, true);
      await authAdmin().revokeRefreshTokens(decoded.uid);
    }
  } catch {
    // Cerrar sesión es idempotente: si el token ya no vale, igual se borra la cookie.
  }
}

export async function requerirUsuario(request: Request): Promise<UsuarioSesion> {
  const portador = tokenPortador(request);
  const cookie = leerCookie(request, NOMBRE_COOKIE_SESION);

  try {
    if (portador) {
      return mapearUsuario(await authAdmin().verifyIdToken(portador));
    }

    if (cookie) {
      return mapearUsuario(await authAdmin().verifySessionCookie(cookie, true));
    }
  } catch {
    throw new ErrorHttp(401, "No autenticado");
  }

  throw new ErrorHttp(401, "No autenticado");
}
