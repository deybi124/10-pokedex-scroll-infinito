# Bitácora de instrucciones y validación

Resumen de las solicitudes realizadas y de las comprobaciones registradas durante el desarrollo. No se incluyen credenciales ni tokens.

1. **Corregir la carga de la lista y revisar el scroll infinito.** Se comprobó la URL `/api/pokemon?offset=...&limite=...`, el mapeo de resultados y el Route Handler; la API respondió `200`, cargó las tarjetas y el scroll pidió más resultados. No se necesitó cambiar código.
2. **Implementar la ficha de detalle (RF-03).** Se añadió la ruta de detalle, validación Zod, tipos, estadísticas y habilidades. Pruebas y build pasaron; la ficha se verificó en el navegador.
3. **Implementar favoritos (RF-04 y RF-06).** Se añadieron persistencia mediante Firebase Admin, handlers protegidos, límite de 50, interfaz accesible, atajo de teclado y página de favoritos. Pasaron pruebas, lint y build.
4. **Implementar el comparador (RF-05).** Se añadieron los parámetros compartibles en URL, estados de carga/error y comparación de estadísticas y tipos. Pasaron 28 pruebas, lint y build; se verificó en el navegador.
5. **Crear la interfaz de login.** Se implementó Firebase Auth web y el intercambio del ID token por una cookie HttpOnly. Pasaron 30 pruebas, lint y build; el caso de credenciales inválidas se simuló sin usar una cuenta real.
6. **Diagnosticar errores al crear la sesión.** Se registraron el código y mensaje del error sin exponer tokens. Pasaron las 6 pruebas dirigidas y ESLint.
7. **Cargar credenciales Admin desde un JSON local protegido por Git.** Se añadieron validación Zod y normalización de saltos de línea con datos ficticios. Pasaron 7 pruebas, ESLint y build; no se inspeccionó ni incorporó una clave real.
8. **Normalizar `FIREBASE_PRIVATE_KEY` desde el entorno.** Se confirmó que el loader convierte los `\n` literales antes de llamar a `cert()` y se añadió una prueba de regresión sintética. Pasaron 2 pruebas dirigidas y ESLint. Una clave privada compartida durante la conversación debe revocarse y reemplazarse.
9. **Crear documentación OpenAPI y solicitudes Bruno.** Se documentaron las rutas y esquemas de la API, incluidos `/api/auth/yo` y el cierre de sesión; se agregaron solicitudes para login, validación `400`, autenticación `401` y listado `200`. La solicitud de login requiere que el usuario reemplace el valor de ejemplo por un ID token Firebase válido y reciente.
