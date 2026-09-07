---
name: strict-review
description: >
  Revisión estricta y directa de los cambios de la rama actual de gymapp —en cualquiera de las dos
  puntas, gymapp-back o gym-frontend— contra su rama base real, verificando cumplimiento de
  CLAUDE.md, calidad y lógica, y midiendo el costo de contexto con rtk. Disparar cuando el usuario
  diga "/strict-review", "revisá el PR", "revisá la rama", "review estricto", "revisá los cambios
  del front" o "revisá los cambios del back". Para review con detección de patrones del proyecto
  usá pr-review; para la descripción del PR usá pr-description.
---

# Strict Code Review (strict-review)

Actuá como un Tech Lead implacable. Revisá los cambios de la rama actual sin suavizar nada.

## Árbol de acciones obligatorias

### 0. Baseline de rtk

Antes de tocar nada, corré **`rtk gain`** y anotá el valor de `Tokens saved`. Es el punto de partida
para medir el costo de contexto de esta revisión (paso 8). Si dice `No tracking data yet`, el
baseline es 0.

### 1. Obtener los cambios

gymapp es **un solo repositorio** con las dos puntas adentro (`gymapp-back/`, `gym-frontend/`): un
mismo diff puede tocar las dos. Si es así, entregá **un solo reporte con una sección por punta**.

#### 1.1 La rama base: `origin/`, nunca la local

```bash
git branch --show-current
git rev-list --count develop..origin/develop   # ¿cuánto atrás está la local?
```

🛑 **Si eso devuelve algo distinto de 0, `develop...HEAD` está roto** y te va a traer commits ajenos
como si fueran del cambio. Usá siempre `origin/<base>`.

Y no asumas `develop` sin mirar: el repo tiene `main` y `develop`, y un hotfix sale de `main`.

```bash
git branch -r --contains "$(git merge-base origin/develop HEAD)" | head
git reflog --date=iso | head -20   # de dónde salió realmente la rama
```

Fijá `BASE` con lo que encuentres y usalo en todo lo que sigue. Si no podés determinarla con
confianza, **pará y reportalo**: una review sobre la base equivocada es peor que ninguna.

#### 1.2 El diff: commits **y** working tree

🛑 **`BASE...HEAD` sólo ve commits.** Una rama con el trabajo sin commitear devuelve **vacío**, y una
review de cero archivos con veredicto "LISTO PARA MERGEAR" es peor que no haberla corrido. Con el
pipeline de `equipo-implementar` ese es el caso normal: deja el trabajo sin commitear a propósito.

```bash
git rev-list --count "$BASE..HEAD"    # ¿hay commits propios?
git status --porcelain                # ¿hay trabajo sin commitear? (incluye los `??`)
```

El conjunto a revisar es la **unión** de los dos:

| Situación | Lista de archivos | Diff |
|---|---|---|
| Sólo commits | `rtk git diff "$BASE...HEAD" --name-only` | `rtk git diff "$BASE...HEAD"` |
| Sólo working tree | `git status --porcelain` | `rtk git diff` |
| Las dos cosas | unión de ambos | `rtk git diff` + `rtk git diff "$BASE...HEAD"` |

⚠️ Los archivos **sin trackear** (`??`) no salen en ningún `git diff`. Sacalos de
`git status --porcelain` y leelos enteros — suelen ser lo más importante del cambio (un controller
nuevo, un DTO, una migración Flyway). Olvidarlos es el modo de falla más silencioso de este paso.

⚠️ Al leer estado de git usá **`rtk proxy git status`**: el `git status` filtrado por rtk muestra
` M` donde en realidad hay `UU` (conflicto), y te haría revisar un merge a medio resolver sin saberlo.

El diff es donde está el ahorro real de rtk (~95%): condensa a líneas cambiadas y descarta contexto.

### 2. Leer contexto completo

Para cada archivo modificado, **no te conformes con el diff**: leé el archivo completo. El diff te
muestra qué cambió; el archivo entero te muestra si tiene sentido.

⚠️ **No uses `rtk read` para archivos que vayas a citar en el reporte**: no emite números de línea y
el reporte exige `[Archivo:Línea]`. `rtk read` sirve para archivos de contexto que mirás de refilón
(configs, SQL largo, fixtures).

### 3. Leer los CLAUDE.md que aplican

Son **dos y los dos mandan**:

- El **raíz** (`CLAUDE.md`): las reglas de conducta transversales —cambios quirúrgicos, simplicidad,
  nada especulativo— y los estándares transversales (§7). Define los criterios del paso 4.
- El **de la punta** que estás revisando: `gymapp-back/CLAUDE.md` o `gym-frontend/CLAUDE.md`.

### 4. Verificar contra CLAUDE.md

Para cada archivo, preguntate:
- **¿Los cambios son quirúrgicos?** ¿Alguna línea toca algo que no tiene que ver con el objetivo?
- **¿El código es tan simple como puede ser?** ¿Hay complejidad especulativa, capas de abstracción
  innecesarias, lógica "por si acaso"?
- **¿Se agregaron abstracciones o features que nadie pidió?** Helpers genéricos, parámetros extra,
  configuración flexible sin caso de uso.

### 5. Revisar calidad general

- **Nombres**: claros y consistentes con el estilo existente.
- **Imports y variables sin uso** introducidos por estos cambios. En el front esto **rompe el
  build** (`noUnusedLocals`), no es cosmético.
- **Bugs obvios**: casos borde que importan, errores de lógica, condiciones mal construidas.
- **Consistencia de estilo**: ¿el código nuevo parece del mismo autor que el existente?
- **Comentarios que afirman hechos falsos.** Un comentario que cita un precedente ("esto sigue el
  patrón de X") hay que verificarlo, igual que el código: greppealo. Un comentario falso es peor que
  ninguno.
- **Tests que prometen más de lo que prueban.** Leé el nombre del test y después los asserts. Un
  test cuyo nombre dice cubrir un caso que no ejercita es peor que su ausencia: hace que el criterio
  de aceptación se marque cumplido.

#### 5.1 Según la punta

Sólo la sección de la punta que estás revisando.

**Backend (`gymapp-back/`):**
- Capas sin saltos: ningún controller inyecta un repository; ninguna entidad JPA se devuelve por la API.
- Inyección por constructor (`@RequiredArgsConstructor` + campos `final`), nunca `@Autowired` en campo.
- Mapeo por MapStruct del módulo, no conversiones a mano en el service.
- Validación: anotaciones en el `RequestDTO` **y** `@Valid` en el controller. Sin `@Valid` no corre nada.
- Ninguna migración de `db/migration/` **ya aplicada** fue editada (Flyway valida por checksum: la
  app no arranca).
- Entidad nueva ⇒ su `CREATE TABLE` en una migración nueva, con el prefijo de módulo y —si es
  `@Audited`— su tabla `_AUD`. Con `ddl-auto=validate` un desajuste tira la app al arrancar.
- Escrituras en más de una tabla dentro de `@Transactional`.
- Ningún `System.out.println` ni `printStackTrace()` nuevo; logging con `log` de `@Slf4j`.
- Ningún secreto, credencial ni URL de base hardcodeada.
- Verificación: `./mvnw -q compile` y `./mvnw test`.

**Frontend (`gym-frontend/`):**
- Nada de `axios`/`fetch` fuera de `features/<dominio>/services/`; los componentes consumen hooks.
- Query keys por dominio e invalidación en `onSuccess`.
- Sin toasts duplicados sobre los globales del interceptor (5xx, 401, red).
- Zod en `types/schema.type.ts` + react-hook-form; sin validación a mano en el submit.
- Sin `any`; sin imports/parámetros sin usar.
- Tailwind y primitivas de `components/ui/`; responsive real.
- Verificación: `npm run build` y `npm run lint`.

**Las dos inconsistencias conocidas** (`succes` en el envelope y el `GlobalExceptionHandler` que no
lo usa) están documentadas en los CLAUDE.md: **no las reportes como hallazgo nuevo**, y sí reportá
si alguien las "arregló de paso" en una sola punta — eso rompe el contrato.

### 6. Generar el reporte

Sé directo. Si algo está mal, decí exactamente qué y por qué, sin suavizarlo. Estructura **exacta**:

```markdown
### 🚨 Violaciones de CLAUDE.md
- [Archivo:Línea] — descripción directa de la violación

### 📉 Problemas de calidad
- [Archivo:Línea] — bug, inconsistencia de estilo, import sin uso, código muerto introducido

### ✅ Qué está bien
- Brevemente, qué partes están correctas — para saber qué NO tocar

### ⚖️ Veredicto
**[LISTO PARA MERGEAR | NECESITA CORRECCIONES]**
```

Si no hay violaciones de CLAUDE.md, escribí `Ninguna.` en esa sección. No la omitas.

### 7. Exportar el reporte

Escribí siempre el resultado en un archivo Markdown además de mostrarlo en el chat, para que el
usuario pueda copiar el texto crudo. Va a
`docs/_interno/reviews/YYYY-MM-DD-strict-review-<rama>.md`, **desde la raíz del repo**. Si el cambio
cruza las dos puntas, es **un** archivo con una sección por punta.

⚠️ **`docs/_interno/` está gitignoreado.** El reporte es una herramienta de trabajo: no viaja en el
PR. Si algo del reporte merece quedar como documentación del proyecto, copiá **esa parte** a
`docs/notes/` como nota propia, no el reporte entero.

🛑 **Nunca dejes un `.md` en la raíz del repo ni de un subproyecto** (`CLAUDE.md` §6).

### 8. Cerrar con el costo de contexto

Volvé a correr **`rtk gain`** y calculá el delta contra el baseline del paso 0. Agregá al final del
reporte (también en el archivo exportado):

```markdown
### 🪙 Costo de contexto de la revisión (rtk)
- Archivos en el diff: N — leídos completos: M
- Tokens ahorrados por rtk en esta corrida: **~X** (delta contra el baseline)
```

Reglas:
- Si el baseline era `No tracking data yet`, el delta es el total que reporte `rtk gain` al cerrar.
- Si el delta es 0, escribilo tal cual: `0 — el ahorro vino de lecturas, que rtk no filtra.` No lo infles.
- `rtk gain` es **global y acumulativo**, no por sesión: el delta es la única cifra atribuible a esta
  revisión. No copies el total global como si fuera el ahorro de este review.
