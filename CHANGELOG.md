# Historial de cambios — Void Rescue II

Este historial describe el desarrollo activo de la versión web de **Void Rescue II**, que queda cerrado con la primera versión estable **v1.0.0**.

## Mantenimiento posterior a v1.0.0 — 11 de octubre de 2026

- Explosiones de naves con partículas y destellos adaptados al color del cielo, reutilizando el contraste complementario del HUD.
- Contraste de partículas oscuras sobre cielos claros y actualización de paleta al cambiar de paisaje, incluso con rotación aleatoria reproducible por semilla.
- Integración visual sin modificar simulación ni reglas de juego (PR #15).

## [v1.0.0] — 11 de octubre de 2026

**Primera versión estable (Release oficial).** Sitio jugable en [GitHub Pages](https://raulcamaracarreon.github.io/Void-Rescue-II/).

### Jugabilidad
- Dos sistemas seleccionables: **Clásico** (amenazas programadas y finitas) y **Dinámico por zonas** (enemigos recurrentes, cooldown sectorial y límite de población).
- Dos misiones compatibles con ambos sistemas: **Rescatista** y **Defensivo**.
- En modo dinámico, la victoria Rescatista depende del destino de todos los colonos, con al menos uno entregado. Defensivo exige resistir un tiempo manteniendo un mínimo de colonos vivos.
- **Haz de rescate sostenido**: mantener pulsado el botón para elevar progresivamente a los colonos; hasta **ocho pasajeros embarcados** y entrega simultánea en Fortaleza 01.
- Ajustes de navegación, comportamiento de enemigos, láser, radar, luna, HUD, bombas, efectos y gamepad.

### Paisajes
- **13 ambientes predefinidos** con varias capas de paralaje y gradientes de color, incluidos **Ocaso Marciano**, **Nublado Polar** y **Planeta extraño**.
- Editor automático de dos colores y avanzado por capa; biblioteca de **hasta 100 paisajes personalizados** con guardado, renombrado, edición y duplicación.
- **Rotación entre oleadas** que combina ambientes predefinidos y guardados, secuencial o aleatoria sin repeticiones por ciclo y reproducible por semilla.

### Proyecto y publicación
- Proyecto propio **Void Rescue II**, independiente de [Void Rescue I](https://github.com/raulcamaracarreon/Void-Rescue-I).
- Fuente y avisos: **MIT** para el código original y las licencias de terceros conservadas; Three.js (MIT) es la biblioteca de ejecución principal.
- Publicación automática en GitHub Pages desde `main`, con validación del SHA publicado.
- README de la versión II y guía de despliegue; archivo histórico del desarrollo.
- Validación previa a la Release: TypeScript, compilación, pruebas unitarias y de navegador (WebGPU/WebGL2) en GitHub Actions.

### Estado
- **Desarrollo activo cerrado**; siguientes modificaciones únicamente para mantenimiento, seguridad o errores reproducibles, salvo que se abra una nueva fase de producto.
- La descarga adjunta a Releases es un **paquete de sitio web estático**, no un ejecutable nativo ni una compilación para Steam.
- Una distribución futura en Steam requeriría empaquetado independiente y gestión administrativa de Steamworks.

[Licencias y Steam](docs/LICENSING_AND_STEAM.md) · [Avisos de terceros](THIRD_PARTY_NOTICES.md) · [Manual de juego](README.md)
