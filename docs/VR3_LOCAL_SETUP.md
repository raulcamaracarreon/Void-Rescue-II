# VR3 — verificación local y separación de repositorio

## Importante

La rama `feat/void-rescue-iii-bootstrap` está provisionalmente en el repositorio `raulcamaracarreon/Void-Rescue-II`. **No modificar la copia local de VR2 ni fusionar esta rama en `main` de VR2.**

## Primera verificación: clonar por separado

En Windows PowerShell, dentro de la carpeta donde guardarás los juegos:

```powershell
cd "E:\Proyectos\JUEGOS"
git clone --single-branch --branch feat/void-rescue-iii-bootstrap https://github.com/raulcamaracarreon/Void-Rescue-II.git VoidRescue-III
cd VoidRescue-III
git status --short --branch
npm ci
npm run build
npm run test
npx playwright install chromium
npx playwright test tests/e2e/landscape.spec.ts
npm run dev
```

Abrir `http://127.0.0.1:5173/`. El editor mejorado está en **Personalizar paisaje → Ambientes de las oleadas**. Probar orden numérico de arriba abajo en columna izquierda y luego derecha; mover paisaje 13 a posición 1; arrastrar; excluir y volver a incluir; cerrar y recargar.

No se afirma que estas verificaciones hayan pasado hasta ejecutarlas.

## Cuando se apruebe la verificación

Crear en GitHub un repositorio **vacío**, sin README, licencia o .gitignore preexistentes: `raulcamaracarreon/Void-Rescue-III`. No está creado automáticamente desde esta rama.

En la copia local VR3 (no VR2):

```powershell
cd "E:\Proyectos\JUEGOS\VoidRescue-III"
git remote -v
git remote rename origin vr2-origen
git remote add origin https://github.com/raulcamaracarreon/Void-Rescue-III.git
git branch -m main
git push -u origin main
```

Esto conserva los commits heredados y aísla la evolución futura. No se debe ejecutar el bloque hasta que el repositorio nuevo exista y el usuario autorice el traslado. Si se desea una historia de Git independiente/sin commits VR2, definir antes el procedimiento de migración.

## Control de publicación

Durante el arranque de VR3, Pages y verificación están en modo `workflow_dispatch` (manual). El release automático de VR2 fue retirado de la rama de VR3. La publicación web de VR3 requerirá su propio repositorio, nombre, URL y aprobación.
