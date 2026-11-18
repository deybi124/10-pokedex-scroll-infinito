import { z } from "zod";

export const esquemaCrearSesion = z
  .object({
    idToken: z.string().min(1, "El idToken es obligatorio"),
  })
  .strict();

export const esquemaCredencialesLogin = z
  .object({
    correo: z.string().email("Ingresa un correo válido"),
    contrasena: z.string().min(1, "La contraseña es obligatoria"),
  })
  .strict();

export const esquemaConfiguracionFirebaseWeb = z
  .object({
    apiKey: z.string().min(1),
    authDomain: z.string().min(1),
    projectId: z.string().min(1),
    appId: z.string().min(1),
  })
  .strict();

export const esquemaErrorSesion = z
  .object({
    error: z.string(),
  })
  .passthrough();

export type CuerpoCrearSesion = z.infer<typeof esquemaCrearSesion>;
