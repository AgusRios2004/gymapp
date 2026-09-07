---
name: pr-review
description: >
  Code review exhaustivo de los cambios de la rama actual contra la rama base (develop/main).
  Detecta inconsistencias con los patrones del proyecto (capas Spring, mappers MapStruct, manejo
  de errores, validación, seguridad JWT, TanStack Query, servicios del front) y genera un archivo
  de review estructurado. Disparar cuando el usuario diga "pr-review", "analizá/revisá los cambios
  de esta rama", "revisá esta rama contra main", "qué cambié en esta rama" o "detectá
  inconsistencias con los patrones del proyecto". Para una review estricta contra CLAUDE.md usá
  strict-review; para la descripción del PR usá pr-description.
---

# PR Review Skill

Review exhaustivo de los cambios de la rama actual contra la rama base.
Output: `docs/_interno/reviews/YYYY-MM-DD-pr-review-<rama>.md` (gitignoreado — no viaja en el PR).

## Paso 1: Detectar contexto del repositorio

```bash
git branch --show-current
git remote show origin | grep "HEAD branch"

# Rama base: en gymapp los PR van a `main` (develop quedó abandonada en abril 2026).
for b in main develop master; do
  git rev-parse --verify origin/$b >/dev/null 2>&1 && BASE=origin/$b && break
done
echo "Rama base: $BASE"
```

> ⚠️ **La rama de integración real es `main`.** `develop` quedó abandonada en abril de 2026 y no
> recibe merges: los PR de este repo van a `main`. Usala como base salvo que el usuario diga otra cosa.

### ⚠️ Diff de merge-base, NO de dos puntos

**Siempre el operador de tres puntos (`...`)**, que compara contra el *merge-base* (donde la rama se
separó). El de dos puntos (`..`) mezcla la divergencia: si la rama está **desactualizada**, los
commits que la base tiene y la rama no aparecen como **falsos borrados** (archivos que "se
borraron", migraciones que "desaparecieron"). Eso produce hallazgos falsos.

```bash
git log --oneline $BASE...HEAD          # commits reales del PR
git diff --name-status $BASE...HEAD     # archivos cambiados reales
```

### El trabajo sin commitear también cuenta

```bash
git rev-list --count "$BASE..HEAD"   # ¿hay commits propios?
git status --porcelain               # ¿hay trabajo sin commitear? (incluye los `??` sin trackear)
```

Si el pipeline de `equipo-implementar` dejó el trabajo sin commitear, `BASE...HEAD` devuelve
**vacío** y una review de cero archivos con veredicto "aprobado" es peor que no haberla corrido. El
conjunto a revisar es la **unión** de commits y working tree. Los `??` sin trackear no salen en
ningún `git diff` y suelen ser lo más importante del cambio (un controller nuevo, un DTO nuevo, una
migración): leelos enteros.

### Chequear si la rama está atrás de la base

```bash
git log --oneline HEAD..$BASE | head -20   # commits en la base que la rama NO tiene
```

Si devuelve commits, avisá con un banner ⚠️ al inicio del review y recomendá traer la base antes de
mergear. No reportes como problema del PR nada que provenga de esa divergencia.

## Paso 2: Entender los patrones del proyecto

Leé `CLAUDE.md` (raíz) y el del subproyecto que toca el cambio. Después explorá 2-3 archivos
**existentes** análogos a los modificados y confirmá los patrones contra el código, no de memoria:

**Backend (`gymapp-back/`)** — Spring Boot 3.5 · JPA · MySQL · Flyway · MapStruct · JWT:
- **Capas** — ¿Controller → Service → Repository, sin saltos? ¿Inyección por constructor con
  `@RequiredArgsConstructor`?
- **Respuesta** — ¿`ResponseEntity<WebApiResponse>` con `WebApiResponseBuilder`? ¿Devuelve DTO y no
  entidad JPA?
- **Mapeo** — ¿MapStruct del módulo, o conversión a mano en el service?
- **Errores** — ¿`ResourceNotFoundException` / excepciones del módulo, o `RuntimeException` genérica?
  ¿`printStackTrace()` nuevo?
- **Validación** — ¿anotaciones en el `RequestDTO` **y** `@Valid` en el controller?
- **Persistencia** — ¿migración Flyway nueva por cada cambio de esquema? ¿alguna ya aplicada editada?
- **Seguridad** — ¿el endpoint queda dentro de la cadena JWT? ¿algún dato sensible en el response?

**Frontend (`gym-frontend/`)** — React 19 · TanStack Query · Zod · Tailwind:
- **Capas** — ¿HTTP solo en `features/<dominio>/services/` usando `api` de `lib/axios`?
- **Datos** — ¿hooks de TanStack Query con keys por dominio? ¿invalidación en `onSuccess`?
- **Errores** — ¿toasts duplicados sobre los globales del interceptor (5xx/401/red)?
- **Formularios** — ¿Zod en `types/schema.type.ts` + react-hook-form, o validación a mano?
- **Tipos** — ¿algún `any`? ¿imports o parámetros sin usar (rompen el build)?
- **Estilos** — ¿Tailwind y primitivas de `components/ui/`, o elementos crudos?

## Paso 3: Obtener el diff completo

```bash
git diff $BASE...HEAD
```
Si es muy grande (+2000 líneas), procesá archivo por archivo (`git diff $BASE...HEAD -- <archivo>`).
Para los archivos que vas a citar en el reporte, leelos completos: el diff dice qué cambió, el
archivo entero dice si tiene sentido.

## Paso 4: Analizar los cambios

### 🔴 Crítico (bloquea el merge)
- Bugs de lógica; vulnerabilidades (SQL injection, secretos hardcodeados, endpoint sin auth, datos
  de otro usuario accesibles).
- Migración ya aplicada **editada** (rompe el arranque por checksum).
- Entidad nueva sin su tabla en una migración, o desajuste de nulabilidad/tipo con `ddl-auto=validate`.
- Inconsistencias que rompen la arquitectura (controller inyectando repository, entidad JPA
  devuelta por la API, `fetch` dentro de un componente).
- Escrituras en varias tablas sin `@Transactional`.

### 🟡 Importante (debería corregirse)
- `System.out.println` / `printStackTrace()` en vez de `log`.
- Manejo de errores inconsistente (excepción genérica, error tragado).
- Validación faltante, `any` innecesario, tipos incorrectos.
- Toast duplicado sobre el interceptor global; estados de loading/vacío/error sin cubrir.
- Lógica de negocio nueva sin test en el backend.

### 🟢 Sugerencia (nice to have)
- Legibilidad, naming, refactors menores, casos borde, docs útiles.

### 📋 Observaciones
- Preguntas sobre decisiones de diseño, trade-offs a discutir.

## Paso 5: Generar el archivo de review

```bash
mkdir -p docs/_interno/reviews
OUT="docs/_interno/reviews/$(date +%F)-pr-review-$(git branch --show-current | tr '/' '-').md"
n=2; while [ -f "$OUT" ]; do OUT="${OUT%.md}-$n.md"; n=$((n+1)); done
echo "Archivo de review: $OUT"
```

Estructura:

```markdown
# PR Review: [nombre de la rama]

**Fecha:** [fecha]
**Rama base:** [origin/main]
**Merge-base:** [hash corto]
**Commits:** [N] · **Archivos modificados (reales, merge-base + working tree):** [N]

> ⚠️ **[SOLO si la rama está atrás]** La rama está desactualizada respecto a `[base]`.
> Este review usa diff de merge-base y evalúa solo los cambios reales.

## Resumen ejecutivo
[2-4 oraciones: qué hace el PR y evaluación general, directo.]

## Patrones del proyecto detectados
| Aspecto | Patrón detectado |
|---------|-----------------|
| Capas backend | ... |
| Mapeo / DTOs | ... |
| Errores | ... |
| Validación | ... |
| Seguridad | ... |
| Datos en el front | ... |

## Problemas encontrados
### 🔴 Críticos
#### [Título]
**Archivo:** `ruta/Archivo.java` (línea N)
**Problema:** ...
**Escenario de fallo:** input X → comportamiento Y
**Sugerencia:** ...

### 🟡 Importantes
### 🟢 Sugerencias
### 📋 Preguntas / Observaciones

## Veredicto
| | |
|-|-|
| **Estado** | ✅ Aprobado / ⚠️ Aprobado con cambios / 🚫 Requiere cambios |
| **Críticos** | N |
| **Importantes** | N |
| **Sugerencias** | N |
```

## Notas

- **No inventes patrones**: si no hay evidencia, decilo ("no se detectó un sistema de logging").
- **Sé específico con archivo y línea**, y confirmá cada hallazgo leyendo el código real.
- **Contexto antes que reglas**: un `console.log` en un script suelto no es lo mismo que en un
  endpoint. Y las dos inconsistencias conocidas del envelope (`succes`, `GlobalExceptionHandler`)
  **no se reportan como hallazgo nuevo** salvo que el PR las haya empeorado.
- Modos: `--quick` (solo críticos), `--deep` (+performance, cobertura de tests, arquitectura).
