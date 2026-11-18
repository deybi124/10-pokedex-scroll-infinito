# Evidencias de Calidad

## 1. Rendimiento y Core Web Vitals (Lighthouse Móvil)
- **Antes (dev):** Performance 74.
- **Después (build producción):** Performance 94.
- **Métricas:** LCP: 1.4s, INP: <200ms, CLS: 0.
- **Optimización:** Se cambió a `next/image` con `loading="lazy"` y se hizo un build de producción.

## 2. Responsive (Mobile-First)
- 360px, 768px y 1024px probados sin scroll horizontal (capturas adjuntas: `responsive-360.png`, `responsive-768.png`, `responsive-1024.png`).

## 3. Accesibilidad
- Lighthouse: 100 en Accesibilidad.
- Revisión manual: Navegación con teclado, contraste AA, `aria-live` probado.
- **Nota:** No se incluye captura de axe DevTools porque no se pudo ejecutar la extensión, pero el informe de Lighthouse confirma los 100 puntos.

## 4. Cómo reproducir
1. Ejecutar `npm run build` y luego `npm run start`.
2. Abrir Chrome en modo incógnito.
3. Usar Lighthouse en modo Mobile.
