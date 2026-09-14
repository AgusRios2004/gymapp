---
id: 0003
titulo: Clases grupales en varios días de la semana
estado: propuesta            # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 13/09/2026
adrs_relacionados: [ADR-0003]
---

## Objetivo

Que una clase grupal que se dicta varios días (por ejemplo, Funcional lunes, miércoles y viernes a las 10:00) se cargue **una sola vez**, en lugar de duplicarla por día. Hoy `GroupClass` guarda un único `dayOfWeek`.

Cubre las tareas T-07 y T-14 del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md).

## Restricciones

- **Modelo:** `daysOfWeek: List<String>` con `@ElementCollection`, sin entidad por día ([ADR-0003](../docs/adr/0003-clases-multidia-elementcollection.md)).
- **Horario y cupo son los mismos para todos los días de la clase** (decisión del 13/09/2026). Una clase = un nombre, un profesor, un horario, un cupo, una rutina, repetidos en los días elegidos.
- **Las clases existentes se migran solas** (decisión del 13/09/2026): al arrancar el backend, cada clase con el `dayOfWeek` viejo pasa a tener ese único día en `daysOfWeek`. Nadie tiene que volver a cargarlas.
- Días válidos: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` (los mismos valores que ya usa el front en `constants/time.ts`).
- Errores con el formato de la spec 0001 (`WebApiResponse`, `message` en español).

## Comportamiento esperado

1. `POST /api/classes` y `PUT /api/classes/{id}` reciben `daysOfWeek` (lista) en vez de `dayOfWeek`. Se exige al menos un día válido; los repetidos se guardan una sola vez.
2. `GET /api/classes` devuelve cada clase con su `daysOfWeek`.
3. Editar una clase **reemplaza** la lista de días (no la suma).
4. Al iniciar la aplicación, una migración idempotente copia el `dayOfWeek` viejo a `daysOfWeek` en las clases que todavía no tienen días, y limpia el campo viejo.
5. **Vista semanal** (`ClassesPage`): una clase aparece en la columna de **cada** día que tiene.
6. **Formulario de alta y edición**: se eligen varios días (un control por día). Sin ningún día elegido no se puede guardar.
7. **Selector de clase al asignar un alumno**: la opción muestra todos los días de la clase, no solo uno.

## Casos de borde

- **Lista vacía o ausente:** 400.
- **Día inválido** (`"LUNES"`, `"monday"` en minúscula, `""`): 400, con el valor rechazado en el mensaje.
- **Días repetidos** (`["MONDAY","MONDAY"]`): se acepta y se guarda `["MONDAY"]`.
- **Orden:** el backend devuelve los días en orden de semana (lunes → domingo), sin importar cómo se enviaron.
- **Migración corrida dos veces** (reinicio del backend): no duplica días ni pisa clases que ya fueron editadas con varios días.
- **Clase vieja con `dayOfWeek` null:** la migración la deja sin días y la registra en el log; no rompe el arranque.
- **Editar una clase inexistente:** 404 (hoy `updateClass` tira `RuntimeException` → 500).
- **Alumnos asignados:** el cupo se sigue contando por clase (alumnos con esa `activeClass`), no por día.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0003-01 | `POST /api/classes` con `daysOfWeek: ["MONDAY","WEDNESDAY","FRIDAY"]` responde 200, y `GET /api/classes` devuelve esa clase con exactamente esos tres días, en ese orden. |  |
| AC-0003-02 | `POST /api/classes` sin `daysOfWeek` o con `daysOfWeek: []` responde 400 con `message` en español y no crea la clase. |  |
| AC-0003-03 | `POST /api/classes` con `daysOfWeek: ["MONDAY","LUNES"]` responde 400 y `message` menciona `LUNES`. |  |
| AC-0003-04 | `POST /api/classes` con `daysOfWeek: ["FRIDAY","MONDAY","MONDAY"]` responde 200 y la clase queda con `["MONDAY","FRIDAY"]`. |  |
| AC-0003-05 | `PUT /api/classes/{id}` sobre una clase con `["MONDAY","WEDNESDAY"]` enviando `["TUESDAY"]` deja la clase solo con `["TUESDAY"]`. |  |
| AC-0003-06 | `PUT /api/classes/{id}` con un id inexistente responde 404 con `message` en español que incluye el id. |  |
| AC-0003-07 | Una clase persistida con el campo viejo `dayOfWeek = "THURSDAY"` y sin días queda, después de correr la migración, con `daysOfWeek = ["THURSDAY"]` y el campo viejo en null; correr la migración otra vez no cambia nada. |  |
| AC-0003-08 | La migración no toca una clase que ya tiene `daysOfWeek` cargados, aunque también tenga el campo viejo. |  |
| AC-0003-09 | `ClassesPage` con una clase de `daysOfWeek: ["MONDAY","WEDNESDAY"]` la muestra en las columnas Lunes y Miércoles, y no en Martes. |  |
| AC-0003-10 | En el formulario de nueva clase, elegir Lunes y Viernes y guardar llama a `createClass` con `daysOfWeek` que contiene `MONDAY` y `FRIDAY`; sin ningún día elegido, `createClass` no se llama. |  |
| AC-0003-11 | Al abrir la edición de una clase con `["MONDAY","FRIDAY"]`, los controles de Lunes y Viernes aparecen marcados y el resto no. |  |
| AC-0003-12 | En el selector de clase al asignar un alumno, la opción de una clase con `["MONDAY","WEDNESDAY"]` muestra "Lunes" y "Miércoles". |  |

## Fuera de alcance

- **Horario o cupo distinto por día:** descartado por decisión de negocio; requeriría reemplazar ADR-0003.
- **Pasar `GroupClassController` a `RequestDTO` + `@Valid`:** es la deuda de `gymapp-back/GEMINI.md` §3.1 anotada en la spec 0001. La validación de días va en el service (400 vía `IllegalArgumentException`) para no cambiar además el contrato de `professor`/`routine`.
- **Rediseño de la vista de clases en cards con color por día** (T-28): Sprint 2.
- **Detectar choques de horario** (mismo profesor, mismo día y hora en dos clases): regla no definida.
- **`GroupClassRepository.findByDayOfWeek`:** no lo usa nadie; se elimina con el campo, sin reemplazo.

## Notas de handoff

**Qué se asumió:**
- El campo viejo se mantiene mapeado temporalmente (columna `day_of_week`) solo para que la migración lo lea; se marca como obsoleto y no viaja en la respuesta JSON. Así la migración se puede probar en H2 sin SQL a mano.
- La migración es un `ApplicationRunner` (o equivalente) que corre también en tests; como en tests no hay clases viejas, no hace nada salvo en los tests que la ejercitan.
- El front deja de usar `dayOfWeek` en todos lados (`types/index.ts`, `ClassesPage.tsx`).

**Preguntas abiertas para aprobar:**
1. Ninguna de negocio. Revisar solo que el orden lunes → domingo (AC-0003-01/04) coincida con cómo querés ver los días.

**Qué es lo más probable que salga mal:**
- **La migración en la MySQL real.** `ddl-auto=update` crea la tabla nueva de días pero nunca borra la columna vieja; si el runner falla a mitad (por ejemplo, por una clase con datos raros), las clases quedan sin días en la vista. Por eso AC-0003-07/08 exigen idempotencia y el caso de `dayOfWeek` null no puede romper el arranque. **Hacer un backup de la base antes de levantar el backend con este cambio.**
- **`@ElementCollection` y `EAGER`.** `GET /api/classes` devuelve entidades; si la colección queda lazy, la serialización puede tirar `LazyInitializationException` fuera de la transacción. Es el tipo de error que no aparece en un test que solo mira el service.
- **`ClassesPage.tsx` es grande (más de 500 líneas) y tiene el formulario duplicado** para alta y edición (líneas ~473 y ~539). Cambiar solo uno de los dos es el error más probable del front; AC-0003-10 y 11 cubren los dos.
