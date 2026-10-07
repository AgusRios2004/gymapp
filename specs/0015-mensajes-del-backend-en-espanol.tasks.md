# Tareas — 0015 — Mensajes de error del backend en español y con fechas legibles

Spec: [`0015-mensajes-del-backend-en-espanol.md`](./0015-mensajes-del-backend-en-espanol.md)

El tamaño es relativo (S/M), no horas. Todo es backend: `@SpringBootTest` + `MockMvc` sobre H2, con DNIs únicos por test y el reloj fijo de ADR-0011 donde hay fechas. T1 a T4 son independientes entre sí porque tocan archivos distintos. T5 va al final: su test queda rojo hasta que T2, T3 y T4 terminen.

En todas: test rojo primero, con el mensaje exacto de la spec. No se cambia ningún status ni el tipo de ninguna excepción (BUG-27 está fuera de alcance).

---

## T1 — Fechas `DD/MM/AAAA` en los mensajes

**Toca:** `util/DateFormatter.java` (nuevo), `service/PaymentService.java`, `service/AssistanceService.java`, `src/test/java/.../util/DateFormatterTest.java` (nuevo), `src/test/java/.../controller/AssistanceControllerErrorsTest.java`, `src/test/java/.../controller/PaymentControllerErrorsTest.java`
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** AC-0015-10, 11, 12

- `DateFormatter` sigue el patrón de `MoneyFormatter`: clase final, método estático, patrón numérico fijo `dd/MM/yyyy`, sin depender del locale de la JVM.
- AC-12: el test pone `Locale.setDefault(Locale.US)` y lo restaura al terminar.
- AC-10 y AC-11 se agregan a los dos tests de errores que ya existen, con la fecha fija de la spec (reloj fijo, no `LocalDate.now()`).
- Las aserciones de `AC-0001-08` y `AC-0001-09` (`contains(expirationDate.toString())`) pasan a comparar contra la fecha en `DD/MM/AAAA`. No se desactivan.
- `AssistanceServiceClockTest` afirma "ha vencido": tiene que seguir en verde sin tocarlo.

---

## T2 — Catálogos: ejercicios, tipos de plan, productos, profesores y administradores

**Toca:** `controller/ExerciseController.java`, `service/ExerciseService.java`, `controller/MonthlyTypeController.java`, `service/MonthlyTypeService.java`, `controller/ProductController.java`, `service/ProductService.java`, `controller/ProfessorController.java`, `service/ProfessorService.java`, `service/AdministratorService.java`, `src/test/java/.../controller/CatalogNotFoundMessagesTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0015-01, 02

- Son cinco módulos, pero el mismo cambio mecánico de texto en cada uno. Se verifican juntos con un test parametrizado (ruta, verbo, mensaje): 15 combinaciones.
- `ExerciseController` línea 30: hoy el mensaje no incluye el id. Agregarlo.
- `ExerciseService.deleteExercise`: revisa primero si está en uso y después si existe. Confirmar con el test rojo que un id inexistente llega al segundo chequeo.
- `AdministratorService`: los tres "ID cannot be null" pasan a "El ID no puede ser nulo." (sin test por HTTP, lo cubre T5).
- AC-02: armar el ejercicio dentro de una rutina y el tipo de plan con un pago. Después del `DELETE`, un `GET` del recurso sigue respondiendo 200. No afirmar el status del `DELETE`.
- Los `PUT` llevan un cuerpo que deserialice en la entidad de cada módulo. Si un endpoint exige rol `ADMIN`, el test usa ese rol.

---

## T3 — Rutinas

**Toca:** `service/RoutineService.java`, `src/test/java/.../controller/RoutineErrorMessagesTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0015-03, 04, 05, 06

- Ocho textos en `RoutineService`: tres "Routine not found with id", "Exercise not found with id", "Client not found", "Routine not found" (asignación), "The routine is assigned…" y "Duplicate day found…".
- En la asignación, los dos mensajes hoy no dicen "with id": quedan con la misma forma que el resto (`… con id: <id>`).
- AC-05, día repetido: los dos días llevan ejercicios reales, para que la respuesta sea la del día repetido y no la del ejercicio inexistente.
- AC-06: asignar la rutina a un alumno con el fixture mínimo (`Routine` + `Client` con `routineActive`), y no afirmar el status del `DELETE`.
- `RoutineExerciseWeightTest` ya arma rutinas con ejercicios: sirve de modelo para el cuerpo del `POST`.

---

## T4 — Ficha del alumno y venta de productos

**Toca:** `service/WaterLogService.java`, `service/SupplementService.java`, `service/NutritionService.java`, `service/PhysicalRecordService.java`, `mapper/PaymentMapper.java`, `src/test/java/.../controller/ClientRecordsNotFoundMessagesTest.java` (nuevo), `src/test/java/.../controller/PaymentControllerErrorsTest.java`
**Depende de:** ninguna (si se hace en paralelo con T1, las dos tocan `PaymentControllerErrorsTest.java`: mergear T1 primero)
**Tamaño:** M
**Cubre:** AC-0015-07, 08, 09

- "Client not found with id" pasa al texto que ya usa `ClientService`: `Cliente no encontrado con id: <id>`.
- AC-07: cada `POST` lleva un cuerpo válido para su endpoint. `HabitLogResponseTest` y `NutritionResponseTest` (spec 0014) sirven de modelo para agua, suplementos y comidas; el del plan y el del registro físico hay que armarlos.
- AC-08: la comida se borra por `mealId`, con un alumno real en la ruta.
- AC-09: en `PaymentMapper` el literal está en la línea siguiente al `new`. Se agrega al test de errores de pagos, junto a `AC-0001-10`.

---

## T5 — Test que impide que vuelva un mensaje en inglés

**Toca:** `src/test/java/.../exception/ExceptionMessagesLanguageTest.java` (nuevo), `specs/0015-mensajes-del-backend-en-espanol.md` (columna Test y estado), `docs/notes/BITACORA_QA.md` (BUG-22 y BUG-26 a ✅)
**Depende de:** T2, T3, T4
**Tamaño:** S
**Cubre:** AC-0015-13

- Mismo enfoque que el test de `AC-0010-12` (recorre `src/main/java` y nombra archivo y línea).
- Busca el literal de cada `new …Exception(`, incluido el que queda en la línea siguiente (caso `PaymentMapper`, `ProductService`, `RoutineService`).
- Excluye por nombre `service/AuthService.java` y `security/CustomUserDetailsService.java` (login, fuera de alcance).
- Verificar el test por mutación: volver a poner "Product not found" en un archivo y confirmar que falla nombrándolo.
- Al cerrar: `bash .harness/scripts/verify.sh` en verde, spec a `implementada`, y BUG-22 y BUG-26 a ✅ en la bitácora y en la memoria de pendientes.
