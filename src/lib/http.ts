import { ZodError } from "zod";
import { ErrorHttp } from "@/lib/errores";

const CABECERA_ID = "x-request-id";

export function idPeticion(request: Request): string {
  return request.headers.get(CABECERA_ID) ?? crypto.randomUUID();
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
