# Evidencias de Calidad

## 1. Rendimiento y Core Web Vitals (Lighthouse Móvil)
- **Antes (dev):** Rendimiento 74
- **Después (build producción):** Rendimiento 94
- **Accesibilidad:** 100
- **Buenas Prácticas:** 96
- **SEO:** 100

## 2. Responsive (Mobile-First)
- **360px:** Una columna, menú ajustado sin desbordamiento horizontal. (Ver `responsive-360.png`)
- **768px:** Dos columnas. (Ver `responsive-768.png`)
- **1024px:** Tres columnas. (Ver `responsive-1024.png`)

## 3. Accesibilidad
- Lighthouse: 100.
- Prueba manual de teclado: `Enter` abre la ficha del Pokémon, `F` marca/desmarca como favorito. Foco visible en todos los controles.
- Axe DevTools: 0 errores encontrados. (Ver `axe-accesibilidad.png`)

## 4. Cómo reproducir
1. Ejecutar `npm run build` y luego `npm run start`.
2. Abrir Chrome en modo incógnito (para evitar extensiones).
3. Usar Lighthouse en modo Mobile.
