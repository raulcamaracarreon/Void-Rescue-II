# Avisos de licencias de terceros — Void Rescue II v1.0.0

**Licencia del código propio:** [MIT](LICENSE). Los materiales de terceros mantienen sus licencias originales.

## Dependencia incluida en el juego

**Three.js 0.185.1** — MIT  
Autores: © 2010–2026 three.js authors  
Código: https://github.com/mrdoob/three.js  
Licencia original: https://github.com/mrdoob/three.js/blob/r185/LICENSE

El código compilado del juego incluye Three.js. Se reproduce a continuación su licencia, que no debe eliminarse en una redistribución.

> The MIT License
>
> Copyright © 2010-2026 three.js authors
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
> OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.

## Herramientas de compilación y pruebas

Estas herramientas se instalan desde npm para desarrollar, compilar o probar; **no son el código original del videojuego ni se relicencian bajo MIT**. Las licencias concretas de cada versión están identificadas en `package-lock.json` y en los paquetes npm:

| Componente | Versión fijada | Licencia |
| --- | --- | --- |
| TypeScript | 7.0.2 | Apache-2.0 |
| Playwright / @playwright/test | 1.62.0 | Apache-2.0 |
| Vite | 8.2.2 | MIT |
| Vitest | 5.0.0 | MIT |
| lightningcss y variantes de plataforma (transitivas) | Según lockfile | MPL-2.0 |
| Paquetes transitivos | Según lockfile | MIT, Apache-2.0, MPL-2.0, ISC o BSD-3-Clause |

La licencia de cada herramienta sigue siendo la de su paquete. Si un distribuidor añade nuevos paquetes, modifica la cadena de compilación o empaqueta `node_modules` junto al juego, debe revisar los avisos correspondientes y cumplir las obligaciones de las licencias de lo que efectivamente distribuya.

## Material de referencia

El archivo `references/stargate-title-reference.png` se mantiene solo como referencia de diseño en el repositorio. No se incluye en el paquete web `dist/`, ni se afirma que su licencia sea MIT: sus posibles derechos de terceros deben verificarse antes de reutilizarlo fuera de su función de referencia.

Las capturas de `docs/screenshots/` documentan el juego; las imágenes y logotipos ajenos que pudieran aparecer en material de referencia no pasan a estar licenciados bajo MIT por aparecer en este repositorio.

**Void Rescue II no usa PySide6, PyQt ni Qt**; ninguna dependencia Qt/LGPL está incluida en la aplicación web actual.

Este archivo documenta las licencias conocidas del conjunto revisado, no sustituye una auditoría legal de futuras compilaciones para otras plataformas.
