# Tareas — 0013 — Pagos: tipo de pago y productos vendidos en la respuesta

Spec: [`0013-tipo-de-pago-y-productos-en-la-respuesta.md`](./0013-tipo-de-pago-y-productos-en-la-respuesta.md)

Tamaño relativo, no horas. T1 es backend (`@SpringBootTest` + `MockMvc` sobre H2) y T2 es frontend (vitest + Testing Library). Son independientes: el frontend ya lee el contrato correcto y T2 solo agrega el test que faltaba.

---

## T1 — `PaymentMapper` y `PaymentResponseDTO` con el contrato del frontend

**Toca:** `mapper/PaymentMapper.java`, `dto/response/PaymentResponseDTO.java`, `src/test/java/.../controller/PaymentResponseContractTest.java` (nuevo)
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** AC-0013-01, 02, 03

- Test rojo primero, con el setup de `PaymentStaffFromSessionTest` (spec 0002: staff autenticado real en H2, alumno activo, plan y dos productos con stock).
- `toDTO`: `paymentResponseDTO.setPaymentType(payment.getPaymentType() == null ? null : payment.getPaymentType().name())`, fuera del `if/else`.
- `PaymentResponseDTO.products` se serializa como `paymentProducts` (`@JsonProperty` o renombre). Verificar con `jsonPath("$.data.products").doesNotExist()`.
- Renombrar **solo** la respuesta. `ProductPaymentRequestDTO.products` (el request del POS) queda igual. El constructor de 8 argumentos de `PaymentResponseDTO` no lo usa nadie (al 29/09); si hay que tocarlo, verificar el orden `monthlyType, paymentType`.
- Antes de cerrar, correr `PaymentStaffFromSessionTest` e `InactiveClientRulesTest`: los dos postean ventas.
- No tocar `idProduct` (fuera de alcance).

---

## T2 — Test de la etiqueta de tipo en `PaymentsPage`

**Toca:** `pages/PaymentsPage.test.tsx`
**Depende de:** ninguna
**Tamaño:** S
**Cubre:** AC-0013-04

- Mockear `getAllPayments` (o el servicio que use la página) con una cuota (`paymentType: 'MONTHLY'`) y una venta (`paymentType: 'PRODUCTS'`), y verificar "Mensual" y "Producto" en la fila de cada una.
- Si el test pasa sin cambiar `PaymentsPage.tsx` (es lo esperado), la tarea es solo el test. Si falla, corregir la página y anotarlo en el commit.
