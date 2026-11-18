import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Explorador de Pokémon con scroll infinito y búsqueda",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-zinc-900"
        >
          Saltar al contenido
        </a>
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <p className="text-lg font-semibold">
              <Link
                href="/"
                className="rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
              >
                Pokédex
              </Link>
            </p>
            <nav aria-label="Principal" className="w-full sm:w-auto">
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm sm:gap-4 sm:text-base">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-11 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favoritos"
                    className="inline-flex min-h-11 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
                  >
                    Favoritos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comparar"
                    className="inline-flex min-h-11 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
                  >
                    Comparar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex min-h-11 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
                  >
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 dark:border-zinc-800">
          <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-zinc-600 dark:text-zinc-400">
            Datos de PokéAPI. La Pokédex no está afiliada a Nintendo.
          </p>
        </footer>
      </body>
    </html>
  );
}
