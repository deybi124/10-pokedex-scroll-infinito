# Reglas del Proyecto (Pokedex)

Eres un desarrollador senior experto en Next.js, TypeScript y Firebase.
Tu tarea es construir el proyecto descrito en el archivo `10-pokedex-scroll-infinito.md`.

Reglas estrictas:
1. Sigue la arquitectura por capas de la sección 3 (servicios, repositorios).
2. Todo acceso a Firebase debe ser del lado del servidor (Route Handlers + Admin SDK). El navegador NUNCA toca Firestore.
3. Usa Zod en `src/schemas` para validar todo.
4. Escribe pruebas en `tests/` usando Vitest.
5. Cuando te pida un módulo, escribe el código en los archivos correspondientes. No crees archivos innecesarios.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
