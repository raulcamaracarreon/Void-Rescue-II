# VOID RESCUE II

**Versión oficial estable: [v1.0.1](https://github.com/raulcamaracarreon/Void-Rescue-II/releases/tag/v1.0.1) · Licencia [MIT](LICENSE) · Estado: mantenimiento (desarrollo activo cerrado).**

**Arcade espacial 2.5D de combate, defensa y rescate**, para jugar desde el navegador o en tu computadora. Pilota una nave sobre un planeta circular, protege y evacúa colonos, afronta oleadas de amenazas y descubre paisajes procedurales con paralaje.

### ▶ [JUGAR VOID RESCUE II EN LÍNEA](https://raulcamaracarreon.github.io/Void-Rescue-II/)

**[GitHub Releases v1.0.1](https://github.com/raulcamaracarreon/Void-Rescue-II/releases/tag/v1.0.1)** · **[Historial de cambios](CHANGELOG.md)** · **[Código](https://github.com/raulcamaracarreon/Void-Rescue-II)** · **[Publicación web](https://github.com/raulcamaracarreon/Void-Rescue-II/actions/workflows/deploy-pages.yml)** · **[Guía de Pages](docs/DEPLOYMENT.md)**

No requiere instalar el juego para jugar en línea. Funciona en navegadores modernos con **WebGPU** o **WebGL2** de respaldo. La URL corresponde **a Void Rescue II**, no al juego original. Si la página aún no abre, consulta la [activación inicial de GitHub Pages](docs/DEPLOYMENT.md#primera-publicación).

> **Proyecto independiente:** Void Rescue II se desarrolló a partir de [Void Rescue I](https://github.com/raulcamaracarreon/Void-Rescue-I), sin modificarlo. El generador visual toma como referencia [Landscape Generator — Parallax](https://github.com/raulcamaracarreon/Landscape-Generator-Parallax). Ambos proyectos originales conservan sus repositorios.

## Qué incluye Void Rescue II

- **Dos sistemas de enemigos independientes:** *Clásico* (apariciones programadas y finitas por oleada) y *Dinámico por zonas* (amenazas recurrentes, cooldown por sector y límites de enemigos simultáneos). **Clásico** es la opción predeterminada.
- **Dos misiones:** *Rescatista* (evacuar colonos a Fortaleza 01) y *Defensivo* (proteger la colonia), seleccionables con cualquiera de los sistemas de enemigos.
- **Rescate con haz de abducción:** mantén **E** o **Y/△** para elevar gradualmente un colono. Al llegar a tu nave, entra en ella; puedes **transportar hasta ocho colonos a la vez** y entregarlos juntos. El HUD indica **A BORDO**.
- **13 paisajes predefinidos con paralaje**, gradientes automáticos y editor avanzado, además de **hasta 100 paisajes personalizados guardados con nombre**.
- **Rotación de mundos por oleada:** combina estilos incluidos y personales, marca cuáles participan y elige orden **secuencial** o **aleatorio sin repetición** por tanda, reproducible con la semilla.
- **HUD flotante adaptativo:** texto de un solo color sólido elegido por contraste con el cielo, sin tarjetas, contornos ni sombras. **Láser del jugador** verde fosforescente o de color complementario si el paisaje requiere más contraste.
- **Explosiones de naves adaptables al cielo:** chispas y destellos adoptan automáticamente el color complementario de contraste usado por el HUD, también en paisajes personalizados y durante la rotación de mundos.
- **Escenario circular**, colisiones con terreno, estrellas y luna opcionales, distintas familias de naves enemigas, radar panorámico, bombas, portal, audio y efectos.
- **Mando USB/gamepad configurable**, teclado, pausa, pantalla completa, seis dificultades, récords y progreso por oleadas.

## Elegir la partida

Antes de **INICIAR VUELO**, escoge un sistema de enemigos, una misión y una dificultad. Estos tres ajustes son independientes.

| Sistema | Aparición de enemigos | Fin de la oleada |
| --- | --- | --- |
| **Clásico** | Calendario finito de enemigos, creciente con la oleada | Reglas heredadas de Void Rescue I: resolver amenazas y rescates pendientes |
| **Dinámico por zonas** | Aparecen enemigos cerca de la región explorada, con límites de población y descansos entre apariciones | Se cumple el objetivo de Rescatista o Defensivo, **aunque aún haya enemigos activos** |

### Objetivos con enemigos dinámicos

- **Rescatista:** la oleada termina cuando **todos** los colonos están **a salvo o definitivamente perdidos**. Hay victoria si **al menos uno** fue entregado a salvo; perderlos a todos es derrota.
- **Defensivo:** sobrevive el tiempo establecido y conserva un mínimo de colonos vivos. En la primera oleada y dificultad **Normal**: **120 segundos** y **al menos 4 de 8** colonos. El tiempo y el mínimo pueden cambiar según la oleada o la dificultad.

Las oleadas continúan mientras superes sus objetivos. La puntuación, las naves y las bombas siguen la progresión propia de la partida; los **récords se separan por sistema y misión** para que sean comparables.

### Rescatista: recoger varios colonos

1. Sitúa la nave por encima de un colono en tierra.
2. **Mantén E** (o **Y/△** en gamepad): el haz lo eleva a velocidad constante. Si sueltas el botón antes de terminar, la extracción se interrumpe.
3. Al llegar a la nave, el colono **entra a bordo**. El contador muestra, por ejemplo, **A BORDO 3/8**.
4. Continúa recogiendo colonos durante el mismo vuelo; no es necesario volver a la fortaleza después de cada uno.
5. Para entregarlos, aterriza lentamente en **Fortaleza 01**; todos los pasajeros a bordo se registran a salvo simultáneamente.

Si la nave es destruida, los pasajeros son liberados y caen; pueden recuperarse según la física de caída y rescate. En **Defensivo** se conserva la captura y entrega de colonos en caída.

## Paisajes procedurales y biblioteca

Los 13 estilos incluidos son:

| | | |
| --- | --- | --- |
| Noche estelar | Ciudad abandonada | Ocaso alienígena |
| Mundo glacial | Mundo volcánico | Pantano tóxico |
| Desierto de cobre | Metrópolis neón | Mundo de cenizas |
| Planeta amatista | **Ocaso Marciano** | **Nublado Polar** |
| **Planeta extraño** | | |

Los tres últimos destacados surgieron de referencias de color aportadas durante el diseño. El fondo contiene varias capas de montañas y/o edificios con desplazamiento **paralaje**.

Abre **PERSONALIZAR PAISAJE** desde el título o la pausa:

- **Automático (dos colores):** elige color del cielo y de la capa más cercana, cantidad de capas (**2 a 10**) y composición. Las capas intermedias forman el gradiente automáticamente.
- **Avanzado (por capa):** configura por separado el tipo, el color, la amplitud y el detalle. También puedes ajustar semillas, estrellas y luna.
- **Mi biblioteca:** **Guardar nuevo**, **Guardar cambios**, **Duplicar**, **Renombrar** o **Eliminar** mundos con nombre. Los presets originales permanecen intactos. Admite **hasta 100 paisajes personales**.
- **Ambientes de las oleadas:** marca los paisajes (predefinidos o guardados) que quieres incluir, cambia su orden y elige rotación **Secuencial** o **Aleatoria sin repeticiones**. Pueden participar **hasta 113 ambientes** si guardas los 100 personales y seleccionas los 13 originales.

Los paisajes personales conservan sus capas y modo de edición. Los datos del editor anterior se migran para mantener el borrador personalizado que ya tuvieras.

## Controles

| Acción | Teclado | Gamepad (Xbox / PlayStation) |
| --- | --- | --- |
| Pilotar | WASD o flechas | Stick izquierdo / cruceta |
| Disparar (mantener para repetir) | Espacio | A / × |
| Bomba inteligente | Shift | X / □ |
| Haz de rescate (mantener) / portal | E | Y / △ |
| Pausar / continuar | Esc | Start / Options |
| Reiniciar | R | Menú de pausa |
| Silenciar | M | Botón del HUD / pausa |
| Diagnóstico de rendimiento | F3 | — |
| Menús y confirmación | Ratón, Tab y Enter | Stick / cruceta y confirmar |

**CONFIGURAR MANDO USB**, disponible en título y pausa, permite revisar las señales del dispositivo y calibrar sus direcciones y botones. La detección del mando depende del navegador; puede requerir una primera pulsación.

## Jugar localmente o desarrollar

Se necesita **Node.js 22.12 o posterior** (usamos Node 24 en las pruebas automatizadas) y npm.

~~~powershell
git clone https://github.com/raulcamaracarreon/Void-Rescue-II.git
cd Void-Rescue-II
npm ci
npm run dev
~~~

Abre **http://127.0.0.1:5173/**. Detén el servidor con **Ctrl+C**.

Para actualizar una copia ya clonada:

~~~powershell
git switch main
git pull origin main
npm ci
npm run dev
~~~

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor local Vite |
| `npm run typecheck` | Verificación TypeScript |
| `npm test` | Pruebas unitarias Vitest |
| `npm run build` | Genera la versión estática en `dist/` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run test:e2e` | Pruebas de navegador Playwright |
| `npm run test:production` | Comprobaciones de producción con navegador y servidor de vista previa |

Motor **Three.js 0.185.1**, **TypeScript 7**, **Vite 8**, simulación de paso fijo y renderizado **WebGPU con respaldo WebGL2**. Código organizado en `src/game/` (simulación, oleadas, IA y rescates), `src/render/` (escena), `src/landscape/` (paletas y rotación), `src/ui/` (interfaz), `src/input/` (controles) y `tests/`.

### Guardado y privacidad

La configuración, la biblioteca de paisajes, las calibraciones de controles y los récords se guardan en el **almacenamiento local del navegador**. No hay cuentas de usuario, servidor de partidas ni clasificación mundial compartida. **El almacenamiento de la versión en línea y el de localhost son independientes**, por lo que los paisajes que creaste en localhost no aparecerán automáticamente en Pages; tampoco se sincronizan entre navegadores o dispositivos. Evita borrar los datos del sitio si quieres conservar tus mundos. Actualmente no existe una exportación/importación automática de la biblioteca.

## Publicación en GitHub Pages

Cada push a **`main`** ejecuta el flujo **[Publicar Void Rescue II en GitHub Pages](.github/workflows/deploy-pages.yml)**, que instala dependencias, verifica TypeScript y pruebas unitarias, construye `dist/`, publica el sitio y comprueba el **SHA del commit realmente visible** mediante `version.json`.

**Dirección pública:** https://raulcamaracarreon.github.io/Void-Rescue-II/

Si es la primera publicación, se debe activar una vez **Settings → Pages → Build and deployment → GitHub Actions**; después el despliegue queda automatizado. Los detalles, la comprobación del estado de publicación y la solución de problemas están en **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**. Para consultar qué código está en línea, abre **[version.json](https://raulcamaracarreon.github.io/Void-Rescue-II/version.json)**.

## Historia, documentación y créditos

Void Rescue II conserva el motor de vuelo, combate y rescate iniciado en **[Void Rescue I](https://github.com/raulcamaracarreon/Void-Rescue-I)**. La versión II incorpora:

- Paisajes procedurales con editor de colores y capas, gradientes y paralaje (PR #3, #4).
- Contraste adaptable del HUD y láser, corrección de los giros bruscos enemigos y luna (PR #6–#9).
- Sistemas de enemigos **Clásico / Dinámico**, misiones independientes y récords por modalidad (PR #10).
- Haz mantenido y recogida **múltiple de hasta ocho colonos** (PR #11).
- **13 presets**, biblioteca propia y lista de paisajes para las oleadas (PR #12).
- Publicación independiente en **GitHub Pages** y este manual actualizado.

El sistema de paisajes toma como antecedente el proyecto propio **[Landscape Generator — Parallax](https://github.com/raulcamaracarreon/Landscape-Generator-Parallax)**. Las bibliotecas externas mantienen sus licencias correspondientes.

Documentos: **[hoja de ruta](docs/VOID_RESCUE_II_ROADMAP.md)** · **[arquitectura](docs/TECHNICAL_ARCHITECTURE.md)** · **[dirección artística](docs/ART_DIRECTION.md)** · **[README histórico](docs/README_HISTORICO.md)**.

## Licencia, descargas y futuro de Steam

El **código original de Void Rescue II v1.0.0** se distribuye bajo **[MIT](LICENSE)** (© 2026 Raúl Héctor Cámara Carreón): se permite jugar, estudiar, copiar, modificar y compartir el código gratuitamente, conservando los avisos de autoría y licencia.

- **[GitHub Release v1.0.0](https://github.com/raulcamaracarreon/Void-Rescue-II/releases/tag/v1.0.0):** etiqueta estable, código fuente y un ZIP del **sitio web compilado**. El ZIP necesita un servidor HTTP local o un alojamiento web; **no es un instalador ni un juego ejecutable para Steam**.
- **[Licencias de terceros](THIRD_PARTY_NOTICES.md):** Three.js (MIT) y herramientas de desarrollo con licencias propias. Los materiales de referencia externos no se relicencian automáticamente.
- **[MIT y posible Steam gratuito](docs/LICENSING_AND_STEAM.md):** la licencia MIT es generalmente compatible con Steamworks. Steam tiene una tarifa **Steam Direct de 100 USD por aplicación, incluso si el juego es gratuito**, y requiere crear y revisar una aplicación instalable por separado.
- **[Cambios v1.0.0 y cierre](CHANGELOG.md):** resumen del desarrollo y versión estable.

**Estado:** **v1.0.0 publicada como versión estable del proyecto**, con desarrollo activo cerrado. No se archiva GitHub para que continúen funcionando el despliegue y las futuras correcciones puntuales. La versión en línea sigue disponible; las mejoras nuevas, una compilación de escritorio o la publicación en Steam serían proyectos posteriores separados.
