---
id: 0015
titulo: Mensajes de error del backend en español y con fechas legibles
estado: implementada      # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 07/10/2026
adrs_relacionados: [ADR-0011]
---

## Objetivo

El frontend muestra literal el `message` de error del backend (regla global del refactor). Hoy una parte de esos mensajes sale en inglés o con la fecha en formato ISO, y el usuario del gimnasio los lee así en un toast:

- **En inglés (BUG-26):** "Client not found with id: 5", "Exercise in use in some RoutineExercise", "Monthly Type have registers in Payments". Relevados el 07/10/2026: **37 textos en 15 archivos** de `gymapp-back/src/main/java` (la bitácora había contado 26 en 14).
- **Con fecha ISO (BUG-22):** "Ya existe un pago del plan 'Mensual' vigente hasta 2026-10-06." y "La membresía del alumno ha vencido el: 2026-09-28".

La [spec 0001](./0001-errores-del-backend-legibles.md) tradujo los mensajes de clientes, pagos y asistencias y dejó el resto fuera de alcance (rutinas, ejercicios, nutrición, administradores). La [spec 0010](./0010-backend-en-hora-argentina.md) dejó fuera de alcance el formato de las fechas. Esta spec cierra las dos deudas antes de la QA Sesión 03 (17/10/2026), que exige cerrar la Capa 1 sin bugs de experiencia.

Registrado como BUG-22 y BUG-26 en la [bitácora de QA](../docs/notes/BITACORA_QA.md) → "Sesión 02".

## Restricciones

- **Solo backend, y solo el texto.** No cambian los status HTTP, el formato `WebApiResponse` (`succes`, `message`, `data`) ni el contrato de entrada o salida de ningún endpoint. El frontend no se toca.
- Las fechas siguen viajando como `LocalDate` ISO (`AAAA-MM-DD`) en los campos de datos. Lo que cambia es la fecha escrita **dentro del texto** de un `message`.
- No se agrega una librería ni un archivo de mensajes (`messages.properties`): los textos siguen siendo literales en el código, como los que ya tradujo la spec 0001.
- Los mensajes que ya están en español no se reescriben. Los nuevos siguen su misma forma: `<Entidad> no encontrado/a con id: <id>`.
- Los tests corren sobre H2 con el reloj fijo de [ADR-0011](../docs/adr/0011-reloj-inyectado-zona-del-negocio.md), con DNIs únicos por test.
- Los tests de `AC-0001-08` y `AC-0001-09` afirman hoy la fecha con `toString()` (ISO). Esta spec cambia ese formato, así que esas dos aserciones se actualizan a `DD/MM/AAAA`. El criterio de la spec 0001 ("el `message` contiene la fecha de vencimiento") no cambia y sigue cumpliéndose.

## Comportamiento esperado

### A. Recurso inexistente

1. Toda respuesta 404 por un recurso que no existe tiene un `message` en español que nombra la entidad e incluye el id pedido:

| Entidad | `message` |
|:---|:---|
| Alumno | `Cliente no encontrado con id: <id>` (texto ya vigente) |
| Ejercicio | `Ejercicio no encontrado con id: <id>` |
| Tipo de plan | `Tipo de plan mensual no encontrado con id: <id>` (texto ya vigente en pagos) |
| Producto | `Producto no encontrado con id: <id>` |
| Profesor | `Profesor no encontrado con id: <id>` (texto ya vigente en pagos) |
| Administrador | `Administrador no encontrado con id: <id>` |
| Rutina | `Rutina no encontrada con id: <id>` (texto ya vigente en clientes) |
| Registro físico | `Registro físico no encontrado con id: <id>` |
| Comida registrada | `Comida no encontrada con id: <id>` |

2. Hoy `GET /api/exercises/{id}` responde "Exercise with id not found: " sin el id. Pasa a incluirlo, como el resto.

### B. Otros mensajes en inglés

3. Los mensajes que explican por qué no se pudo hacer algo pasan a español:

| Situación | `message` |
|:---|:---|
| Borrar un ejercicio que está en una rutina | `No se puede eliminar el ejercicio porque está en uso en una o más rutinas.` |
| Borrar un tipo de plan que tiene pagos | `No se puede eliminar el tipo de plan porque tiene pagos registrados.` |
| Borrar una rutina asignada a un alumno | `No se puede eliminar la rutina porque está asignada a uno o más alumnos.` |
| Crear o editar una rutina con un día repetido | `La rutina tiene el día <n> repetido.` |
| Id nulo en administradores | `El ID no puede ser nulo.` |

### C. Fechas dentro de los mensajes

4. Toda fecha escrita en un `message` sale como `DD/MM/AAAA`, con cero a la izquierda en el día y el mes. Es el mismo formato que la [spec 0008](./0008-fechas-en-hora-local.md) fijó para el frontend.
5. Los dos mensajes que hoy llevan fecha quedan así:
   - `Ya existe un pago del plan '<plan>' vigente hasta 06/10/2026.`
   - `La membresía del alumno ha vencido el: 28/09/2026`
6. El formato no depende del locale de la JVM, que en la imagen de producción es `en_US` (verificado en la spec 0010).

### D. Que no vuelva a pasar

7. Un test recorre `src/main/java` y falla si el texto de una excepción vuelve a estar en inglés. Nombra el archivo y la línea.

## Casos de borde

- **Id que no existe:** los tests usan `999999`. El `message` lo incluye tal cual.
- **Id no numérico** (`GET /api/products/abc`): sigue respondiendo 400 con "Uno de los valores de la solicitud no tiene el formato esperado." (spec 0001). No cambia.
- **Día o mes de un dígito:** `2027-01-05` sale como `05/01/2027`, no `5/1/2027`.
- **Locale `en_US`:** la fecha no sale como `01/05/2027` ni con el nombre del mes.
- **Borrado bloqueado:** además del mensaje, el recurso sigue existiendo después del request.
- **Venta con un producto inexistente:** el mensaje nombra el producto, y el stock del resto del pedido no cambia (ya lo garantiza `AC-0001-10`).
- **Alumno inexistente en una sub-ruta** (`/api/clients/999999/water/add`): el mensaje nombra al alumno, no al registro de agua.
- **Rutina con un día repetido y un ejercicio inexistente a la vez:** alcanza con que responda uno de los dos mensajes, en español. No se fija cuál.
- **Excepción con `message` null:** ya la cubre el handler de la spec 0001 con un texto por defecto en español.
- **Vacío, concurrencia, servicio externo caído, reinicio a mitad de operación:** no aplican. El cambio es de texto y no agrega estado ni llamadas externas.

## Criterios de aceptación

Todos los tests levantan el contexto (`@SpringBootTest` + `MockMvc` sobre H2) salvo `AC-0015-12` y `AC-0015-13`. "Mensaje exacto" significa que el test compara el `message` completo, no un fragmento.

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0015-01 | `GET`, `PUT` (con un cuerpo JSON válido) y `DELETE` sobre `/{id}` con id `999999` en `/api/exercises`, `/api/monthly-type`, `/api/products`, `/api/professors` y `/api/administrators` responden 404, `succes: false` y el mensaje exacto de la tabla A con `999999`. Son 15 combinaciones. |  |
| AC-0015-02 | `DELETE /api/exercises/{id}` de un ejercicio usado en una rutina y `DELETE /api/monthly-type/{id}` de un tipo de plan con un pago responden con el mensaje exacto de la tabla B, y el recurso sigue existiendo. `POST /api/products` con un administrador de id `999999` responde 404 con `Administrador no encontrado con id: 999999`. |  |
| AC-0015-03 | `GET`, `PUT` y `DELETE` sobre `/api/routines/999999` responden 404 con `Rutina no encontrada con id: 999999`. |  |
| AC-0015-04 | `POST /api/routines/assign` con `clientId` `999999` responde 404 con `Cliente no encontrado con id: 999999`. Con un alumno real y `routineTemplateId` `999999`, responde 404 con `Rutina no encontrada con id: 999999`. |  |
| AC-0015-05 | `POST /api/routines` con un ejercicio de id `999999` responde 404 con `Ejercicio no encontrado con id: 999999`. Con dos días de `dayOrder` 2 y ejercicios reales, responde 400 con `La rutina tiene el día 2 repetido.` |  |
| AC-0015-06 | `DELETE /api/routines/{id}` de una rutina asignada a un alumno responde con el mensaje exacto de la tabla B, y `GET /api/routines/{id}` la sigue devolviendo. |  |
| AC-0015-07 | Con alumno de id `999999`, `POST` a `/api/clients/999999/water/add`, `/api/clients/999999/supplements`, `/api/clients/999999/nutrition/plan`, `/api/clients/999999/nutrition/meals` y `/api/physical-records/client/999999` responden 404 con `Cliente no encontrado con id: 999999`. |  |
| AC-0015-08 | `DELETE /api/physical-records/999999` responde 404 con `Registro físico no encontrado con id: 999999`. `DELETE /api/clients/{id}/nutrition/meals/999999` con un alumno real responde 404 con `Comida no encontrada con id: 999999`. |  |
| AC-0015-09 | `POST /api/payments/product` con un ítem de producto `999999` responde 404 con `Producto no encontrado con id: 999999`. |  |
| AC-0015-10 | `POST /api/payments/monthly` del plan "Mensual" a un alumno que ya lo tiene vigente hasta el `2026-10-06` responde 409 con el mensaje exacto `Ya existe un pago del plan 'Mensual' vigente hasta 06/10/2026.` |  |
| AC-0015-11 | `POST /api/assistance` de un alumno cuya última cuota venció el `2026-09-28` responde 409 con el mensaje exacto `La membresía del alumno ha vencido el: 28/09/2026`. |  |
| AC-0015-12 | La fecha `2027-01-05` se escribe `05/01/2027` en un mensaje, también con el locale por defecto de la JVM puesto en `en_US`. |  |
| AC-0015-13 | Un test recorre `src/main/java` y no encuentra, en el texto literal de ningún `new …Exception(…)`, las expresiones `not found`, `not exists`, `cannot`, `invalid`, `duplicate`, `in use`, `is assigned` ni `have registers` (sin distinguir mayúsculas), fuera de `service/AuthService.java` y `security/CustomUserDetailsService.java`. Si se agrega una, el test falla y nombra el archivo y la línea. Cubre también los literales que quedan en la línea siguiente al `new`. |  |

## Fuera de alcance

- **Status de las reglas de negocio que hoy salen como 404.** Los tres borrados bloqueados de la tabla B y "El cliente ya está desactivado" se lanzan como `ResourceNotFoundException`, cuando la spec 0001 pide 409 para una regla de negocio. Cambiar el status puede afectar cómo reacciona el frontend a esos borrados, y eso hay que mirarlo aparte. Queda anotado como BUG-27. Por eso `AC-0015-02` y `AC-0015-06` fijan el mensaje y no el status.
- **Login** (`AuthService`). "User not found with email" y "Invalid credentials!" no llegan al usuario: `LoginPage` muestra su propio texto fijo. El problema real es otro: la contraseña incorrecta sale como 500 y dispara el `alert()` del interceptor. Arreglarlo es cambiar el status a 401, y el interceptor de `lib/axios.ts` trata el 401 como "sesión expirada". Va junto con DES-16, en la spec de frontend.
- **Mensajes de éxito en inglés** ("Routine created successfully", "Payments founds successfully!", 60 en los controllers). El frontend no los muestra: arma sus propios toasts de éxito. Traducirlos no cambia nada que el usuario vea.
- **Validaciones de `RoutineRequestDTO`** ("Name cannot be blank"). `RoutineController` no usa `@Valid`, así que nunca se disparan. Activarlas cambia el contrato de crear y editar rutinas: es la deuda de `@Valid` que la spec 0001 ya dejó para una spec por módulo.
- **"Cliente" o "alumno" en los mensajes.** La UI dice "alumno" y los mensajes vigentes mezclan los dos. Unificarlo toca los textos que ya tradujo la spec 0001 y sus tests.
- **"No se encontró la clase con id 7"** (`GroupClassService`). Está en español con otra forma. No es un bug de experiencia.
- **El `alert()` nativo del interceptor y el `window.confirm`** (DES-16, DES-15): frontend.
- **Fechas en el PDF de cierre.** Ya salen en `dd/MM/yyyy HH:mm hs` por la spec 0010.

## Notas de handoff

**Qué se asumió:**

- El alcance es "todo texto de excepción en inglés que puede llegar al usuario", no solo los 26 `ResourceNotFoundException` que contó la bitácora. Dejar "Exercise in use in some RoutineExercise" en inglés por no ser un "not found" no cerraría el bug.
- Los mensajes nuevos copian la forma de los que ya están en español (`Cliente no encontrado con id: 5`), con el id incluido, como pide `AC-0001-06`.
- "La membresía del alumno ha vencido el: " conserva su texto y solo cambia la fecha. El test de `AC-0010-02` afirma "ha vencido".
- "El ID no puede ser nulo." no tiene test por HTTP: el id llega por la ruta y nunca es nulo. Lo cubre el test de `AC-0015-13`.
- La fecha se formatea con un patrón numérico fijo, en un único lugar reutilizable, igual que `MoneyFormatter` para los montos.

**Decisiones de aprobación (07/10/2026, Agustín):**

Aprobada como estaba escrita, sin cambios. Las dos preguntas abiertas quedan con lo que proponía la spec:

1. El status de las reglas de negocio (BUG-27) **no entra**. Sigue fuera de alcance.
2. El mensaje de un `MealLog` inexistente dice **"Comida no encontrada"**.

**Qué es lo más probable que salga mal:**

- **Los dos tests de la spec 0001 que afirman la fecha en ISO** (`AssistanceControllerErrorsTest` y `PaymentControllerErrorsTest`, con `expirationDate.toString()`). Van a fallar en cuanto cambie el formato. Hay que actualizarlos en la misma tarea, no desactivarlos.
- **Que el test de `AC-0015-13` dé una falsa tranquilidad.** Busca una lista de expresiones, no "inglés" en general: un mensaje nuevo como "Wrong plan" pasa sin que nadie lo note. Los tests por endpoint (`AC-0015-01` a `09`) son los que de verdad cubren los textos de hoy.
- **Los `PUT` con entidad en el cuerpo** (`Product`, `Exercise`, `Professor`, `MonthlyType`). Si el cuerpo del test no deserializa, responde 400 antes de llegar al 404 y el test falla por otra razón.
- **Permisos por rol.** Si algún endpoint de administradores exige `ADMIN`, un test con rol `PROFESSOR` responde 403 y no 404.
- **`DELETE /api/exercises/{id}` revisa primero si está en uso** y después si existe. Con un id inexistente tiene que llegar al segundo chequeo: verificarlo con el test rojo antes de tocar el texto.
