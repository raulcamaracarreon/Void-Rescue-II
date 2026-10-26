# VOID RESCUE III — prototipo de evolución 2.5D

**Estado: fase inicial (v0.1.0, NO publicada).** Base heredada de [Void Rescue II](https://github.com/raulcamaracarreon/Void-Rescue-II), bajo licencia MIT. La versión oficial de Void Rescue II permanece independiente e inalterada.

> **Aún no es el juego nuevo completo.** En esta fase se conserva la jugabilidad espacial de VR2 y se incorpora el editor de rotación de ambientes mejorado. La selección de helicópteros, los nuevos enemigos y el editor de dibujo/capas de primer plano son características **planificadas, no implementadas**.

## Qué funciona como base

- Simulación 2.5D existente: mundo horizontal circular, cámara, controles, combate, recogida y rescate, oleadas, récords y modos de dificultad.
- Editor de paisajes procedurales (13 estilos incluidos y biblioteca personal de hasta 100 ambientes).
- Propuesta de mejora de rotación: ambientes activos primero; dos columnas leídas de arriba hacia abajo; numeración, arrastrar, subir/bajar y mover al inicio, final o a una posición determinada.
- Almacenamiento exclusivo para VR3: `void-rescue-iii.landscape.v1`, `void-rescue-iii.preferences.v1`, `void-rescue-iii.records.v1` y `void-rescue-iii.pilot.v1`.
- Nombre, metadatos HTML y paquete npm renombrados para distinguir el prototipo.

La mejora del editor y la identidad deben **probarse localmente antes de considerarlas estables**. No hay publicación de VR3 en Pages ni lanzamiento oficial.

## Ejecución local

Requiere Node.js 22.12 o superior.

```powershell
npm ci
npm run build
npm run test
npx playwright test tests/e2e/landscape.spec.ts
npm run dev
```

Acceso local: http://127.0.0.1:5173/

La prueba Playwright requiere tener instalado su navegador. Si no está disponible: `npx playwright install chromium`.

## Dirección del nuevo juego

VR3 evolucionará hacia un **arcade de rescate con vehículos y mundos configurables**. Un helicóptero de rescate y soldados, amenazas como drones, helicópteros y aviones, terrenos de selva/desierto/ciudad y capas decorativas opcionales que pueden superponerse al vehículo son ejemplos priorizados para los siguientes incrementos.

No se sustituirán el núcleo de simulación, la física ni las reglas probadas sin una migración incremental. Los elementos gráficos con oclusión de primer plano estarán separados del terreno y sus colisiones.

## Documentación VR3

- [Visión y ruta de desarrollo](docs/VR3_ROADMAP.md).
- [Arquitectura objetivo](docs/VR3_ARCHITECTURE.md).
- [Prueba local y futura separación en repositorio propio](docs/VR3_LOCAL_SETUP.md).
- [README histórico de la base VR2](docs/README_VR2_BASE.md).

**Automatizaciones:** los workflows de validación y Pages quedan manuales durante la etapa de prototipo; el workflow de releases exclusivo de VR2 no se incluye. No crear tags de versión VR2 desde esta rama.

**Importante:** hasta disponer de un repositorio remoto independiente, esta preparación reside provisionalmente en `feat/void-rescue-iii-bootstrap` del repositorio de VR2. No fusionar esa rama hacia la rama `main` de VR2.
