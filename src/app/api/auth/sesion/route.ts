import {
  cookieSesionVacia,
  crearCookieSesion,
  cerrarSesion,
  DURACION_SESION_MS,
  valorCookieSesion,
} from "@/lib/auth";
import { ErrorHttp } from "@/lib/errores";
import { exigirOrigenDelSitio, leerJson, manejar } from "@/lib/http";
import { esquemaCrearSesion } from "@/schemas/sesion";

export const POST = manejar(async (request: Request) => {
  exigirOrigenDelSitio(request);

  const cuerpo = esquemaCrearSesion.parse(await leerJson(request));

  let cookie: string;
  try {
    cookie = await crearCookieSesion(cuerpo.idToken);
  } catch (error) {
    const codigo =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string"
        ? error.code
        : "UNKNOWN";
    const mensaje =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
        ? error.message
        : String(error);
    console.error("ERROR_SESION:", codigo, mensaje);
    if (error instanceof ErrorHttp) {
      throw error;
    }
    throw new ErrorHttp(401, "Token inválido");
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": valorCookieSesion(
        cookie,
        Math.floor(DURACION_SESION_MS / 1000),
      ),
      "Cache-Control": "no-store",
    },
  });
});

export const DELETE = manejar(async (request: Request) => {
  exigirOrigenDelSitio(request);
  await cerrarSesion(request);

  return new Response(null, {
    status: 204,
    headers: {
      "Set-Cookie": cookieSesionVacia(),
      "Cache-Control": "no-store",
    },
  });
});
