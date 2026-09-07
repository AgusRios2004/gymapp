---
name: git
description: >
  Experto en Git y flujos de trabajo con control de versiones. BLOQUEANTE: invocá esta skill
  ANTES de ejecutar cualquier comando de git, aunque el pedido parezca trivial o de una sola
  línea. Disparála SIEMPRE que el usuario pida una ACCIÓN de git con verbos como: "crear branch",
  "crear rama", "hacer commit", "commitear", "hacé un commit", "pushear", "hacer push", "mergear",
  "hacer merge", "rebasear", "hacer rebase", "stashear", "crear tag", "hacer release",
  "resolver conflictos", "deshacer", "revertir", "amend", "cherry-pick". También cuando mencione
  git, ramas, commits, merge, rebase, conflictos, pull requests, releases, tags, stash, historial,
  repositorios, GitHub, GitLab, o pregunte cómo organizar su código, colaborar en equipo o deshacer
  cambios. NO ejecutes git a mano sin pasar por esta skill: cubre Git Flow, GitHub Flow, conventional
  commits (incluida la prohibición de líneas de autoría AI), resolución de conflictos y releases.
---

# Skill: Git — Flujos de trabajo, ramas y commits

## Rol y comportamiento

Sos un experto en Git con años de experiencia en proyectos personales y colaborativos.
Tu objetivo es guiar al usuario con comandos exactos, explicaciones claras y buenas prácticas.
Siempre dás el comando completo listo para copiar y pegar, con una explicación breve de qué hace.
Cuando hay varias opciones, explicás cuándo usar cada una.

---

## Flujo de trabajo principal: Git Flow

Es el flujo que ya usa gymapp (`main`, `develop`, `feature/*` sobre GitHub:
`git@github.com:AgusRios2004/gymapp.git`): disciplina y claridad sin el overhead de equipos grandes.

```
main        ← código estable, listo para usar/mostrar
develop     ← integración de features terminadas
 └── feature/nombre      ← trabajo diario en nuevas funciones
 └── hotfix/fix-critico  ← fix urgente directo desde main
 └── release/v1.0.0      ← (opcional) si querés versionar formalmente
```

### Ciclo diario de una feature

```bash
# 1. Siempre partís desde develop actualizado
git checkout develop
git pull origin develop         # si tenés remote
git checkout -b feature/nombre-descriptivo

# 2. Trabajás con commits frecuentes y descriptivos
git add .
git commit -m "feat: descripción clara del cambio"

# 3. Al terminar, mergeás a develop
git checkout develop
git merge --no-ff feature/nombre-descriptivo -m "Merge feature/nombre-descriptivo"
git branch -d feature/nombre-descriptivo   # limpieza
```

> 💡 **En gymapp**: las features se integran a `develop` y `main` recibe lo estable. Podés trabajar
> local y pushear solo lo que quieras respaldar, pero si la feature va a PR, pusheá la rama.

### Ver `references/gitflow.md` para: hotfix, releases y diagrama completo del flujo.

---

## Convención de commits (Conventional Commits)

Formato: `tipo(scope opcional): descripción en minúsculas`

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Formato, sin cambio de lógica |
| `refactor` | Refactorización sin nueva feature ni fix |
| `test` | Agregar o corregir tests |
| `chore` | Tareas de mantenimiento, deps, configs |
| `perf` | Mejoras de performance |
| `ci` | Cambios en CI/CD |

**Ejemplos buenos:**
```
feat(auth): agregar login con Google OAuth
fix(api): corregir timeout en endpoint de pagos
docs: actualizar README con instrucciones de instalación
chore: actualizar dependencias a versiones más recientes
refactor(user): extraer lógica de validación a servicio separado
```

**Nunca agregar** líneas de autoría de herramientas AI en los commits. Está prohibido incluir cualquier cosa como:
```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```
Los commits deben reflejar solo la autoría real del desarrollador.

**Commits con breaking change:**
```
feat!: cambiar formato de respuesta de la API
# o con cuerpo:
feat(api): nuevo sistema de autenticación

BREAKING CHANGE: el header Authorization ahora requiere formato Bearer
```

---

## Operaciones cotidianas

### Guardar trabajo en progreso
```bash
git stash                        # guarda cambios sin commitear
git stash push -m "descripción" # con nombre descriptivo
git stash list                   # ver todos los stashes
git stash pop                    # recuperar el último stash
git stash apply stash@{2}        # recuperar uno específico
```

### Actualizar rama con los últimos cambios de main
```bash
# Opción 1: rebase (historial limpio, recomendado)
git checkout feature/mi-feature
git fetch origin
git rebase origin/main

# Opción 2: merge (más seguro si no sabés qué es rebase)
git checkout feature/mi-feature
git merge main
```

### Ver estado e historial
```bash
git status                       # qué está cambiado
git log --oneline --graph        # historial visual compacto
git log --oneline -10            # últimos 10 commits
git diff                         # cambios no staged
git diff --staged                # cambios ya en staging
```

---

## Resolver conflictos de merge

Cuando Git dice "CONFLICT":

```bash
# 1. Ver qué archivos tienen conflicto
git status

# 2. Abrí el archivo — vas a ver esto:
# <<<<<<< HEAD
# tu código actual
# =======
# código de la otra rama
# >>>>>>> feature/otra-rama

# 3. Editá el archivo manualmente dejando lo correcto

# 4. Marcá como resuelto
git add archivo-con-conflicto.js

# 5. Continuá el merge o rebase
git merge --continue
# o si estabas en rebase:
git rebase --continue

# Para ABORTAR y volver al estado anterior:
git merge --abort
git rebase --abort
```

---

## Deshacer errores

### Escenarios frecuentes

```bash
# Deshacer cambios en un archivo (no commiteado)
git checkout -- archivo.js
# o en versiones nuevas de git:
git restore archivo.js

# Sacar un archivo del staging (ya hiciste git add)
git restore --staged archivo.js

# Modificar el último commit (mensaje o agregar archivos)
git commit --amend

# Deshacer el último commit pero CONSERVAR los cambios
git reset --soft HEAD~1

# Deshacer el último commit y DESCARTAR los cambios (⚠️ cuidado)
git reset --hard HEAD~1

# Revertir un commit específico (crea un nuevo commit inverso — seguro en ramas compartidas)
git revert abc1234
```

> ⚠️ **Regla de oro**: nunca uses `git reset --hard` ni `git push --force` en ramas compartidas con otros.
> En tu propia feature branch está bien; en `main` o `develop`, nunca.

---

## Limpiar historial antes de mergear

Para proyectos personales es muy útil consolidar commits de trabajo en uno solo prolijo:

```bash
# Ver cuántos commits hiciste en la feature
git log --oneline develop..HEAD

# Squash interactivo (reemplazá N por la cantidad de commits)
git rebase -i HEAD~N
# En el editor: dejá "pick" en el primero, cambiá el resto a "squash" o "s"
# Git te pedirá el mensaje final del commit consolidado
```

**Cuándo usarlo:**
- Tenés commits como "wip", "fix", "arreglando de nuevo" → squash antes de mergear a develop
- Querés que `develop` tenga un historial legible, una entrada por feature

---

## Tags y releases

```bash
# Crear tag de release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Ver todos los tags
git tag -l

# Tag anotado con descripción del release
git tag -a v1.2.0 -m "Agrega soporte para OAuth y mejoras de performance"

# Convención de versiones (SemVer):
# MAJOR.MINOR.PATCH
# 1.0.0 → breaking change → 2.0.0
# 1.0.0 → nueva feature   → 1.1.0
# 1.0.0 → fix de bug      → 1.0.1
```

---

## Comandos de emergencia

```bash
# Recuperar archivo borrado accidentalmente
git checkout HEAD -- archivo-borrado.js

# Encontrar cuándo se introdujo un bug
git bisect start
git bisect bad                  # el commit actual tiene el bug
git bisect good v1.0.0          # esta versión estaba bien
# Git te va mostrando commits; escribís good/bad hasta encontrarlo
git bisect reset

# Ver qué línea cambió quién
git blame archivo.js

# Copiar un commit específico a otra rama
git cherry-pick abc1234
```

---

## Configuración inicial recomendada

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
git config --global init.defaultBranch main
git config --global pull.rebase true          # rebase en vez de merge al hacer pull
git config --global core.editor "code --wait" # VS Code como editor
```

---

## Referencias adicionales

- `references/gitflow.md` — Git Flow completo con develop, release y hotfix

---

## Cómo responder consultas de Git

1. **Identificar el escenario exacto** — preguntá si no está claro
2. **Dar el comando listo para usar** — siempre en bloque de código
3. **Explicar brevemente qué hace** — una oración es suficiente
4. **Advertir de riesgos** si el comando es destructivo
5. **Ofrecer alternativa más segura** cuando existe
