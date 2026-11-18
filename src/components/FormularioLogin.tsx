"use client";

import { FirebaseError } from "firebase/app";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { firebaseAuthWeb } from "@/lib/firebaseClient";
import {
  esquemaCredencialesLogin,
  esquemaErrorSesion,
} from "@/schemas/sesion";
import { ZodError } from "zod";

function mensajeDeError(error: unknown): string {
  if (error instanceof ZodError) {
    return "Falta configurar Firebase para iniciar sesión.";
  }

  if (error instanceof FirebaseError) {
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/invalid-email"
    ) {
      return "Correo o contraseña incorrectos.";
    }
    if (error.code === "auth/too-many-requests") {
      return "Demasiados intentos. Espera un momento antes de reintentar.";
    }
    if (error.code === "auth/network-request-failed") {
      return "No se pudo conectar con Firebase. Comprueba tu conexión.";
    }
    if (error.code === "auth/operation-not-allowed") {
      return "El inicio de sesión por correo y contraseña no está habilitado.";
    }
  }

  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

export function FormularioLogin() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");

    const credenciales = esquemaCredencialesLogin.safeParse({
      correo,
      contrasena,
    });
    if (!credenciales.success) {
      setError(credenciales.error.issues[0]?.message ?? "Datos inválidos.");
      return;
    }

    setCargando(true);
    try {
      const resultado = await signInWithEmailAndPassword(
        firebaseAuthWeb(),
        credenciales.data.correo,
        credenciales.data.contrasena,
      );
      const idToken = await resultado.user.getIdToken();
      const respuesta = await fetch("/api/auth/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ idToken }),
      });

      if (!respuesta.ok) {
        const resultadoError = esquemaErrorSesion.safeParse(
          await respuesta.json(),
        );
        setError(
          resultadoError.success
            ? resultadoError.data.error
            : "No se pudo crear la sesión del servidor.",
        );
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (causa) {
      setError(mensajeDeError(causa));
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={(evento) => void iniciarSesion(evento)}
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="correo-login" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="correo-login"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "error-login" : undefined}
          className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-100"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contrasena-login" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="contrasena-login"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "error-login" : undefined}
          className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-100"
        />
      </div>
      {error ? (
        <p id="error-login" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={cargando}
        aria-busy={cargando}
        className="min-h-11 rounded-lg bg-zinc-900 px-4 font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:focus-visible:outline-zinc-100"
      >
        {cargando ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
      <Link
        href="/"
        className="min-h-11 w-fit rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
      >
        Volver a la Pokédex
      </Link>
    </form>
  );
}
