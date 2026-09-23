---
id: 0006
titulo: Espacios del gimnasio y choques de horario entre clases
estado: propuesta             # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 22/09/2026
adrs_relacionados: [ADR-0003]
---

## Objetivo

Que no se puedan cargar dos clases grupales que se pisan en día y horario **en el mismo espacio** del gimnasio, ni **con el mismo profesor**. Hoy `GroupClass` no tiene lugar y no se valida ningún choque: se pueden dar de alta dos clases a la misma hora con el mismo profesor.

Para eso, el ADMIN administra una lista de **espacios** (salas, salones, exterior) y cada clase elige el suyo.

Detectado en la revisión del 22/09/2026, antes de la QA Sesión 03 (17/10/2026). Es Capa 1 (Admin). Se apoya en el modelo multi-día de la [spec 0003](./0003-clases-multi-dia.md).

## Restricciones

Decididas por el usuario el 22/09/2026:

1. **Se bloquean dos tipos de choque:** mismo espacio, o mismo profesor, en clases que comparten al menos un día y cuyos horarios se superponen.
2. **Los espacios son una lista administrable por el ADMIN** (alta, edición, baja y reactivación). La clase elige el espacio de un selector; no hay texto libre.
3. **El espacio es obligatorio al crear o editar una clase.** Las clases que ya existen quedan "Sin espacio" hasta que alguien las edite. Mientras tanto solo se les controla el choque de profesor.
4. **Un espacio no se borra, se da de baja** (mismo criterio que el staff): queda inactivo, no aparece para elegirlo en clases nuevas, las clases que ya lo usan lo siguen mostrando, y se puede reactivar.
5. **Horarios que se tocan no chocan:** una clase de 10:00 a 11:00 y otra de 11:00 a 12:00 en el mismo espacio se permiten. Chocan solo si comparten al menos un minuto.

Técnicas:

- Errores con el formato de la spec 0001 (`WebApiResponse`, `message` en español). Datos inválidos → 400; recurso inexistente → 404; regla de negocio violada (choque, nombre repetido, espacio inactivo) → 409; rol sin permiso → 403.
- El rol se resuelve del token con `AuthenticatedStaffService`, igual que en las specs 0002 y 0004. El backend no confía en el front para saber quién es ADMIN.
- El horario y los días siguen siendo los mismos para todos los días de la clase (spec 0003, ADR-0003).
- El front muestra literal el `message` del backend en un toast (regla global de `PRD_REFACTOR.md`).

## Comportamiento esperado

### Espacios (`/api/spaces`)

1. `GET /api/spaces` devuelve todos los espacios (activos e inactivos) ordenados por nombre, a cualquier usuario autenticado.
2. `POST /api/spaces` con `{ "name": "Sala 1" }` crea un espacio activo. Solo ADMIN.
3. `PUT /api/spaces/{id}` cambia el nombre. Solo ADMIN.
4. `PATCH /api/spaces/{id}/status` con `{ "active": true | false }` da de baja o reactiva. Es idempotente. Solo ADMIN.
5. No hay `DELETE`.
6. El nombre se guarda sin espacios al principio y al final. Dos espacios no pueden tener el mismo nombre, sin distinguir mayúsculas ni esos espacios.

### Clases (`/api/classes`)

7. `POST` y `PUT` reciben `space: { id }`, igual que `professor`. `GET /api/classes` devuelve cada clase con su `space` (`id`, `name`, `active`) o `null` si no tiene.
8. Antes de guardar se valida, en este orden:
   1. `startTime` y `endTime` con formato `HH:mm` y `endTime` posterior a `startTime` → si no, 400.
   2. Espacio presente → si no, 400. Espacio existente → si no, 404. Espacio activo → si no, 409. **Excepción:** al editar una clase que ya tenía ese mismo espacio y el espacio fue dado de baja después, se permite guardar sin cambiarlo.
   3. Choque de espacio: otra clase con el mismo espacio, al menos un día en común y horarios superpuestos → 409.
   4. Choque de profesor: otra clase con el mismo profesor, al menos un día en común y horarios superpuestos → 409.
9. Al editar, la clase no choca consigo misma.
10. El mensaje de choque dice con qué clase choca, en qué día y en qué horario. Por ejemplo: *"El espacio Sala 1 ya está ocupado el lunes de 10:00 a 11:00 por la clase Crossfit."* o *"El profesor Marcos Entrenador ya da la clase Crossfit el lunes de 10:00 a 11:00."*
11. Una clase que está en la base sin espacio nunca produce choque de espacio. Sí cuenta para el choque de profesor.

### Frontend

12. Página nueva **Espacios** (`/spaces`), visible en el menú lateral solo para ADMIN, igual que "Personal". Muestra la lista y permite crear, renombrar, dar de baja y reactivar. Tiene estados de carga y vacío (`Skeleton` y `EmptyState`) y respeta `DESIGN_SYSTEM.md` y ADR-0009 (mobile).
13. En los formularios de alta **y** edición de `ClassesPage` (hoy son dos formularios duplicados), un selector de espacio obligatorio que lista solo los espacios activos. Al editar una clase cuyo espacio está dado de baja, el selector lo muestra seleccionado igual.
14. Sin espacio elegido el formulario no se envía y avisa. Un 409 del backend se muestra en un toast con su mensaje literal, y el modal queda abierto con lo cargado.
15. La card de cada clase en el calendario muestra el nombre del espacio, o "Sin espacio" si no tiene.

## Casos de borde

- **Nombre de espacio vacío o solo espacios:** 400.
- **Nombre repetido** (`"sala 1 "` cuando existe `"Sala 1"`): 409. Vale también al renombrar hacia un nombre que ya existe. Renombrar un espacio a su propio nombre no es error.
- **PROFESSOR intenta crear, renombrar o dar de baja un espacio:** 403 y no cambia nada.
- **Espacio inexistente** en `PUT`/`PATCH` de espacios o en una clase: 404 con el id en el mensaje.
- **`endTime` igual a `startTime`, o anterior** (`11:00`–`10:00`): 400. No hay clases que crucen la medianoche.
- **Formato de hora inválido** (`"10"`, `"25:00"`, `""`): 400.
- **Días compartidos parcialmente:** clase A lunes y miércoles, clase B miércoles y viernes, mismo espacio y horario superpuesto → choca por el miércoles, y el mensaje nombra el miércoles.
- **Sin días en común:** mismo espacio y mismo horario, A lunes y B martes → no choca.
- **Horario contenido:** A 10:00–12:00, B 10:30–11:00 en el mismo espacio → choca.
- **Choque de espacio y de profesor a la vez:** se informa el de espacio (primer control que falla).
- **Datos viejos que ya chocan entre sí:** no se corrigen solos. Editar una de esas clases sin resolver el choque devuelve 409. Es el comportamiento buscado, pero ver "Qué es lo más probable que salga mal".
- **Dar de baja un espacio con clases:** se permite. Las clases lo siguen mostrando y siguen ocupándolo a efectos de choque.
- **Dos ADMIN guardan a la vez clases que chocan:** fuera de alcance (ver abajo).

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0006-01 | Autenticado como ADMIN, `POST /api/spaces` con `{"name":"  Sala 1 "}` responde 200 con un espacio `active: true` y nombre `"Sala 1"`, y aparece en `GET /api/spaces`. |  |
| AC-0006-02 | Autenticado como PROFESSOR, `POST /api/spaces`, `PUT /api/spaces/{id}` y `PATCH /api/spaces/{id}/status` responden 403 con `message` en español, y la lista de espacios no cambia. |  |
| AC-0006-03 | Con un espacio `"Sala 1"` existente, `POST /api/spaces` con `"sala 1"` responde 409 y no crea nada. `PUT` de otro espacio al nombre `"SALA 1"` también responde 409. |  |
| AC-0006-04 | `POST /api/spaces` con nombre vacío o solo espacios responde 400. |  |
| AC-0006-05 | `PATCH /api/spaces/{id}/status` con `{"active":false}` deja el espacio inactivo sin borrarlo: sigue en `GET /api/spaces` con `active: false`. Repetir la llamada responde 200 sin cambios, y `{"active":true}` lo reactiva. |  |
| AC-0006-06 | `PUT /api/spaces/{id}` y `PATCH /api/spaces/{id}/status` con un id inexistente responden 404 con el id en el `message`. |  |
| AC-0006-07 | `POST /api/classes` con un espacio activo válido responde 200, y `GET /api/classes` devuelve la clase con `space.id` y `space.name`. |  |
| AC-0006-08 | `POST /api/classes` sin `space` responde 400; con un `space.id` inexistente, 404; con un espacio inactivo, 409. En los tres casos no se crea la clase. |  |
| AC-0006-09 | Una clase guardada con el espacio `S`, que después se da de baja, se puede editar (por ejemplo, cambiarle el nombre) manteniendo `S` y responde 200. |  |
| AC-0006-10 | `POST /api/classes` con `endTime` igual o anterior a `startTime`, o con una hora que no es `HH:mm` válida (`"25:00"`), responde 400. |  |
| AC-0006-11 | Con la clase A (lunes, 10:00–11:00, espacio S), crear B (lunes, 10:30–11:30, espacio S, otro profesor) responde 409. El `message` nombra el espacio, el día "lunes", el horario de A y el nombre de A. B no se crea. |  |
| AC-0006-12 | Con la clase A (lunes, 10:00–11:00, espacio S), crear B en el espacio S el lunes de 11:00 a 12:00 responde 200 (horarios que se tocan no chocan). |  |
| AC-0006-13 | Con la clase A (lunes y miércoles, 10:00–11:00, espacio S), crear B (martes, 10:00–11:00, espacio S) responde 200. Crear C (miércoles y viernes, 10:00–11:00, espacio S) responde 409 y el `message` dice "miércoles". |  |
| AC-0006-14 | Con la clase A (lunes, 10:00–11:00, profesor P, espacio S1), crear B (lunes, 10:30–11:30, profesor P, espacio S2) responde 409 y el `message` nombra al profesor y a la clase A. |  |
| AC-0006-15 | Editar la clase A (`PUT`) sin cambiar día, horario, espacio ni profesor responde 200: una clase no choca consigo misma. |  |
| AC-0006-16 | Una clase guardada sin espacio (dato previo a esta spec), lunes 10:00–11:00, no impide crear otra clase el lunes 10:00–11:00 en cualquier espacio con otro profesor, pero sí la impide con su mismo profesor (409). |  |
| AC-0006-17 | En el menú lateral, "Espacios" aparece con un usuario ADMIN y no aparece con un PROFESSOR. |  |
| AC-0006-18 | En la página Espacios, cargar un nombre y confirmar llama a `createSpace` con ese nombre. En un espacio activo, la acción de dar de baja llama a `setSpaceStatus(id, false)`; en uno inactivo, la de reactivar llama a `setSpaceStatus(id, true)`. |  |
| AC-0006-19 | En los formularios de nueva clase **y** de edición de `ClassesPage`, el selector de espacio ofrece solo los espacios activos, y guardar llama a `createClass`/`updateClass` con el `spaceId` elegido. Sin espacio elegido no se llaman. |  |
| AC-0006-20 | Al abrir la edición de una clase cuyo espacio está inactivo, el selector muestra ese espacio seleccionado. |  |
| AC-0006-21 | Si `createClass` rechaza con un 409 cuyo `message` es X, se muestra un toast con X y el modal sigue abierto con los datos cargados. |  |
| AC-0006-22 | La card de una clase con espacio muestra su nombre, y la de una clase con `space: null` muestra "Sin espacio". |  |

## Fuera de alcance

- **Capacidad por espacio** (que el cupo de la clase no supere lo que entra en la sala): útil a futuro, pero es otra regla de negocio que nadie definió.
- **Concurrencia** (dos ADMIN guardando a la vez clases que chocan entre sí): con el volumen de un gimnasio y un solo admin es muy improbable. Resolverlo exige bloqueo a nivel base de datos, y eso no se justifica ahora.
- **Detectar y listar los choques que ya existen en la base:** no se corrigen solos. Si hace falta, será una tarea aparte de limpieza de datos.
- **Asignarles espacio automáticamente a las clases viejas:** decisión del usuario, quedan "Sin espacio" hasta que se editen.
- **Choque de un alumno inscripto en dos clases superpuestas:** el alumno tiene una sola `activeClass`, así que no puede pasar con el modelo actual.
- **Pasar `GroupClassController` a `RequestDTO` + `@Valid`:** es deuda de `gymapp-back/GEMINI.md` §3.1, ya anotada en las specs 0001 y 0003. Las validaciones van en el service, como en la 0003.
- **Unificar los dos formularios duplicados de `ClassesPage`:** sería lo sano, pero es un refactor sin criterio propio. Se agregan los campos en los dos y se anota.
- **Clases que cruzan la medianoche:** no existen en el negocio. `endTime` debe ser posterior a `startTime` el mismo día.
- **Seed de espacios en los `DataLoader`:** los `DataLoader` escriben en la base real (ver `AGENTS.md`). Los espacios los carga el admin desde la UI.

## Notas de handoff

**Qué se asumió:**
- **Nombre de la entidad:** `GymSpace` (tabla `gym_space`), con `id`, `name` y `active`. No se usa `Space` para no chocar con nombres genéricos de librerías. En la UI se llama "Espacio".
- **La relación es `@ManyToOne` nullable** desde `GroupClass` (columna `space_id`). `ddl-auto=update` agrega la columna sin tocar las clases existentes, que quedan con `space_id` null. No hace falta migración.
- **El choque se calcula en el service**, comparando en memoria contra las clases del mismo espacio y las del mismo profesor, que son pocas. No se agrega una consulta con superposición de horarios en SQL: `startTime`/`endTime` son `String` y compararlos en SQL es frágil. Se parsean a `LocalTime`.
- **La validación de hora** (`HH:mm`, fin posterior al inicio) no se pidió explícitamente, pero sin ella la detección de choques no tiene sentido. Hoy no existe ninguna.
- **Los formularios del front ya no permiten guardar sin profesor.** El backend no lo exige hoy y esta spec no lo cambia. Si llega una clase sin profesor, solo se le controla el espacio.
- **Los días del mensaje** se escriben en español y en minúscula ("lunes"), con el mismo mapeo que `TRANSLATIONS` del front, replicado en el backend.

**Preguntas abiertas:**
1. ¿La página Espacios necesita mockup antes de implementarse, o alcanza con seguir el patrón visual de `MonthlyTypesPage` y `StaffPage` (cards con editar y dar de baja)? La tarea T5 asume lo segundo.

**Qué es lo más probable que salga mal:**
- **Datos existentes que ya chocan.** Si en la base real hay dos clases con el mismo profesor a la misma hora, cualquier edición de una de ellas va a responder 409, aunque sea para corregir un typo en el nombre. Es correcto según la regla, pero va a parecer un bug. **Antes de mergear, revisar las clases reales**: son pocas y se ven en el calendario.
- **Los dos formularios duplicados de `ClassesPage`.** Es el mismo riesgo que ya anotó la spec 0003: agregar el selector en uno y olvidarse del otro. AC-0006-19 exige los dos.
- **Mensajes de choque con datos `null`.** El profesor puede venir sin nombre o la clase vieja sin espacio. Armar el `message` sin cuidar esos casos es la forma más probable de terminar en un 500 en vez de un 409. AC-0006-16 lo cubre en parte.
- **`GET /api/classes` devuelve entidades.** Si `space` queda `LAZY`, la serialización puede tirar `LazyInitializationException`, igual que el riesgo de la 0003. Usar `EAGER`, como en `routine`.
