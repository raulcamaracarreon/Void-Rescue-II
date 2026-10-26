> **ARCHIVO HISTÓRICO DE VOID RESCUE II.** Estas instrucciones se refieren al repositorio y sitio de VR2, no a la publicación del nuevo prototipo VR3. VR3 no dispone aún de repositorio ni sitio propios. Consulta [VR3_LOCAL_SETUP.md](VR3_LOCAL_SETUP.md) para trabajar con el prototipo. No uses este documento para publicar VR3.

# Publicar Void Rescue II en GitHub Pages

**Sitio objetivo:** https://raulcamaracarreon.github.io/Void-Rescue-II/

**Código publicado:** rama `main` del repositorio [Void-Rescue-II](https://github.com/raulcamaracarreon/Void-Rescue-II).

**Flujo:** [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml).

## Primera publicación

El workflow compila y publica automáticamente cada push a `main` y también ofrece ejecución manual. La activación inicial de GitHub Pages puede requerir una acción del administrador en el navegador:

1. Abre **[Settings → Pages](https://github.com/raulcamaracarreon/Void-Rescue-II/settings/pages)**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions** y guarda el cambio si se solicita.
3. Visita **[Actions → Publicar Void Rescue II en GitHub Pages](https://github.com/raulcamaracarreon/Void-Rescue-II/actions/workflows/deploy-pages.yml)**.
4. Si la publicación automática anterior falló porque Pages no estaba habilitado, pulsa **Run workflow**, selecciona la rama **main** y ejecútalo. No hace falta crear una rama `gh-pages` ni subir manualmente archivos.
5. Espera a que finalicen los trabajos **Compilar y comprobar** y **Publicar y verificar**. Ambos deben aparecer verdes.

Si **GitHub Actions** ya es el origen configurado, no modifiques esa preferencia; basta con comprobar el estado del workflow.

> El `GITHUB_TOKEN` integrado permite desplegar **a un sitio de Pages ya habilitado**, pero no siempre permite crear el sitio desde cero. Por eso **activar Pages desde Settings es el paso manual seguro**, no una tarea que se deba simular como completada.

## Qué publica

El workflow:

1. Descarga el commit de `main` con `actions/checkout`.
2. Instala Node.js 24 y ejecuta `npm ci`, `npm run typecheck` y `npm test`.
3. Ejecuta `npm run build` y verifica `dist/index.html`, `dist/icon.svg` y `dist/assets/`.
4. Escribe `dist/version.json` con el **SHA completo** del commit desplegado y la hora de compilación.
5. Publica **únicamente `dist/`** mediante `upload-pages-artifact` y `deploy-pages`.
6. Consulta el `version.json` del sitio público varias veces, para comprobar que corresponde al commit exacto de GitHub Actions.

El proyecto usa URLs de recursos **relativas** mediante `base: './'` en Vite, compatibles con `/Void-Rescue-II/`, el subdirectorio de Pages. No debe ponerse la ruta ni el enlace de **Void Rescue I** en el workflow de II.

## Verificar manualmente después de publicar

- **Juego:** [https://raulcamaracarreon.github.io/Void-Rescue-II/](https://raulcamaracarreon.github.io/Void-Rescue-II/)
- **Identificador:** [https://raulcamaracarreon.github.io/Void-Rescue-II/version.json](https://raulcamaracarreon.github.io/Void-Rescue-II/version.json)
- **Ejecuciones:** [GitHub Actions – publicación](https://github.com/raulcamaracarreon/Void-Rescue-II/actions/workflows/deploy-pages.yml)

`version.json` debe devolver algo como:

~~~json
{
  "commit": "SHA_COMPLETO_DEL_COMMIT_DE_MAIN",
  "builtAt": "FECHA_Y_HORA_UTC"
}
~~~

Compara el valor `commit` con el SHA de la ejecución que acaba de publicar. **No basta con que el workflow de compilación pase**: la publicación debe finalizar y el sitio debe servir ese mismo SHA.

En el juego publicado, comprueba la portada, los modos **Clásico / Dinámico**, **Rescatista / Defensivo**, los 13 paisajes, el editor y al menos un rescate con haz mantenido. Estas comprobaciones humanas complementan las pruebas automáticas.

## Problemas comunes

| Síntoma | Qué revisar |
| --- | --- |
| **404** en la página nueva | Habilitar Pages con **Settings → Pages → Source: GitHub Actions** y volver a ejecutar el workflow. El primer despliegue puede tardar en propagarse. |
| Falla **Configure GitHub Pages** por 404 | No está habilitado el sitio o la configuración de Pages no permite la publicación por Actions. |
| Falla la publicación por permisos | Confirmar los permisos del workflow (`pages: write`, `id-token: write`) y las restricciones del entorno `github-pages`. |
| Falla **Compilar y comprobar** | Inspeccionar el error real de `npm ci`, TypeScript, Vitest o build. No publicar `dist/` antiguos como solución. |
| Página blanca o recursos 404 | Verificar `vite.config.ts` (`base: './'`), `index.html` y que `dist/assets/` esté presente. |
| La página abre pero muestra una versión antigua | Comparar `version.json` con el SHA de `main`; recargar sin caché. El workflow comprueba esta igualdad automáticamente. |
| No aparecen mis récords o paisajes creados en localhost | Son datos de **almacenamiento local por origen**. Pages y `http://127.0.0.1:5173` no comparten datos. Tampoco se transfieren entre navegadores. |

## Archivos y mantenimiento

- **[README](../README.md)**: descripción vigente del juego y enlace para jugar en línea.
- **[Workflow de Pages](../.github/workflows/deploy-pages.yml)**: despliegue automatizado desde `main`.
- **[Workflow de pruebas](../.github/workflows/verify.yml)**: pruebas de PR, independiente del despliegue.
- **[Vite](../vite.config.ts)**: configuración del sitio estático.
- **[README histórico](README_HISTORICO.md)**: información heredada, no usar para la dirección pública actual.

La publicación de Void Rescue II es **independiente de Void Rescue I**. Nunca modifiques el workflow de I para actualizar II.
