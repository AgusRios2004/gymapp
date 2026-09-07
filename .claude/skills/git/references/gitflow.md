# Git Flow — Referencia completa

Ideal para proyectos con ciclos de release formales, múltiples versiones en producción,
o equipos grandes que necesitan separar desarrollo de estabilización.

## Estructura de ramas

```
main        ← producción siempre estable, solo recibe merges de release y hotfix
develop     ← integración, acá van todas las features terminadas
 └── feature/nombre      ← trabajo diario
 └── release/v1.2.0      ← preparación de release (freezado de features)
 └── hotfix/fix-critico  ← fix urgente directo desde main
```

## Flujo de una feature

```bash
# Empezar feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nombre-feature

# ... trabajás ...

git add .
git commit -m "feat: descripción"

# Al terminar: merge a develop
git checkout develop
git merge --no-ff feature/nombre-feature -m "Merge feature/nombre-feature"
git push origin develop
git branch -d feature/nombre-feature
```

## Flujo de release

```bash
# Crear rama de release desde develop
git checkout develop
git checkout -b release/v1.2.0

# Solo fixes menores acá, no nuevas features
git commit -m "fix: ajuste antes del release"
git commit -m "chore: bump version to 1.2.0"

# Al aprobar: merge a main Y a develop
git checkout main
git merge --no-ff release/v1.2.0 -m "Release v1.2.0"
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.2.0 -m "Merge release v1.2.0 back to develop"
git push origin develop

git branch -d release/v1.2.0
```

## Flujo de hotfix (bug crítico en producción)

```bash
# Crear hotfix desde main (no desde develop)
git checkout main
git pull origin main
git checkout -b hotfix/fix-critico

git commit -m "fix: corregir error crítico en pagos"

# Merge a main Y a develop
git checkout main
git merge --no-ff hotfix/fix-critico -m "Hotfix: fix crítico en pagos"
git tag -a v1.2.1 -m "Hotfix version 1.2.1"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/fix-critico
git push origin develop

git branch -d hotfix/fix-critico
```

## ¿Git Flow o GitHub Flow?

| Criterio | GitHub Flow | Git Flow |
|----------|-------------|----------|
| Deploy continuo (CD) | ✅ Ideal | Complejo |
| Releases formales | Regular | ✅ Ideal |
| Equipo pequeño | ✅ Ideal | Overhead |
| Múltiples versiones activas | No | ✅ Ideal |
| Simplicidad | ✅ Simple | Más complejo |

**Recomendación**: empezá con GitHub Flow. Migrá a Git Flow solo si tenés releases formales con versionado semántico estricto.
