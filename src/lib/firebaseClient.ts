"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { esquemaConfiguracionFirebaseWeb } from "@/schemas/sesion";

export function firebaseAuthWeb() {
  const configuracion = esquemaConfiguracionFirebaseWeb.parse({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
  const app = getApps().some((existente) => existente.name === "[DEFAULT]")
    ? getApp()
    : initializeApp(configuracion);

  return getAuth(app);
}
