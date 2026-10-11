# Licencias y posibilidad de distribuir Void Rescue II en Steam

## Qué licencia tiene esta versión

El **código original de Void Rescue II v1.0.0** se ofrece bajo **MIT**, con aviso de copyright en [LICENSE](../LICENSE). La licencia permite copiar, modificar, redistribuir, vender o regalar el código, siempre que se preserve el aviso de copyright y licencia.

La licencia MIT **no obliga a publicar nuevas modificaciones**, no prohíbe el uso comercial y es una de las licencias permisivas que Valve considera generalmente compatibles con Steamworks. La licencia no afecta tu derecho a distribuir tu propio juego gratuitamente.

**No es una cesión de propiedad intelectual:** sigues siendo titular de los derechos sobre tu trabajo. El permiso MIT es amplio y no exclusivo; los destinatarios que obtienen código bajo MIT pueden ejercer las libertades que concede esa licencia, incluido compartir versiones modificadas.

## Dependencias y materiales

El navegador ejecuta un juego hecho con **TypeScript y Three.js 0.185.1 (MIT)**; no contiene bibliotecas PySide6, PyQt ni Qt. La compilación utiliza herramientas npm con licencias separadas (Apache 2.0, MIT, MPL 2.0, ISC y BSD-3-Clause). Los avisos se detallan en [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

Hay una imagen en `references/stargate-title-reference.png` cuyo origen/licencia no se pudo verificar en esta revisión. **No se incluye en el paquete web**, ni se concede autorización para redistribuirla por el solo hecho de aparecer como referencia.

Esta comprobación distingue dependencias directas, paquetes de desarrollo y recursos referenciales; **no garantiza** que todo material externo que se incorpore en versiones futuras tenga derechos de redistribución. Toda edición futura debe reevaluar sus dependencias y recursos gráficos, musicales y tipográficos.

## ¿Podría publicarse gratis en Steam?

**Sí, en principio.** Steamworks documenta que MIT, BSD y Apache son licencias generalmente aceptables para distribuir proyectos que se integren con su SDK:

- [Steamworks: Distributing Open Source Applications on Steam](https://partner.steamgames.com/doc/sdk/uploading/distributing_opensource)
- [Steamworks: Steam Direct Fee](https://partner.steamgames.com/doc/gettingstarted/appfee)
- [Steamworks: Free To Play Games](https://partner.steamgames.com/doc/store/freetoplay)

Pero hay **dos trabajos adicionales**:

1. **Convertir la versión web en una aplicación instalable** para Windows y/o Linux, con una solución adecuada para ejecutar la interfaz web localmente y probarla en Steam. La Release v1.0.0 actual es **un sitio web estático**, no un ejecutable nativo ni un producto listo para SteamPipe. Un empaquetador futuro (por ejemplo, Tauri o Electron) traerá licencias y requisitos adicionales y requerirá otra auditoría antes de publicar.
2. **Completar el alta de Steamworks**, suministrar información comercial, fiscal y bancaria, pagar la tarifa **Steam Direct de 100 USD por aplicación incluso si se ofrece gratis**, crear la ficha, preparar el paquete, configurar las opciones de descarga gratuita y superar las revisiones correspondientes. La tarifa está sujeta a las condiciones de recuperación de Valve.

Si el juego es completamente gratuito para los jugadores, Steam admite el tipo **Free to Play**. No es obligatorio cobrar ni añadir monetización. La licencia MIT tampoco te obliga a poner el código en Steam: puedes publicar binarios/paquetes con los avisos de licencia y mantener el código fuente en GitHub.

**Importante:** poner la aplicación a disposición en Steam, integrar su SDK o firmar el Steam Distribution Agreement son decisiones separadas de poner el código bajo MIT. Debes confirmar las condiciones y licencias de la futura distribución que efectivamente prepares; en especial, evita introducir componentes con obligaciones incompatibles.

## Cierre de v1.0.0

- Sitio web: https://raulcamaracarreon.github.io/Void-Rescue-II/
- Código estable y etiqueta: https://github.com/raulcamaracarreon/Void-Rescue-II/releases/tag/v1.0.0
- Cambios: [CHANGELOG.md](../CHANGELOG.md)
- Dependencias: [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)

Una publicación gratuita en Steam sería un **trabajo nuevo de empaquetado, evaluación y distribución**, no una corrección necesaria para cerrar el desarrollo del navegador.

Este documento es una orientación técnica y de licencias, no asesoría legal formal.
