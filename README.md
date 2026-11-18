# Pokédex con Scroll Infinito

Aplicación web para explorar Pokémon, buscar, guardar favoritos y comparar.

**URL Desplegada:** [https://10-pokedex-scroll-infinito.vercel.app](https://10-pokedex-scroll-infinito.vercel.app) *(Nota: Si tu Vercel no funcionó, borra esta línea).*

## Características
- Scroll infinito (20 en 20) con `IntersectionObserver`.
- Búsqueda por nombre con debounce.
- Ficha de detalle con estadísticas y habilidades.
- Favoritos por usuario (Firebase Auth + Firestore).
- Comparador de dos Pokémon.
- Atajos de teclado: `Enter` (abrir ficha), `F` (favorito).

## Tecnologías
Next.js (App Router), TypeScript, Firebase (Auth y Firestore), Zod, Vitest, Tailwind CSS.

## Instalación en local
1. Clona el repositorio:
   ```bash
   git clone https://github.com/deybi124/10-pokedex-scroll-infinito.git
   