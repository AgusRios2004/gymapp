---
id: 0001
titulo: Errores del backend legibles y en español
estado: implementada         # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 13/09/2026
adrs_relacionados: [ADR-0005]
---

## Objetivo

Que ningún error del backend llegue al usuario en crudo, en inglés o como un 500 genérico cuando en realidad es una regla de negocio. El frontend muestra literal el `message` que devuelve el back (regla global del refactor), así que el back tiene que devolver siempre un `message` que un recepcionista del gimnasio pueda leer y entender.

Cubre las tareas T-01, T-02, T-05 y T-06 del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md), y BUG-15 de la [bitácora de QA](../docs/notes/BITACORA_QA.md).

## Restricciones

- Formato de respuesta: `WebApiResponse` vía `WebApiResponseBuilder.failure(...)` — `{ "succes": false, "message": "...", "data": ... }`. El campo se llama `succes` (sic) y **no se renombra**: el frontend ya lo consume.
- Los controllers reciben un `RequestDTO` con `@Valid` (`gymapp-back/GEMINI.md` §3.1).
- No cambiar el contrato de entrada que ya usa el frontend al crear y editar clientes: los campos que hoy manda `gym-frontend/src/services/clientService.ts` tienen que seguir aceptándose y persistiéndose.
- No tocar el frontend. Mostrar el `message` en un toast es T-10, fuera de esta spec.

## Comportamiento esperado

1. **Toda respuesta de error** del API tiene cuerpo `WebApiResponse` con `succes: false` y un `message` no vacío en español.
2. **Validación de entrada** (`@Valid`): responde 400. `message` incluye el mensaje de cada campo inválido; `data` es un mapa `campo → mensaje`.
3. **Cuerpo mal formado** (JSON roto o tipo incorrecto): responde 400 con un mensaje genérico en español, sin detalles del parser de Jackson.
4. **Recurso inexistente**: responde 404 con el mensaje de la excepción, en español.
5. **Regla de negocio violada** (membresía inexistente o vencida, pago duplicado, cambio de plan no permitido, stock insuficiente): responde **409** con un mensaje que explica la regla. Hoy varias de estas salen como `RuntimeException` → 500.
6. **Violación de integridad de datos** no anticipada por el service: 409 con un mensaje genérico en español.
7. **Cualquier otra excepción**: 500 con `"Error inesperado, intentá de nuevo."`. El mensaje interno y el stack trace **no** viajan en la respuesta (se loguean).
8. **Clientes**: `POST /api/clients` y `PUT /api/clients/{id}` validan DNI obligatorio de exactamente 8 caracteres, con mensajes en español. Hoy **no validan nada**: el controller recibe la entidad `Client` directo, sin `@Valid`, y `ClientRequestDTO` no se usa en ningún lado.

## Casos de borde

- **DNI vacío, solo espacios, 7 o 9 caracteres:** 400. Un DNI con espacios alrededor que queda en 8 caracteres después del `trim` que ya hace `ClientService` se acepta.
- **Varios campos inválidos a la vez:** todos aparecen en `data` y en `message`, no solo el primero.
- **DNI duplicado:** sigue siendo 400 como hoy (`IllegalArgumentException` en `ClientService`), con el mensaje traducido.
- **Teléfono:** el mensaje coincide con el rango real de `@Size` (BUG-15: hoy dice "between 7 and 15" y el mínimo es 10).
- **Pago del mismo plan con uno activo:** 409, y el mensaje dice hasta qué fecha está vigente el actual.
- **Asistencia de un cliente que nunca pagó una cuota:** 409, no 500.
- **Asistencia de un cliente con la cuota vencida:** 409, y el mensaje incluye la fecha de vencimiento.
- **Venta con stock insuficiente:** 409 y **no** se descuenta stock de ningún producto del pedido, incluidos los que sí tenían stock.
- **Excepción con `message` null:** igual se responde con un `message` no vacío.
- **Nombres cortos:** `name` y `lastName` aceptan desde **2** caracteres (decisión del 13/09/2026). Hoy el DTO pide 4, lo que rechazaría "Ana" o "Gil" al activar `@Valid`. Un solo carácter se sigue rechazando.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0001-01 | `POST /api/clients` con `dni` vacío responde 400, `succes: false`, y `data.dni` es un mensaje en español que dice que el DNI es obligatorio. || `ClientControllerValidationTest` |
| AC-0001-02 | `POST /api/clients` con `dni` de 7 caracteres y `phone` de 5 responde 400 y `data` tiene **ambas** claves, `dni` y `phone`. El mensaje de `phone` menciona el mínimo real de 10. || `ClientControllerValidationTest` |
| AC-0001-03 | `POST /api/clients` con el payload completo que arma hoy el formulario (`ClientSchema` en `types/schema.type.ts`: `name`, `lastName`, `dni`, `phone`, `email`, `active`) y un DNI válido responde 200 y persiste esos campos: un `GET /api/clients/{id}` posterior los devuelve iguales. || `ClientControllerValidationTest` |
| AC-0001-04 | `PUT /api/clients/{id}` con `dni` de 9 caracteres responde 400 y el cliente en base no cambia. || `ClientControllerValidationTest` |
| AC-0001-05 | Un `POST` con JSON mal formado a cualquier endpoint de escritura responde 400 con `message` en español y sin el texto `JSON parse error` ni nombres de clases Java. || `GlobalExceptionHandlerTest` |
| AC-0001-06 | `GET /api/clients/{id}` con un id inexistente responde 404 con `succes: false` y `message` en español que incluye el id. || `GlobalExceptionHandlerTest` |
| AC-0001-07 | `POST /api/assistance` para un cliente sin ningún pago de cuota responde 409 con `message` en español. || `AssistanceControllerErrorsTest` |
| AC-0001-08 | `POST /api/assistance` para un cliente cuya última cuota venció ayer responde 409 y `message` contiene la fecha de vencimiento. || `AssistanceControllerErrorsTest` |
| AC-0001-09 | `POST /api/payments/monthly` del mismo plan que el cliente tiene vigente responde 409 y `message` contiene la fecha de vencimiento del plan actual. || `PaymentControllerErrorsTest` |
| AC-0001-10 | `POST /api/payments/product` donde un ítem pide más que su stock responde 409, y el stock de **todos** los productos del pedido queda igual que antes del request. || `PaymentControllerErrorsTest` |
| AC-0001-11 | Una excepción no mapeada lanzada desde un service responde 500 con `message` exactamente `"Error inesperado, intentá de nuevo."` y el cuerpo no contiene el mensaje original de la excepción. || `GlobalExceptionHandlerTest` |
| AC-0001-12 | Ninguna respuesta de error de los casos anteriores tiene `message` null, vacío o en inglés (los tests verifican el texto esperado, no solo el status). || `GlobalExceptionHandlerTest` |
| AC-0001-13 | `POST /api/clients` con `name` "Ana" y `lastName` "Gil" (y el resto válido) responde 200; con `name` "A" responde 400 y `data.name` tiene un mensaje en español. || `ClientControllerValidationTest` |

## Fuera de alcance

- **Mostrar el `message` en el frontend** (T-10): es otra capa y depende de que esto esté mergeado.
- **Validación de DNI en el formulario** (T-09): frontend.
- **`Professor not found` en la venta de productos** (T-03): no es un problema de mensaje sino de lógica (el profesor tiene que salir del JWT). Va en la spec 0002.
- **401 y 403 del filtro de Spring Security**: no pasan por `@RestControllerAdvice`, y el frontend ya los intercepta con su propio aviso en `lib/axios.ts`. No hay `@PreAuthorize` en el proyecto, así que no hay `AccessDeniedException` que mapear hoy.
- **Migrar a `RequestDTO` + `@Valid` el resto de los controllers** que reciben entidades (`Exercise`, `GroupClass`, `Product`, `Professor`, `MonthlyType`, etc.): es la misma deuda de `GEMINI.md` §3.1, pero cada uno cambia un contrato con el frontend. Una spec por módulo cuando se toque.
- **Traducir mensajes de los services fuera de clientes, pagos y asistencias** (rutinas, ejercicios, nutrición, administradores): no están en los criterios del Sprint 1.

## Notas de handoff

**Qué se asumió:**
- 409 para reglas de negocio. Alternativa razonable: 422. Se eligió 409 porque `gymapp-back/GEMINI.md` §3.3 ya lista 409 entre los códigos del handler, y no 422.
- Para no cambiar el contrato de clientes (AC-0001-03), a `ClientRequestDTO` le van a faltar campos que hoy manda el frontend (`email`, `active` y lo que haya en `ClientFormData`). Se asume que agregarlos al DTO es parte de esta spec.
- Los tests de controller levantan el contexto con H2 (perfil de test de T-32). Con `@WebMvcTest` hay que resolver el filtro JWT; con `@SpringBootTest` + `MockMvc` + `@WithMockUser` no.

**Decisiones de aprobación (13/09/2026, Agustín):**
1. Reglas de negocio → **409**.
2. El `message` de validación **nombra todos** los campos inválidos; `data` lleva el mapa `campo → mensaje`.
3. `name` y `lastName`: mínimo **2** caracteres (AC-0001-13).

**Qué es lo más probable que salga mal:**
- **AC-0001-03.** Pasar de la entidad `Client` a `ClientRequestDTO` en el controller es el cambio con más riesgo de romper en silencio el alta o la edición desde el frontend: un campo que el DTO no declara se descarta sin error. Por eso ese criterio exige hacer el round-trip con el payload real de `clientService.ts`, no con uno inventado.
- **AC-0001-10.** Hoy `createProductPayment` descuenta stock producto por producto dentro del `map`, y `PaymentService` no es `@Transactional`. Si el tercer ítem no tiene stock, los dos primeros ya se guardaron. Arreglarlo requiere que el método sea transaccional o que valide todo antes de descontar.
- **Corrección a la revisión del 06/09:** la bitácora dice que el backend "sí valida" el DNI (`ClientRequestDTO.java:29`). Es falso: ese DTO no lo usa ningún controller. BUG-03 era real en el backend.
