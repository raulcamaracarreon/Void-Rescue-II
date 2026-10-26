# VOID RESCUE III — visión y ruta de desarrollo

## Norte del proyecto

Evolucionar Void Rescue II hacia un arcade de rescate 2.5D donde el usuario pueda combinar vehículos, familias de enemigos, reglas de misión y ambientes. Conservar primero la experiencia jugable actual; ampliar con cambios aislados, reversibles y probables.

## Principios acordados

1. VR2 se conserva publicado como v1.0.5, independiente. VR3 utiliza un repositorio propio después de validar su prototipo.
2. Mantener en la base la simulación, navegación, colisiones, comportamiento de enemigos, controles y oleadas; no copiar sólo los gráficos.
3. El editor permitirá ordenar rápidamente ambientes y leerlos en dos columnas **de arriba abajo en la izquierda, luego de arriba abajo en la derecha**.
4. Las capas de primer plano serán **opcionales**; podrán mostrar siluetas de árboles, rejas, cercas, edificios y otros objetos y podrán tapar visualmente al vehículo sin alterar las reglas del mundo físico.
5. Se podrá editar el contenido visual sin programar: figuras geométricas, trazos, polígonos y siluetas, selección, copia, reordenamiento, color, opacidad, posición, escala y control de paralaje.
6. Reservar JSON versionado para diseños exportables y portables; mantener datos de VR3 separados de las claves locales de VR2.

## Fases e hitos de aceptación

### 0. Arranque independiente (en marcha)

- [x] Crear rama provisional partiendo de la mejora del editor de paisajes.
- [x] Nombre y versión de prototipo propios; claves de almacenamiento nuevas.
- [x] Eliminar el workflow de releases exclusivo de VR2 y hacer manuales los demás workflows.
- [ ] Construir y ejecutar pruebas locales; verificar que nada de VR2 cambió.
- [ ] Crear repositorio **Void-Rescue-III** y trasladar el desarrollo a su `main` tras validación.

### 1. Editor de rotación (implementado, pendiente de pruebas)

- [x] Separar ambientes activos y excluidos.
- [x] Numerar y distribuir activos en dos columnas de flujo vertical.
- [x] Permitir arrastrar y colocar entre columnas; conservar ↑ ↓ y ofrecer posición exacta/inicio/final.
- [ ] Comprobar vista estrecha, teclado, puntero y casos de biblioteca extensa.
- [ ] Probar recarga, selección secuencial vs aleatoria y preservación de paisajes personalizados.

### 2. Motor visual por capas (pendiente)

- Capas: cielo, fondo distante, fondo cercano, mundo jugable y primer plano opcional.
- Distinguir capas puramente gráficas de `Terrain` y de las colisiones de entidades.
- Conservar oclusión, escala, orden de dibujo y desplazamiento relativo configurables.
- Aceptación: alternar una capa de rejas/árboles sin alterar impactos, rescates ni avance de oleada.

### 3. Editor de elementos y exportación (pendiente)

- Rectángulo, línea, polígono, dibujo libre y composición de siluetas.
- Selección, transformación, color/opacidad, duplicar, deshacer/rehacer, mostrar/ocultar.
- Guardar/cargar de forma segura con validación y versión; exportar/importar JSON; evitar inyección HTML de nombres.
- Aceptación: diseñar una cerca y un grupo de árboles sin editar código, guardarlos y recuperarlos.

### 4. Vehículos y perfiles de movimiento (pendiente)

- Un contrato común de vehículo (modelo visual, movimiento, armas, capacidad, sonido, acciones).
- Primer perfil alternativo: helicóptero de rescate con parámetros propios de ascenso, descenso, inercia y recogida.
- Mantener intacta la nave de VR2 como perfil de regresión hasta alcanzar paridad.
- Aceptación: mismo objetivo jugable con una nave o un helicóptero sin duplicar el sistema de puntuación/oleadas.

### 5. Nuevas entidades, familias de enemigos y escenarios (pendiente)

- Helicópteros enemigos, drones, aviones y defensas terrestres como familias configurables.
- Colonos y soldados de rescate como variaciones visuales/funcionales justificadas.
- Ambientes temáticos: selva, desierto, costa, montaña, ciudad, industria y variantes futuristas.
- Aceptación: escenario completo con helicóptero, soldados, tres amenazas distintas y paisaje con primer plano opcional.

## Decisiones abiertas

La edición de primer plano puede comenzar con objetos vectoriales 2D extruidos/representados en Three.js, sin incorporar un editor complejo o un motor externo. Antes de pasar a la fase 4 se validará con el usuario si prefiere *variantes dentro de un mismo juego* o modos/episodios separados.

## Calidad

No declarar una fase terminada por compilar: ejecutar TypeScript, unitarias, E2E Playwright (WebGPU y WebGL2 cuando estén disponibles), comprobar visualmente el panel y confirmar persistencia. Documentar fallos o pruebas no ejecutadas sin suponer resultados.
