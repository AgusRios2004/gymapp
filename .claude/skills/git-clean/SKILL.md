---
name: git-clean
description: >
  Limpia las ramas locales obsoletas del repositorio: las huérfanas (cuyo tracking remoto
  ya no existe, marcadas como ": gone]") y las ya mergeadas a la rama de integración
  (develop/main), protegiendo siempre main/master/develop. Disparar cuando el usuario diga
  "/git-clean", "limpiá las ramas", "borrá las ramas viejas", "limpiar ramas mergeadas" o
  "limpiar el repo".
---

# Git Clean (git-clean)

Limpia el repositorio local eliminando ramas huérfanas (cuyo tracking remoto ya fue borrado)
o ramas locales ya fusionadas a la rama de integración (`develop` o `main`).

## Flujo obligatorio

1. **Sincronizar con el remoto**
   ```bash
   git fetch --prune
   ```
   Actualiza referencias remotas y limpia el tracking de ramas borradas en el remoto.

2. **Detectar y limpiar**
   - **Ramas huérfanas (gone)** — tracking remoto ya no existe:
     ```bash
     git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -d
     ```
   - **Ramas mergeadas** — protegiendo `main`, `master`, `develop`:
     ```bash
     git branch --merged | grep -v -E "(^\*|master|main|develop)" | xargs -r git branch -d
     ```

3. **Reportar acciones**
   - Listá qué ramas se eliminaron con éxito.
   - Si alguna no pudo borrarse por tener cambios sin mergear (`git branch -d` falla
     intencionalmente protegiendo el trabajo), indicalo claramente y NO fuerces con `-D`
     sin confirmación explícita del usuario.

## Regla de seguridad

Nunca uses `git branch -D` (borrado forzado) automáticamente. Si una rama no está mergeada,
avisá y esperá confirmación.
