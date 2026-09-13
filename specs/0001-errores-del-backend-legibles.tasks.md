# Tareas — 0001 — Errores del backend legibles y en español

Spec: [`0001-errores-del-backend-legibles.md`](./0001-errores-del-backend-legibles.md)

Tamaño relativo (S/M), no horas. Todo en `gymapp-back/`. Tests con `@SpringBootTest` + `MockMvc` sobre el perfil de test con H2 (`src/test/resources/application.properties`); nunca contra la MySQL local.

---

## T1 — `GlobalExceptionHandler`: un formato de error y un mapeo por tipo

**Toca:** `exception/GlobalExceptionHandler.java`, `exception/BusinessRuleException.java` (nueva), `src/test/java/.../exception/GlobalExceptionHandlerTest.java`
**Depende de:** ninguna
**Tamaño:** M
**Cubre:** AC-0001-05, AC-0001-06, AC-0001-11, y la base de AC-0001-12

- Todas las respuestas pasan a `WebApiResponseBuilder.failure(message)` o `failure(message, data)`. Hoy devuelven un `Map` con `error` y `message`; el frontend lee `message`, que se mantiene.
- Handlers, de más específico a más general:
  - `MethodArgumentNotValidException` → 400. `data` = mapa `campo → mensaje` con **todos** los errores; `message` los junta.
  - `HttpMessageNotReadableException` → 400, mensaje genérico en español (sin el texto de Jackson).
  - `IllegalArgumentException` → 400, mensaje de la excepción (se mantiene).
  - `ResourceNotFoundException` → 404 (se mantiene).
  - `BusinessRuleException` (nueva, `extends RuntimeException`) → 409.
  - `DataIntegrityViolationException` → 409, mensaje genérico en español.
  - `Exception` → 500, `"Error inesperado, intentá de nuevo."`. Loguear con el logger de SLF4J, no `printStackTrace()`.
- Si la excepción trae `message` null, usar un texto por defecto del handler en vez de devolver null.
- Traducir el `ResourceNotFoundException` de `ClientController.getClientById` y de `ClientService` (AC-0001-06).

Para AC-0001-11 hace falta un endpoint que tire una excepción no mapeada. No agregarlo a producción: mockear el service con `@MockitoBean` en el test.

---

## T2 — Clientes: `ClientRequestDTO` con `@Valid` en alta y edición

**Toca:** `dto/request/ClientRequestDTO.java`, `controller/ClientController.java`, `mapper/ClientMapper.java`, `service/ClientService.java`, `src/test/java/.../controller/ClientControllerValidationTest.java`
**Depende de:** T1
**Tamaño:** M
**Cubre:** AC-0001-01, AC-0001-02, AC-0001-03, AC-0001-04, AC-0001-13, BUG-15

- Mensajes de `ClientRequestDTO` en español. `phone`: el mensaje dice el mínimo real (BUG-15).
- Sumar al DTO los campos que manda hoy el formulario y el DTO no declara (`email`, `active`, más los que falten al comparar contra `ClientSchema` del frontend). **Antes de escribir código**, listar esa diferencia en el commit: un campo olvidado se descarta sin error y rompe la edición en silencio.
- `createClient` y `updateClient` reciben `@Valid @RequestBody ClientRequestDTO`. La conversión DTO → entidad va en `ClientMapper`, no en el controller.
- Traducir el mensaje de DNI duplicado de `ClientService`.
- `name` y `lastName`: `@Size(min = 2, max = 15)`, con mensaje en español (AC-0001-13).

---

## T3 — Asistencias: reglas de membresía como 409

**Toca:** `service/AssistanceService.java`, `src/test/java/.../controller/AssistanceControllerErrorsTest.java`
**Depende de:** T1
**Tamaño:** S
**Cubre:** AC-0001-07, AC-0001-08

- "Sin membresía registrada" y "membresía vencida" pasan de `RuntimeException` a `BusinessRuleException`. El segundo mantiene la fecha en el mensaje.
- Traducir `"Client ID and Staff ID cannot be null"` y `"Staff member not found with id"`.
- El test de AC-0001-08 arma el pago con `expirationDate` = ayer, relativa a `LocalDate.now()` y no a una fecha fija, o se rompe solo al pasar los días.

---

## T4 — Pagos: duplicado, cambio de plan y stock como 409, sin descontar stock a medias

**Toca:** `service/PaymentService.java`, `src/test/java/.../controller/PaymentControllerErrorsTest.java`
**Depende de:** T1
**Tamaño:** M
**Cubre:** AC-0001-09, AC-0001-10

- `createMonthlyPayment`: "pago duplicado" y "cambio a plan menor o equivalente" → `BusinessRuleException`, mensajes en español. El de duplicado mantiene la fecha de vencimiento.
- `createProductPayment`: "stock insuficiente" → `BusinessRuleException`. **Validar el stock de todos los ítems antes de descontar ninguno** y marcar el método `@Transactional`. Hoy descuenta dentro del `map` y un fallo en el tercer ítem deja guardados los dos primeros.
- Traducir los `ResourceNotFoundException` de este service.
- `Professor not found` **no** se toca más allá de traducirlo: resolver el profesor desde el JWT es la spec 0002.
