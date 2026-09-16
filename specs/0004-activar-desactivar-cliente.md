---
id: 0004
titulo: Activar y desactivar clientes desde la tabla
estado: implementada             # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 13/09/2026
adrs_relacionados: []
---

## Objetivo

Que la recepción pueda dar de baja o reactivar a un alumno con un solo click desde la tabla de clientes, y que un alumno dado de baja no pueda seguir usando el gimnasio ni ocupando cupo en una clase hasta que lo reactiven.

Hoy la baja existe solo como `DELETE /api/clients/{id}` (desactiva) o editando el cliente en el modal; no hay reactivación directa y la baja no tiene efectos sobre asistencias, cobros ni clases.

Cubre las tareas T-08 y T-25 del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md).

## Restricciones

Reglas de negocio decididas el 13/09/2026:

1. **Al desactivar un cliente se le quita la clase grupal asignada** (libera el cupo). Reactivarlo **no** le devuelve la clase: hay que asignarla de nuevo.
2. **Un cliente inactivo no puede registrar asistencia ni pagar una cuota** hasta que lo reactiven: ambas operaciones responden 409.

Decididas al aprobar, el 14/09/2026:

3. **A un cliente inactivo tampoco se le venden productos** (POS): `POST /api/payments/product` responde 409.
4. **Activan y desactivan ADMIN y PROFESSOR** (la recepción la atiende cualquiera de los dos). Cualquier otra persona autenticada recibe 403, igual que en la spec 0002.
5. **Desactivar pide confirmación** porque le quita la clase. Reactivar no la pide.

Además:

- Errores con el formato de la spec 0001 (`WebApiResponse`, `message` en español; reglas de negocio → 409).
- Las reglas de quién cobra/registra de la spec 0002 no cambian.

## Comportamiento esperado

1. `PATCH /api/clients/{id}/status` con body `{ "active": true | false }` fija el estado y devuelve el cliente actualizado. Es **idempotente**: pedir el estado que ya tiene responde 200 sin cambios.
2. Pasar a inactivo pone `activeClass` en null.
3. `POST /api/assistance`, `POST /api/payments/monthly` y `POST /api/payments/product` para un cliente inactivo responden 409 **antes** de cualquier otra validación (membresía, plan duplicado, stock).
4. **Tabla de clientes** (`ClientsPage`): cada fila tiene un interruptor de estado. Al tocarlo se llama al endpoint, y la fila refleja el estado nuevo cuando el backend confirma. Si el backend falla, el interruptor vuelve a su posición anterior y se muestra el error.
5. **Confirmación al desactivar:** tocar el interruptor de un cliente activo pide confirmación (`window.confirm`, como el resto del front) avisando que se le quita la clase asignada. Si se cancela, no se llama al endpoint. Reactivar llama directo.

## Casos de borde

- **Id inexistente:** 404 en español con el id.
- **Body sin `active`, con `active: null` o con un string:** 400 en español.
- **Desactivar un cliente sin clase asignada:** 200, sin error.
- **Reactivar un cliente:** queda activo y sin clase.
- **Doble click rápido sobre el interruptor:** como el endpoint fija el estado (no alterna), dos pedidos iguales dejan el mismo resultado. El interruptor queda deshabilitado mientras hay un pedido en curso.
- **Cliente inactivo con cuota vigente:** la asistencia igual se rechaza por estar inactivo.
- **Venta de productos a un cliente inactivo:** 409, no se persiste el pago y el stock no cambia.
- **Se cancela la confirmación:** no hay pedido al backend y la fila sigue "Activo".
- **Persona autenticada que no es ADMIN ni PROFESSOR:** 403 en el `PATCH`, sin cambios.
- **Cliente desactivado con el filtro "Activos" puesto en la tabla:** desaparece de la lista al refrescar.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0004-01 | `PATCH /api/clients/{id}/status` con `{"active": false}` sobre un cliente activo responde 200, y un `GET /api/clients/{id}` posterior devuelve `active: false`. |  |
| AC-0004-02 | Desactivar con `PATCH` un cliente asignado a una clase lo deja sin clase: `GET /api/classes/{idClase}/students` ya no lo incluye. |  |
| AC-0004-03 | `PATCH` con `{"active": true}` sobre un cliente inactivo responde 200, lo deja `active: true` y sin clase asignada. |  |
| AC-0004-04 | `PATCH` con `{"active": false}` sobre un cliente que ya está inactivo responde 200 y no cambia nada (idempotente). |  |
| AC-0004-05 | `PATCH /api/clients/{id}/status` con un id inexistente responde 404 con `message` en español que incluye el id; con body `{}` o `{"active": "si"}` responde 400 en español. |  |
| AC-0004-06 | `POST /api/assistance` para un cliente inactivo que tiene cuota vigente responde 409 con `message` en español que dice que el cliente está inactivo, y no se guarda la asistencia. |  |
| AC-0004-07 | `POST /api/payments/monthly` para un cliente inactivo responde 409 con `message` en español y no se persiste ningún pago. |  |
| AC-0004-08 | En `ClientsPage`, tocar el interruptor de un cliente activo y aceptar la confirmación llama al servicio con `active: false` para ese id, y la fila muestra "Inactivo" después de que el servicio responde. |  |
| AC-0004-09 | En `ClientsPage`, si el servicio de cambio de estado falla, el interruptor vuelve a mostrar el estado anterior y la fila no cambia a "Inactivo". |  |
| AC-0004-10 | Mientras el pedido de cambio de estado está en curso, el interruptor de esa fila está deshabilitado. |  |
| AC-0004-11 | `POST /api/payments/product` para un cliente inactivo responde 409 con `message` en español, no se persiste ningún pago y el stock de los productos no cambia. |  |
| AC-0004-12 | Autenticado como PROFESSOR, `PATCH /api/clients/{id}/status` con `{"active": false}` responde 200 y desactiva al cliente; autenticado como una persona que no es ADMIN ni PROFESSOR (un `Client` con email), responde 403 y el cliente sigue activo. |  |
| AC-0004-13 | En `ClientsPage`, tocar el interruptor de un cliente activo y **cancelar** la confirmación no llama al servicio y la fila sigue "Activo"; tocar el interruptor de un cliente **inactivo** llama al servicio con `active: true` sin pedir confirmación. |  |

## Fuera de alcance

- **Diálogo de confirmación con estilo propio:** se usa `window.confirm` como en `ClientModal`, `EditRoutineModal` y `MonthlyTypesPage`. Un modal consistente con el design system es trabajo del Sprint 2.
- **`DELETE /api/clients/{id}`:** se deja como está (hoy desactiva y responde 404 si ya estaba inactivo, que es incorrecto). Cambiarlo rompe al que lo use; se anota para cuando se decida si el `DELETE` sigue existiendo.
- **Historial de bajas y altas** (quién y cuándo): no se pidió; requeriría una tabla nueva.
- **Quitar la rutina activa al desactivar:** la regla habla solo de la clase grupal.

## Notas de handoff

**Qué se asumió:**
- Endpoint `PATCH /api/clients/{id}/status` con el estado explícito, en lugar del `toggle-status` que nombra el sprint: un toggle no es idempotente y un doble click deja el estado al revés.
- El body se valida con un `RequestDTO` chico (`ClientStatusRequestDTO` con `@NotNull Boolean active`) y `@Valid`, siguiendo `GEMINI.md` §3.1.
- El chequeo de "cliente inactivo" en asistencias, cuotas y productos va en el service, antes de las validaciones de la spec 0001.
- Hoy `SecurityConfig` no restringe `/api/clients/**` por rol: PROFESSOR ya pasa. El 403 para quien no es ADMIN ni PROFESSOR se resuelve con el mismo mecanismo que usó la spec 0002 en pagos y asistencias.

**Decisiones de aprobación (14/09/2026, Agustín):**
1. Venta de productos a un cliente inactivo → **se rechaza** con 409 (AC-0004-11).
2. Activar/desactivar → **ADMIN y PROFESSOR**; el resto, 403 (AC-0004-12).
3. Desactivar **pide confirmación**; reactivar no (AC-0004-08, AC-0004-13).

**Qué es lo más probable que salga mal:**
- **Romper tests de las specs 0001 y 0002.** Los tests de asistencias y pagos crean clientes con `setActive(true)`; si alguno los crea sin ese campo, el nuevo 409 los va a hacer fallar por la razón equivocada. Revisarlos antes de tocar los services.
- **El orden de las validaciones en asistencias.** AC-0004-06 usa un cliente inactivo **con cuota vigente** a propósito: si el chequeo de inactivo queda después del de membresía, el test con un cliente sin cuota pasaría igual con 409 por otra razón.
- **Tests de front que no mockean `window.confirm`.** En jsdom `window.confirm` no está implementado; AC-0004-08 y AC-0004-13 tienen que usar `vi.spyOn(window, 'confirm')` devolviendo `true` o `false` explícitamente.
- **El interruptor en `ClientItem` dentro de una fila clickeable.** Si la fila abre el detalle al hacer click, el interruptor tiene que frenar la propagación; si no, cambiar el estado también navega.
