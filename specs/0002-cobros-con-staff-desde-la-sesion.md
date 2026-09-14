---
id: 0002
titulo: Cobros y asistencias con el staff tomado de la sesión
estado: aprobada             # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 13/09/2026
adrs_relacionados: []
---

## Objetivo

Que vender productos, cobrar cuotas y registrar asistencias funcione igual para ADMIN y PROFESSOR, y que el backend no confíe en el front para saber quién cobra.

Hoy la venta de productos falla cuando la hace un ADMIN (`"Profesor no encontrado con id: 1"`): el front manda el id del usuario logueado como `idProfessor`, y el ADMIN no es un `Professor`. A la vez, cualquier PROFESSOR puede registrar un cobro a nombre de otro cambiando ese campo.

Cubre las tareas T-03, T-11 y T-12 del [Sprint 1](../docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md) y los bugs BUG-04, BUG-05 y BUG-11 de la [bitácora de QA](../docs/notes/BITACORA_QA.md).

## Restricciones

Reglas de negocio decididas el 13/09/2026:

1. **PROFESSOR:** en pagos (cuotas y productos) y asistencias, quien cobra o registra es **siempre el profesor del token**. Si el pedido trae un `idProfessor`, el backend **lo ignora**; no responde error.
2. **ADMIN en pagos:** **elige el profesor** que cobra. Es obligatorio. El cobro no puede quedar a nombre del ADMIN: `Payment.professor` sigue siendo un `Professor` y **no se cambia el esquema**.
3. **Asistencias:** quedan **siempre a nombre de quien la marca**, para todos los roles, tomado del token. El ADMIN no elige profesor.

Además:

- La identidad sale del JWT: el `username` del contexto de seguridad es el email de la `Person` (`CustomUserDetailsService`).
- Formato de error de la spec 0001: `WebApiResponse` con `succes: false` y `message` en español.
- Ningún cambio de base de datos.

## Comportamiento esperado

1. `POST /api/payments/product` y `POST /api/payments/monthly`:
   - **PROFESSOR:** el pago queda a nombre del profesor autenticado. `idProfessor` del body es opcional y se ignora.
   - **ADMIN:** `idProfessor` es obligatorio y tiene que ser un `Professor` existente y **activo**. Si falta → 400. Si no existe o no es profesor → 404. Si está inactivo → 409 (regla de negocio, misma convención que la spec 0001). En ningún caso se persiste nada ni se descuenta stock.
2. `POST /api/assistance`: `staff` es la persona autenticada. `idProfessor` del body se ignora.
3. **Punto de venta** (`ProductsPage`, pestaña POS):
   - PROFESSOR: no ve selector de profesor.
   - ADMIN: ve un selector de profesor obligatorio. "Confirmar venta" queda deshabilitado hasta tener cliente, profesor y al menos un producto.
   - Elegir un cliente de la búsqueda deja su nombre visible en el campo y habilita la venta.
4. **Cobro de cuotas** (`PaymentsPage`):
   - ADMIN: el selector de profesor arranca **vacío**. Hoy arranca con el id del propio admin, que no es un profesor válido.
   - PROFESSOR: no ve selector.
5. **Asistencias** (`AttendancePage`): sin cambios visibles. El backend deja de depender del `idProfessor` que manda el front.

## Casos de borde

- **ADMIN manda su propio id como `idProfessor`:** 404, porque no es profesor. Es exactamente el BUG-05 de hoy.
- **Usuario autenticado que no es ADMIN ni PROFESSOR** (rol `USER`): hoy no existe login de alumno. Si llega uno, pagos y asistencias responden 403 (decisión del 13/09/2026).
- **ADMIN elige un profesor inactivo:** 409 y no se registra el cobro (decisión del 13/09/2026).
- **Token válido de una persona borrada después del login:** 401. No puede terminar en 500 ni en un pago sin profesor.
- **Búsqueda de cliente con clientes sin DNI:** hay clientes con `dni` null, creados antes de la spec 0001. La búsqueda no rompe y los muestra por nombre.
- **ADMIN cambia de profesor después de agregar productos al carrito:** el carrito se conserva.
- **Venta rechazada por el backend** (400/404/409): el carrito y el cliente elegido no se pierden.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0002-01 | Autenticado como PROFESSOR, `POST /api/payments/product` **sin** `idProfessor` responde 200 y el pago persistido tiene como profesor al del token. |  |
| AC-0002-02 | Autenticado como PROFESSOR A, `POST /api/payments/product` con `idProfessor` del profesor B responde 200 y el pago queda a nombre de **A**. |  |
| AC-0002-03 | Autenticado como ADMIN, `POST /api/payments/product` con `idProfessor` de un profesor existente responde 200 y el pago queda a nombre de ese profesor. |  |
| AC-0002-04 | Autenticado como ADMIN, `POST /api/payments/product` sin `idProfessor` responde 400 con `message` en español que pide elegir el profesor, y el stock de los productos del pedido no cambia. |  |
| AC-0002-05 | Autenticado como ADMIN, `POST /api/payments/product` con `idProfessor` igual al id del propio admin responde 404 con `message` en español que incluye ese id, y el stock no cambia. |  |
| AC-0002-06 | Autenticado como PROFESSOR A, `POST /api/payments/monthly` con `idProfessor` del profesor B responde 200 y el pago queda a nombre de **A**. |  |
| AC-0002-07 | Autenticado como ADMIN, `POST /api/payments/monthly` sin `idProfessor` responde 400 con `message` en español y no se persiste ningún pago. |  |
| AC-0002-08 | `POST /api/assistance` con `idProfessor` de otra persona, autenticado primero como ADMIN y después como PROFESSOR, guarda en ambos casos como `staff` a la persona del token. |  |
| AC-0002-09 | `ProductsPage` renderizada con un usuario PROFESSOR no muestra selector de profesor, y confirmar una venta llama al servicio sin `idProfessor`. |  |
| AC-0002-10 | `ProductsPage` renderizada con un usuario ADMIN muestra el selector de profesor. "Confirmar venta" está deshabilitado hasta elegir cliente, profesor y un producto, y la llamada al servicio lleva el `idProfessor` elegido. |  |
| AC-0002-11 | En `ProductsPage`, con una lista de clientes que incluye uno con `dni: null`, buscar por nombre y hacer click en un cliente deja su nombre y apellido en el campo de cliente. |  |
| AC-0002-12 | `PaymentsPage` renderizada con un usuario ADMIN muestra el selector de profesor sin valor elegido, y con un usuario PROFESSOR no lo muestra. |  |
| AC-0002-13 | Autenticado como ADMIN, `POST /api/payments/product` y `POST /api/payments/monthly` con `idProfessor` de un profesor **inactivo** responden 409 con `message` en español, no se persiste ningún pago y el stock no cambia. |  |
| AC-0002-14 | Autenticado como una persona que no es ADMIN ni PROFESSOR (un `Client` con email), `POST /api/payments/product` y `POST /api/assistance` responden 403 y no persisten nada. |  |

## Fuera de alcance

- **BUG-06 (la lista de pagos no distingue cuota de venta):** es presentación de la lista, no quién cobra. Va con el rediseño de pagos.
- **Mostrar el `message` del backend en un toast** (T-10): tarea propia del Sprint 1.
- **`SearchableSelect` para el selector de profesor** (spec 0005): acá se usa el `<select>` actual. Cuando exista el componente, se reemplaza.
- **Cobros a nombre del ADMIN:** descartado por decisión de negocio. Requeriría cambiar `Payment.professor` y el esquema.
- **`GET /api/payments/{idProfessor}` y `GET /api/payments/{idClient}`:** tienen la misma ruta y chocan entre sí. Es un bug real pero ajeno a esta spec; se anota para una spec de consultas de pagos.
- **Corregir `AuthService.login`**, que responde 500 con credenciales inválidas y compara contraseñas en texto plano: deuda de seguridad aparte.

## Notas de handoff

**Qué se asumió:**
- El rol se deduce igual que en `CustomUserDetailsService`: `Administrator` → ADMIN, `Professor` → PROFESSOR. No hay columna de rol.
- El front ya tiene el rol en `useAuth().user.role`, así que no hace falta un endpoint nuevo.
- Los tests de backend se autentican con `@WithMockUser(username = <email>, roles = ...)` sobre una `Person` guardada en H2 con ese email. El resolver de identidad busca por email, así que el mock alcanza.
- Los tests de front mockean los servicios (`vi.mock`) y el contexto de auth. No levantan backend.

**Decisiones de aprobación (13/09/2026, Agustín):**
1. ADMIN elige un profesor inactivo → **se rechaza** con 409 (AC-0002-13). Se usa 409 por la convención de la spec 0001 para reglas de negocio.
2. Usuario que no es ADMIN ni PROFESSOR → **403** en pagos y asistencias (AC-0002-14).

**Qué es lo más probable que salga mal:**
- **T-11 puede no reproducirse.** Leyendo el código actual, la selección de cliente en el POS parece correcta. La hipótesis más firme es que `c.dni.includes(...)` revienta con clientes de DNI null y deja la lista vacía (AC-0002-11). Si el bug de la QA Sesión 01 era otro (se reportó antes de la paginación del 02/08), el test igual documenta el comportamiento y la tarea cierra sin cambio de código. **No inventar un arreglo para que el test tenga algo que arreglar.**
- **Romper los tests de la spec 0001.** `PaymentControllerErrorsTest` y `AssistanceControllerErrorsTest` usan `@WithMockUser` sin una `Person` detrás. Cuando el backend resuelva la identidad desde el token, van a necesitar un usuario real en H2. Hay que actualizarlos sin debilitar lo que verifican.
- **El test-author puede probar el rol mirando el body.** AC-0002-02 y AC-0002-06 solo prueban algo si el `idProfessor` del body apunta a **otro** profesor existente. Con un id inexistente, el test pasaría también en una implementación que responde 404.
