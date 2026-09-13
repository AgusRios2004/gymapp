# Tareas — 0002 — Cobros y asistencias con el staff tomado de la sesión

Spec: [`0002-cobros-con-staff-desde-la-sesion.md`](./0002-cobros-con-staff-desde-la-sesion.md)

Tamaño relativo (S/M), no horas. T1–T3 son backend (`gymapp-back/`, tests con `@SpringBootTest` + `MockMvc` sobre H2). T4–T5 son frontend (`gym-frontend/`, tests con vitest + Testing Library y servicios mockeados).

---

## T1 — Resolver la persona autenticada desde el token

**Toca:** `security/AuthenticatedStaffService.java` (nuevo), `src/test/java/.../security/AuthenticatedStaffServiceTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** base de AC-0002-01 a AC-0002-08, sin AC propio

- Un servicio que lee el `username` (email) del `SecurityContextHolder` y devuelve la `Person` con ese email, más dos consultas: `esAdmin()` / `esProfesor()`, por tipo de entidad, igual que `CustomUserDetailsService`.
- Sin autenticación, o con un email que no existe en base → excepción que el `GlobalExceptionHandler` mapee a **401**. Rol que no es ADMIN ni PROFESSOR → **403**. Si hace falta, sumar esos dos mapeos al handler, con mensaje en español.
- **No** leer el token a mano. El filtro JWT ya dejó la autenticación en el contexto.

---

## T2 — Pagos: profesor según el rol

**Toca:** `service/PaymentService.java`, `controller/PaymentController.java` (si cambia la firma), `src/test/java/.../controller/PaymentStaffFromSessionTest.java` (nuevo), `src/test/java/.../controller/PaymentControllerErrorsTest.java` (ajuste)
**Depende de:** T1
**Tamaño:** M
**Cubre:** AC-0002-01, 02, 03, 04, 05, 06, 07

- Un único método privado decide el profesor: PROFESSOR → la persona del token (casteada a `Professor`) e ignora el body. ADMIN → `idProfessor` obligatorio (400 si falta) y buscado en `ProfessorRepository` (404 si no está).
- Lo usan `createProductPayment` y `createMonthlyPayment`. La decisión va **antes** de tocar stock o persistir nada (AC-0002-04 y 05 lo verifican).
- Mensajes en español: 400 "Elegí el profesor que cobra." (o equivalente), y el 404 incluye el id.
- `PaymentControllerErrorsTest` (spec 0001) pasa a autenticarse con una `Person` real en H2. **No cambiar lo que verifica**, solo cómo se autentica.
- Para AC-0002-02 y 06, el `idProfessor` del body tiene que ser **otro profesor existente**, no un id inventado. Si no, el test no distingue "ignora el body" de "responde 404".

---

## T3 — Asistencias: staff desde el token

**Toca:** `service/AssistanceService.java`, `src/test/java/.../controller/AssistanceStaffFromSessionTest.java` (nuevo), `src/test/java/.../controller/AssistanceControllerErrorsTest.java` (ajuste)
**Depende de:** T1
**Tamaño:** S
**Cubre:** AC-0002-08

- `registerAssistance` toma `staff` de T1 y deja de leer `dto.getIdProfessor()`. El chequeo `"idClient y idProfessor no pueden ser null"` pasa a exigir solo `idClient`.
- `AssistanceControllerErrorsTest` (spec 0001): mismo ajuste de autenticación que en T2, sin cambiar lo que verifica.

---

## T4 — Punto de venta: selector de profesor por rol y selección de cliente

**Toca:** `pages/ProductsPage.tsx`, `services/paymentService.ts` (tipo del request: `idProfessor` opcional), `types/` si el tipo vive ahí, `pages/ProductsPage.test.tsx` (nuevo)
**Depende de:** T2 (contrato del request)
**Tamaño:** M
**Cubre:** AC-0002-09, AC-0002-10, AC-0002-11

- `idProfessor` del request pasa a ser opcional en el tipo. PROFESSOR: no se manda. ADMIN: se manda el elegido.
- ADMIN ve un `<select>` de profesores activos (`getProfessors(true)`, como ya hace `PaymentsPage`). "Confirmar venta" se deshabilita sin cliente, sin profesor (solo ADMIN) o con el carrito vacío.
- **T-11, reproducir primero:** escribir el test de AC-0002-11 con un cliente de `dni: null` y ver si falla. Si falla por `c.dni.includes`, el arreglo es proteger ese acceso. Si **no** falla, la tarea cierra con el test como documentación y se anota en el commit que el bug de la QA no se reprodujo. No inventar un cambio.
- Si la venta falla, no limpiar carrito ni cliente (caso de borde de la spec). Hoy se limpian en `onSuccess`; verificar que no pase en `onError`.

---

## T5 — Cobro de cuotas y asistencias en el front

**Toca:** `pages/PaymentsPage.tsx`, `pages/AttendancePage.tsx`, `services/assistanceService.ts` (tipo del request), `pages/PaymentsPage.test.tsx` (nuevo)
**Depende de:** T4 (comparten el tipo de request de pagos)
**Tamaño:** S
**Cubre:** AC-0002-12

- `PaymentsPage`: `selectedProfessor` arranca en `''` para todos. PROFESSOR no ve selector y no manda `idProfessor`. ADMIN ve el selector y la validación de "completá todos los campos" lo exige solo para ADMIN.
- `AttendancePage`: deja de mandar `idProfessor` (el backend lo ignora desde T3). Tipo del request con `idProfessor` opcional o eliminado.
