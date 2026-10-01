---
id: 0011
titulo: Clases — respuesta sin ciclos ni datos privados del profesor
estado: implementada         # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 29/09/2026
adrs_relacionados: []
---

## Objetivo

Que la página de Clases muestre siempre las clases, aunque una tenga asignada una rutina que algún alumno tiene como activa, y que la respuesta de clases deje de exponer la contraseña (hash) y los datos de contacto del profesor.

Crítico encontrado en la pasada previa de la [QA Sesión 02](../docs/notes/QA_SESION_02.md) (29/09/2026). Bloquea la sección 7 del checklist y, por lo tanto, el cierre del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md).

## Contexto (lo que pasa hoy)

`GroupClassController` devuelve la entidad `GroupClass` tal cual. Jackson serializa:

- `professor` → la entidad `Professor` completa, con `password` (hash bcrypt), `email`, `dni` y `phone`. La ve cualquier usuario autenticado.
- `routine` → la entidad `Routine`, que trae `clients`; cada `Client` trae `routineActive`, que vuelve a traer `clients`… Si algún alumno tiene como activa la rutina de una clase, el ciclo no termina: Jackson corta a los 1000 niveles, la respuesta sale con **status 200 y un JSON inválido** (truncado, con el error del handler pegado al final).
- `ClassesPage` hace `Array.isArray(data) ? data : []`: el JSON inválido termina como lista vacía y la página muestra "Sin clases programadas" en todos los días, sin ningún aviso.

Se reproduce desde la UI: editar una clase, asignarle una rutina que un alumno tiene activa y guardar. La base local ya está en ese estado (clase Calistenia con la rutina 1, activa para el alumno "Qa Uno").

## Restricciones

- El frontend usa de cada clase: `id`, `className`, `daysOfWeek`, `startTime`, `endTime`, `capacity`, `professor.id`, `professor.name`, `professor.lastName`, `routine.id` y `routine.name`. Esos campos mantienen nombre y significado: el tipo `GroupClass` de `gym-frontend/src/types/index.ts` no tiene que cambiar para leerlos.
- Formato de respuesta y de errores según la spec 0001 (`WebApiResponse`).
- Loading, vacío y error con `EmptyState`/`Skeleton` (CLAUDE.md, `docs/DESIGN_SYSTEM.md`): una falla no puede verse igual que "no hay clases".
- Los días de la clase siguen la spec 0003 (`daysOfWeek`); esta spec no toca su validación.

## Comportamiento esperado

1. `GET /api/classes`, `POST /api/classes` y `PUT /api/classes/{id}` responden con un DTO de clase, no con la entidad.
2. En ese DTO, `professor` es un resumen con **solo** `id`, `name` y `lastName`. Sin `password`, `email`, `dni`, `phone` ni `active`.
3. `routine` es un resumen (`id`, `name` y, opcionalmente, `goal`), sin `clients` ni `days`. Si la clase no tiene rutina, `routine` es `null`.
4. La respuesta es JSON válido para cualquier combinación de datos, incluido el caso de la rutina activa de un alumno.
5. Si `getClasses` falla (error HTTP o respuesta que no es una lista), `ClassesPage` muestra un estado de error con `EmptyState` en lugar de las columnas con "Sin clases programadas".

## Casos de borde

- **Vacío:** sin clases, `GET /api/classes` responde `data: []` y la página muestra las columnas con "Sin clases programadas" (sin estado de error).
- **Clase sin rutina:** `routine: null`.
- **Clase sin profesor** (datos viejos con `professor_id` nulo): `professor: null`, sin `NullPointerException`; la card se muestra sin nombre de profesor.
- **Ciclo:** la rutina de la clase es la `routineActive` de uno o más alumnos y figura en su lista `routines` (el caso real).
- **Varias clases con la misma rutina:** cada una trae su propio resumen; no hay referencias compartidas que rompan la serialización.
- **Respuesta rota o red caída:** estado de error; el botón "Nueva clase" sigue disponible.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0011-01 | Con una rutina R que es la `routineActive` de un alumno y está en su lista `routines`, y una clase con la rutina R, `GET /api/classes` responde 200 con un cuerpo que se parsea como JSON, y esa clase trae `routine.id == R.id` y `routine.name == R.name`. |  |
| AC-0011-02 | En `GET /api/classes`, el `professor` de cada clase trae `id`, `name` y `lastName`, y **no** trae `password`, `email`, `dni` ni `phone`. |  |
| AC-0011-03 | En `GET /api/classes`, el `routine` de una clase no trae `clients` ni `days`. |  |
| AC-0011-04 | Una clase sin rutina responde `routine: null`, y una clase sin profesor responde `professor: null`; `id`, `className`, `daysOfWeek`, `startTime`, `endTime` y `capacity` salen con los valores guardados. |  |
| AC-0011-05 | `POST /api/classes` y `PUT /api/classes/{id}` con `routine: { id: R }` (R en el caso del AC-01) responden 200 con JSON válido, y la clase devuelta cumple AC-02 y AC-03. |  |
| AC-0011-06 | En `ClassesPage`, si `getClasses` rechaza, se ve el `EmptyState` de error ("No pudimos cargar las clases") y no aparece ninguna columna con "Sin clases programadas". |  |
| AC-0011-07 | En `ClassesPage`, si `getClasses` resuelve con algo que no es una lista (por ejemplo `undefined` o un string), se ve el mismo estado de error que en AC-06. |  |
| AC-0011-08 | En `ClassesPage`, si `getClasses` resuelve `[]`, se ven las columnas de los días con "Sin clases programadas" y no se ve el estado de error. |  |

## Fuera de alcance

- **Los bodies de `POST`/`PUT /api/classes`.** Siguen recibiendo `professor: { id }` y `routine: { id }` sobre la entidad; pasarlos a un DTO de request es otro cambio que no hace falta para el crítico.
- **`/api/exercise-logs`.** También devuelve entidades (`ExerciseLog.client` → `Client` → `routineActive` → `clients`…) y puede tener el mismo ciclo. Va en una spec aparte para no mezclar endpoints. Ver la pregunta abierta sobre una defensa en `Routine.clients`.
- **Un error de serialización que sale con status 200.** Cuando Jackson falla con la respuesta ya empezada, el handler pega su JSON al final. Es un problema del `GlobalExceptionHandler` para todos los endpoints, no solo para clases.
- **Otros endpoints que devuelven entidades** (ejercicios, planes, productos). No tienen el ciclo ni exponen contraseñas; se revisan cuando se toquen.
- **Limpiar la base local.** Con la respuesta corregida, la clase Calistenia se muestra sin tocar datos.

## Notas de handoff

- **Asumido:** el resumen de profesor no necesita `email` ni `phone`, porque ninguna pantalla de clases los muestra. Si recepción tuviera que ver el teléfono del profesor en la card, se agrega `phone` de forma explícita, nunca la entidad.
- **Asumido:** el estado de error de la página entra en esta spec porque es lo que hizo invisible el crítico. Si se prefiere acotar al backend, se sacan AC-06 a AC-08 y la tarea T2.
- **Pregunta abierta:** ¿agregar también `@JsonIgnore` en `Routine.clients`, como defensa para cualquier endpoint que todavía serialice entidades (como `/api/exercise-logs`)? No lo pide ningún AC de esta spec.
- **Lo más probable que salga mal:** el test del AC-01 tiene que armar el ciclo real (alumno con `routineActive = R` y `routines` que contiene R, más la clase con R). Si el test solo crea la clase con la rutina, pasa aunque el bug siga ahí. Segundo riesgo: algún test viejo de clases (spec 0003, `GroupClassDaysTest`) lee campos de la entidad que el DTO ya no trae; se corrige el test solo si el campo no está en la lista de las Restricciones.
