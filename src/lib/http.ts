import { ZodError } from "zod";
import { ErrorHttp } from "@/lib/errores";

const CABECERA_ID = "x-request-id";
const LIMITE_PETICIONES_PUBLICAS = 60;
const VENTANA_RATE_LIMIT_MS = 60_000;
const MAX_CONTADORES_RATE_LIMIT = 10_000;

type ContadorRateLimit = {
  inicio: number;
  cantidad: number;
};

const contadoresRateLimit = new Map<string, ContadorRateLimit>();

function limpiarContadoresRateLimit(ahora: number): void {
  if (contadoresRateLimit.size < MAX_CONTADORES_RATE_LIMIT) {
    return;
  }

  for (const [ip, contador] of contadoresRateLimit) {
    if (ahora - contador.inicio >= VENTANA_RATE_LIMIT_MS) {
      contadoresRateLimit.delete(ip);
    }
  }

  if (contadoresRateLimit.size >= MAX_CONTADORES_RATE_LIMIT) {
    const masAntiguo = contadoresRateLimit.keys().next().value;
    if (masAntiguo !== undefined) {
      contadoresRateLimit.delete(masAntiguo);
    }
  }
}

export function idPeticion(request: Request): string {
  return request.headers.get(CABECERA_ID) ?? crypto.randomUUID();
}

export function limitarTasa(request: Request): void {
  const ahora = Date.now();
  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "desconocida";
  const contador = contadoresRateLimit.get(ip);

  if (!contador || ahora - contador.inicio >= VENTANA_RATE_LIMIT_MS) {
    limpiarContadoresRateLimit(ahora);
    contadoresRateLimit.set(ip, { inicio: ahora, cantidad: 1 });
    return;
  }

  if (contador.cantidad >= LIMITE_PETICIONES_PUBLICAS) {
    throw new ErrorHttp(429, "Demasiadas solicitudes");
  }

  contador.cantidad += 1;
}

export function origenDelSitio(request: Request): string {
  return new URL(request.url).origin;
}

export function exigirOrigenDelSitio(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    return;
  }

  if (origin !== origenDelSitio(request)) {
    throw new ErrorHttp(403, "Origen no permitido");
  }
}

export function leerCookie(request: Request, nombre: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) {
    return undefined;
  }

  for (const parte of header.split(";")) {
    const [clave, ...resto] = parte.trim().split("=");
    if (clave === nombre) {
      return decodeURIComponent(resto.join("="));
    }
  }

  return undefined;
}

export async function leerJson(request: Request): Promise<unknown> {
  const tipo = request.headers.get("content-type") ?? "";
  if (!tipo.toLowerCase().includes("application/json")) {
    throw new ErrorHttp(415, "Tipo de contenido no permitido");
  }

  try {
    return await request.json();
  } catch {
    throw new ErrorHttp(400, "Cuerpo JSON inválido");
  }
}

function respuestaError(
  estado: number,
  mensaje: string,
  id: string,
  detalles?: { campo: string; mensaje: string }[],
): Response {
  const cuerpo: { error: string; detalles?: { campo: string; mensaje: string }[] } =
    { error: mensaje };
  if (detalles?.length) {
    cuerpo.detalles = detalles;
  }

  return Response.json(cuerpo, {
    status: estado,
    headers: {
      "Cache-Control": "no-store",
      [CABECERA_ID]: id,
    },
  });
}

export function manejar(
  handler: (request: Request) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const id = idPeticion(request);

    try {
      const respuesta = await handler(request);
      respuesta.headers.set(CABECERA_ID, id);
      if (!respuesta.headers.has("Cache-Control")) {
        respuesta.headers.set("Cache-Control", "no-store");
      }
      return respuesta;
    } catch (error) {
      if (error instanceof ErrorHttp) {
        console.info(
          JSON.stringify({
            id,
            metodo: request.method,
            ruta: new URL(request.url).pathname,
            estado: error.estado,
          }),
        );
        return respuestaError(error.estado, error.mensaje, id, error.detalles);
      }

      if (error instanceof ZodError) {
        const detalles = error.issues.map((issue) => ({
          campo: issue.path.join(".") || "(raiz)",
          mensaje: issue.message,
        }));
        return respuestaError(400, "Datos inválidos", id, detalles);
      }

      console.error(
        JSON.stringify({
          id,
          metodo: request.method,
          ruta: new URL(request.url).pathname,
          estado: 500,
        }),
      );
      return respuestaError(500, "Error interno", id);
    }
  };
}
