# Void Rescue II — hoja de ruta inicial

**Estado:** objetivo 1 implementado y en revisión; objetivo 2 pendiente. Fuente importada desde [Void Rescue I](https://github.com/raulcamaracarreon/Void-Rescue-I), rama `master`, el 11-10-2026. Los 128 archivos del árbol base coinciden por nombre, modo y SHA de contenido con el origen. Esta importación conserva una instantánea del código, **no el historial de commits original**.

## Principio de diseño

Conservar el motor jugable de Void Rescue I: TypeScript, Vite, Three.js (WebGPU y WebGL2), vuelo, control por teclado/mando, sonido, IA, colisiones, radar, récords y pruebas. Cambiar únicamente lo necesario, con módulos aislados y sin modificar el repositorio original.

## Objetivo 1 — Paisajes procedurales con paralaje

- Tomar como referencia los algoritmos de [Landscape Generator — Parallax](https://github.com/raulcamaracarreon/Landscape-Generator-Parallax), especialmente `web/index.html` (`drawMountain`, `drawBuildings`, colores, semillas y composición).
- Incorporar 2–10 capas configurables de montañas o edificios, colores por capa, amplitud, detalle, semilla y velocidades de paralaje por profundidad.
- Ofrecer estilos predeterminados: noche estelar, ciudad abandonada, ocaso alienígena y mundo glacial; conservar estrellas en las variantes donde proceda.
- Añadir editor de estilos accesible desde las opciones, con vista previa, personalización, restablecimiento y almacenamiento local validado.
- Generar paisajes deterministas; evitar recalcular mallas/texturas cada cuadro.
- Cambiar de ambiente al **avanzar de oleada**, no según la posición dentro de una misma oleada (decisión inicial revisable).
- Garantizar continuidad al cruzar la costura del mundo circular de 2400 unidades; el decorado no debe modificar la colisión real del terreno.
- Probar ambos backends y respetar reducción de movimiento.

**Archivos existentes de referencia:** `src/render/WorldScene.ts`, `src/render/Renderer.ts`, `src/render/materials.ts`, `src/game/Terrain.ts`, `src/ui/Interface.ts`, `src/app/GameApp.ts`. Crear módulos nuevos de configuración, generación y dibujo sin incorporar dependencias PySide6/Qt.

## Objetivo 2 — Dos sistemas opcionales de aparición y condiciones de victoria

- **Conservar el modo Clásico original** con apariciones programadas y reglas previas. Ofrecer **Dinámico por zonas** como elección separada de la misión Rescatista/Defensivo; el director de amenazas opera tanto al explorar como al permanecer en una zona.
- Cada aparición deberá respetar distancia mínima a la nave y límites de enemigos simultáneos, ajustados por dificultad y oleada.
- **Rescatista:** la victoria ocurre cuando todos los colonos tienen estado terminal `safe` o `lost` y existe al menos un `safe`. Los colonos en `ground`, `targeted`, `captured`, `falling`, `extracting` o `carried` siguen pendientes. Si todos están `lost`, misión fallida.
- **Defensivo:** resistir un tiempo establecido, con un mínimo de colonos supervivientes al agotarse el reloj. Si ya no es posible alcanzar ese mínimo, fracaso anticipado. Ajustar balance tras pruebas; evitar elegir valores arbitrarios definitivos.
- Desacoplar la victoria de `spawnIndex === schedule.length` y `enemies.length === 0`; detener aparición y combate al resolverse una oleada.
- Conservar progresión, puntuación y controles. Diferenciar la clasificación de récords si las reglas dejan de ser comparables.
- Actualizar el HUD con contadores de colonos seguros, perdidos y pendientes, o cronómetro según el modo.

**Archivos de referencia:** `src/game/combat/WaveSystem.ts`, `Progression.ts`, `EnemySystem.ts`, `types.ts`, `src/game/Simulation.ts`, `src/ui/Interface.ts` y tests.

## Orden de trabajo

1. **Base importada:** comprobar contenido, dependencias y comandos existentes. No declarar compilación exitosa sin ejecutarla.
2. **Paisajes:** motor y presets → integración con cámara → editor/guardado → cambio por oleada → pruebas visuales.
3. **Juego:** spawns dinámicos → objetivos diferenciados → HUD/puntuación/progresión → pruebas funcionales.
4. **Balance:** pruebas de estrés, extremos de dificultad, controles y backends, documentación y versión.

## Verificación mínima

```powershell
npm ci
npm run typecheck
npm test
npm run build
npm run test:e2e
```

La validación de WebGPU y WebGL2, el rendimiento y la jugabilidad requieren ejecutar el juego; una revisión estática o la coincidencia de archivos no sustituyen esas pruebas.

## Historial y atribución

Este repositorio es una nueva línea de desarrollo derivada de la **instantánea** de Void Rescue I. El historial original sigue disponible en el repositorio fuente. Antes de una publicación final, verificar avisos y licencias aplicables a los componentes realmente redistribuidos.


## Ejecución del objetivo 1 (2026-10-11)

- [x] Cuatro presets, cambio automático por oleada y opción de estilo fijo.
- [x] Generador determinista de siluetas repetibles, montañas y edificios con paralaje en Three.js.
- [x] Editor de estilos con 2–10 capas, dos colores de cielo, estrellas, colores por capa, amplitud, detalle y semilla.
- [x] Preferencias guardadas y validadas localmente.
- [x] Reducción de movimiento, congelando desplazamiento relativo de estrellas, planeta y capas.
- [x] Fuente original intacta; clasificación de récords de Void Rescue II separada.
- [x] TypeScript, pruebas Vitest y build; 6/6 pruebas Playwright de paisajes a 960×540 en WebGPU automático/WebGL2.
- [x] Capturas reales del primer ambiente Ciudad abandonada a 1920×1080 en ambos backends.
- [ ] Revisión de fidelidad visual y control en el hardware del usuario; prueba exhaustiva de regresión del juego completo.
- [ ] Objetivo 2: spawns dinámicos y nuevas condiciones de victoria.

Las pruebas E2E a 1920×1080 agotaron sus tiempos en un runner Linux sin GPU dedicada: se mantuvieron las capturas de prueba visual y se ejecutaron las interacciones a 960×540, donde todos los casos aprobaron. No se extrapola ese resultado al rendimiento en otras máquinas.

## Refinamiento visual — dos modalidades de edición (2026-10-11)

- **Automático (predeterminado):** cielo uniforme elegido por el usuario y color frontal; cada capa `i` (0..N-1) recibe una interpolación RGB `(i+1)/N`, idéntica al generador original. La última capa coincide exactamente con el segundo extremo. Reparto de amplitud, detalle y velocidad por profundidad.
- **Avanzado:** edición individual de tipo, color, amplitud, detalle y gradiente del cielo. Al entrar por primera vez desde Automático, parte de las capas que se están viendo; al regresar, las ediciones avanzadas quedan preservadas.
- Selección de ambientes (automático por oleada o preset fijo) separada de modalidad de edición; personalización y validación persistidas.
- Compatibilidad: preferencias v1 personalizadas se conservan y migran como modo Avanzado.
- La nueva interfaz sólo presenta dos controles de color en modo Automático (más parámetros no cromáticos para capas, composición, semillas y estrellas).

## Arquitectura de modalidades (implementación en revisión, 11-10-2026)

- [x] Selector de sistema de enemigos (Clásico, Dinámico) en menú; selección separada de Rescatista/Defensivo y persistente. Clásico por defecto para usuarios existentes.
- [x] Escenarios clásicos y pruebas de regresión conservan calendario `waveSchedule` y victoria finita previa.
- [x] Director dinámico por 12 sectores de 200 unidades, generación a 82–170 unidades del jugador, límites globales/locales y cooldown por sector; se reciclan enemigos inactivos lejanos, no secuestradores con víctimas.
- [x] Flux respeta el límite global incluso al generar drones.
- [x] Objetivos de Rescatista en dinámico: todos los colonos `safe` o `lost`, al menos un `safe`; todos `lost` => derrota.
- [x] Objetivos de Defensivo en dinámico: reloj inicial 120 s (máximo 180) y umbral inicial 4/8 en Normal. Las capturas no consumadas siguen contando como colonos vivos; derrota anticipada al bajar del umbral.
- [x] Récords locales separados por sistema y misión, migrando los antiguos a Clásico sin borrarlos.
- [x] HUD monocromático ligeramente reducido y objetivos de tiempo/colonos visibles solo en modo Dinámico.
- [ ] Pruebas automáticas completas, evaluación perceptiva, dificultad y balance en máquina real.

**Importante:** los enemigos continúan apareciendo *durante la oleada*. Una oleada termina por el objetivo de la misión, no por la cantidad de enemigos; sigue habiendo un número finito de colonos y, en Defensivo, un reloj finito.
