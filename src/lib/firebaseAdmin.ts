import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { esquemaCuentaServicioFirebase } from "@/schemas/firebase";

const RUTA_CUENTA_SERVICIO = resolve(
  process.cwd(),
  "serviceAccountKey.json",
);

function normalizarClave(clave: string): string {
  return clave.replace(/\\n/g, "\n");
}

function leerCredencialesArchivo() {
  const contenido = readFileSync(RUTA_CUENTA_SERVICIO, "utf8");
  let json: unknown;

  try {
    json = JSON.parse(contenido);
  } catch {
    throw new Error("serviceAccountKey.json no contiene JSON válido");
  }

  const cuenta = esquemaCuentaServicioFirebase.safeParse(json);
  if (!cuenta.success) {
    throw new Error(
      "serviceAccountKey.json debe incluir project_id, client_email y private_key válidos",
    );
  }

  return {
    projectId: cuenta.data.project_id,
    clientEmail: cuenta.data.client_email,
    privateKey: normalizarClave(cuenta.data.private_key),
  };
}

function leerCredencialesEntorno() {
  // 1. NUEVO MÉTODO (Recomendado para Vercel): Una sola variable con todo el JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const cuenta = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      const validado = esquemaCuentaServicioFirebase.safeParse(cuenta);
      if (validado.success) {
        return {
          projectId: validado.data.project_id,
          clientEmail: validado.data.client_email,
          // JSON.parse ya convierte los \n literales en saltos de línea reales
          privateKey: validado.data.private_key,
        };
      }
    } catch (error) {
      console.error("Error parseando FIREBASE_SERVICE_ACCOUNT_KEY:", error);
    }
  }

  // 2. MÉTODO ANTIGUO (Variables separadas)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Configura FIREBASE_SERVICE_ACCOUNT_KEY (JSON completo) o las variables FIREBASE_* en Vercel",
    );
  }

  return { projectId, clientEmail, privateKey: normalizarClave(privateKey) };
}

function leerCredenciales() {
  // En local, si existe el archivo físico, lo usa. En Vercel, usa las variables.
  return existsSync(RUTA_CUENTA_SERVICIO)
    ? leerCredencialesArchivo()
    : leerCredencialesEntorno();
}

export function appAdmin(): App {
  const existente = getApps()[0];
  if (existente) {
    return existente;
  }

  const { projectId, clientEmail, privateKey } = leerCredenciales();

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

export function authAdmin(): Auth {
  return getAuth(appAdmin());
}
