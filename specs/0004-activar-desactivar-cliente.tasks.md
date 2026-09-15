# Tareas — 0004 — Activar y desactivar clientes desde la tabla

Spec: [`0004-activar-desactivar-cliente.md`](./0004-activar-desactivar-cliente.md)

Tamaño relativo (S/M), no horas. T1–T2 backend (`@SpringBootTest` + `MockMvc` sobre H2), T3 frontend (vitest + Testing Library, servicios mockeados).

---

## T1 — `PATCH /api/clients/{id}/status`

**Toca:** `dto/request/ClientStatusRequestDTO.java` (nuevo), `controller/ClientController.java`, `service/ClientService.java`, `src/test/java/.../controller/ClientStatusTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** AC-0004-01, 02, 03, 04, 05, 12

- DTO con `@NotNull Boolean active`. Un string en `active` ya cae en `HttpMessageNotReadableException` → 400 (spec 0001).
- `ClientService.setStatus(id, active)`: primero el rol, con `AuthenticatedStaffService` igual que `AssistanceService.registerAssistance` (`esAdmin`/`esProfesor`, si no `AccessDeniedException` → 403). Después 404 si no existe; si `active == false`, `activeClass = null`; si el estado ya es el pedido, devolver sin cambios.
- Los tests se autentican con una `Person` real en H2 (ADMIN, PROFESSOR y un `Client` con email), como los de la spec 0002.
- No tocar `deactivateClient` ni el `DELETE` (fuera de alcance).

---

## T2 — Cliente inactivo: sin asistencia, cuota ni productos

**Toca:** `service/AssistanceService.java`, `service/PaymentService.java`, `src/test/java/.../controller/InactiveClientRulesTest.java` (nuevo)
**Depende de:** ninguna (independiente de T1: los tests crean el cliente inactivo directo en el repositorio)
**Tamaño:** S
**Cubre:** AC-0004-06, AC-0004-07, AC-0004-11

- Inmediatamente después de cargar el cliente, `if (!client.isActive()) throw new BusinessRuleException("El cliente está inactivo. Reactivalo para ...")`.
  - En `registerAssistance`: antes del chequeo de membresía.
  - En `createMonthlyPayment`: antes del chequeo de plan vigente.
  - En `createProductPayment`: antes de validar y descontar stock (AC-0004-11 verifica que el stock no cambie).
- Correr los tests de las specs 0001 y 0002 antes de cerrar: si alguno crea clientes sin `active = true`, corregir el setup del test, no la regla.

---

## T3 — Interruptor de estado en la tabla de clientes

**Toca:** `services/clientService.ts` (`setClientStatus(id, active)`), `components/clients/ClientItem.tsx`, `pages/ClientsPage.tsx`, `pages/ClientsPage.test.tsx` (nuevo)
**Depende de:** T1 (contrato)
**Tamaño:** M
**Cubre:** AC-0004-08, AC-0004-09, AC-0004-10, AC-0004-13

- `ClientItem` recibe `onToggleStatus(client)` y `isUpdating`. El interruptor reemplaza o acompaña el badge "Activo/Inactivo" actual y hace `stopPropagation` si la fila es clickeable.
- Al desactivar, `window.confirm("¿Desactivar a <nombre>? Se le va a quitar la clase asignada.")`; si devuelve `false`, no se dispara la mutación. Al reactivar, sin confirmación. En los tests, `vi.spyOn(window, 'confirm')` con valor explícito.
- `ClientsPage`: `useMutation` que llama a `setClientStatus`; en éxito invalida `['clients']`; en error muestra el `message` del backend y no deja la fila cambiada (AC-0004-09). Guardar el id en curso para deshabilitar solo esa fila (AC-0004-10).
- Estilo del interruptor según `docs/DESIGN_SYSTEM.md` (emerald para activo).
