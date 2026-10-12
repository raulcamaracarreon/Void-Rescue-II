# Historial de cambios — Void Rescue II

Este historial documenta las versiones oficiales de **Void Rescue II**. El desarrollo activo terminó con **v1.0.0**; las versiones posteriores son actualizaciones de mantenimiento.

## [v1.0.4] — 11 de octubre de 2026

- Reajustado el tono del motor de la nave tras probar la afinación grave de v1.0.3: el oscilador continuo ahora alcanza **300 Hz** a máxima velocidad y empuje, frente a 151 Hz en v1.0.3 y unos 604 Hz en el motor original.
- En marcha lenta, el tono comienza en 155 Hz y sube gradualmente con velocidad/empuje; mantiene el oscilador grave, el volumen y los efectos de combate sin modificaciones.
- Pruebas unitarias actualizadas para el nuevo rango y límites de frecuencia.

## [v1.0.3] — 11 de octubre de 2026

- Motor de la nave menos agudo durante el vuelo: la capa continua que antes llegaba aproximadamente a **600 Hz (D5)** alcanza ahora unos **150 Hz (D3)** con velocidad y empuje máximos.
- Se conserva la modulación del tono por velocidad y aceleración y la base grave de la turbina; los disparos, impactos y explosiones no cambian.
- Pruebas unitarias para el rango de frecuencias del motor.
- Actualización de mantenimiento; sin cambios a la jugabilidad, misiones, paisajes ni protocolos de rescate.

## [v1.0.2] — 11 de octubre de 2026

- Nuevos **protocolos de rescate** independientes de la dificultad: Realista (reglas originales), Protegido (supervivencia de pasajeros expulsados al impactar) y Segunda oportunidad (reaparecer en el lugar del accidente después de 0.5 s, con escudo temporal habitual).
- Selector en el menú inicial con explicación y preferencia persistente. El protocolo se fija por partida para impedir cambiar de reglas a mitad de vuelo.
- Récords separados por protocolo, además de sistema de enemigos y misión; compatibilidad con récords previos asignados al modo Realista.
- Pruebas unitarias y de navegador para supervivencia, ubicación de reaparición y almacenamiento.

## [v1.0.1] — 11 de octubre de 2026

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
