---
id: 0013
titulo: Pagos — tipo de pago y productos vendidos en la respuesta
estado: implementada         # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 29/09/2026
adrs_relacionados: []
---

## Objetivo

Que en Pagos se distinga una cuota mensual de una venta de productos (BUG-06) y que el "Historial Ventas" de Tienda y Stock muestre las ventas hechas. Hoy todos los pagos se ven como "Producto" y el historial de ventas está siempre vacío.

Crítico encontrado en la pasada previa de la [QA Sesión 02](../docs/notes/QA_SESION_02.md) (29/09/2026). Hace fallar el paso 4.8 y reabre BUG-06 de la [Sesión 01](../docs/notes/BITACORA_QA.md).

## Contexto (lo que pasa hoy)

La base guarda bien `payment_type` (`MONTHLY` o `PRODUCTS`), pero `PaymentResponseDTO` no lo transmite como el frontend espera:

1. **`paymentType` siempre sale `null`.** `PaymentMapper.toDTO` usa el tipo para decidir qué completar, pero nunca llama a `setPaymentType`. `PaymentsPage` muestra `paymentType === 'MONTHLY' ? 'Mensual' : 'Producto'`, así que todo sale como "Producto".
2. **Los productos vendidos salen como `products`**, pero el tipo `Payment` del frontend y `ProductsPage` leen `paymentProducts`. El historial filtra `p.paymentProducts?.length > 0`, que nunca se cumple. *Este punto no se vio en la UI durante la pasada: sale de leer el código y de la respuesta de `GET /api/payments` (`"products": null`). Se suma acá porque es el mismo DTO y el mismo síntoma: la venta no se distingue de la cuota.*

## Restricciones

- **El contrato es el del frontend:** `paymentType: 'MONTHLY' | 'PRODUCTS'` y `paymentProducts: { productName, quantity }[]`, como en `gym-frontend/src/types/index.ts` y en los tests existentes (`PaymentsPage.test.tsx`, `ProductsPage.test.tsx`, AC-0008-13). La corrección va en el backend.
- Los valores de `paymentType` son los nombres del enum `PaymentType` (`MONTHLY`, `PRODUCTS`), sin traducir: la traducción a "Mensual"/"Producto" es de la UI.
- No cambia cómo se cobra ni cómo se valida (specs 0001, 0002, 0004 y 0010).

## Comportamiento esperado

1. Toda respuesta con un `PaymentResponseDTO` trae `paymentType` con el tipo guardado.
2. Una venta de productos trae `paymentProducts`: un elemento por producto, con al menos `productName` y `quantity` (y `unitPrice`, como hoy). La clave `products` deja de existir.
3. Una cuota trae `monthlyType` y `monthlyTypeName`, como hoy, y `paymentProducts` en `null` o vacío.
4. Con eso, `PaymentsPage` muestra "Mensual" o "Producto" según corresponda, y el historial de ventas lista las ventas, sin cambios en el frontend.

## Casos de borde

- **Venta con varios productos:** `paymentProducts` trae un elemento por producto, con su cantidad.
- **Lista mixta** (`GET /api/payments` con cuotas y ventas): cada pago trae su propio tipo.
- **Pago viejo con `payment_type` nulo en la base:** hoy no hay ninguno en la base local (9 `MONTHLY` y 2 `PRODUCTS`). Ver la pregunta abierta; esta spec no inventa una regla para inferir el tipo.
- **Pagos por cliente** (pestaña Pagos de la ficha, `/api/clients-info-controller/{id}/payments`): usa `PaymentService.getPaymentsByClient` → `PaymentMapper::toDTO`, así que hereda la corrección. La ficha ya muestra `monthlyTypeName || 'Producto'`.
- **El request de venta no cambia:** `POST /api/payments/product` sigue recibiendo `products: [{ idProduct, quantity }]` (`ProductPaymentRequestDTO`, que manda `ProductsPage`). Solo se renombra la clave de la **respuesta**.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0013-01 | `POST /api/payments/monthly` exitoso responde `data.paymentType == "MONTHLY"` y `data.monthlyTypeName` con el nombre del plan. |  |
| AC-0013-02 | `POST /api/payments/product` con dos productos responde `data.paymentType == "PRODUCTS"` y `data.paymentProducts` con dos elementos, cada uno con el `productName` y la `quantity` vendidos; `data` no tiene la clave `products`. |  |
| AC-0013-03 | Con una cuota y una venta guardadas, `GET /api/payments` devuelve la cuota con `paymentType == "MONTHLY"` y la venta con `paymentType == "PRODUCTS"` y `paymentProducts` no vacío. |  |
| AC-0013-04 | En `PaymentsPage`, un pago con `paymentType: 'MONTHLY'` muestra la etiqueta "Mensual" y uno con `paymentType: 'PRODUCTS'` muestra "Producto". |  |

## Fuera de alcance

- **`PaymentProductResponseDTO.idProduct` guarda el id del `PaymentProduct`, no el del producto** (`PaymentMapper`, en el armado de la lista). Ningún componente del frontend lee ese campo. Se anota para una spec de limpieza del DTO de pagos.
- **Rutas duplicadas `GET /api/payments/{idProfessor}` y `GET /api/payments/{idClient}`,** que siempre responden 500. El frontend no las usa; es otra corrección.
- **Mensajes con fechas en formato ISO** ("vigente hasta 2026-10-06"). Ya figura como fuera de alcance en la spec 0010.
- **Cambios en el frontend.** `PaymentsPage` y `ProductsPage` ya leen el contrato correcto. AC-04 solo agrega el test de la etiqueta, que hoy no existe.

## Notas de handoff

- **Asumido:** el backend se adapta al contrato que el frontend ya tipó y testeó, igual que en la spec 0012.
- **Asumido:** el punto 2 (historial de ventas vacío) entra en esta spec aunque no estaba en la lista original de críticos. Si se prefiere tratarlo aparte, se saca AC-02 hasta "la clave `products`" y la parte correspondiente de T1.
- **Pregunta abierta:** ¿la base de producción (TiDB) tiene pagos con `payment_type` nulo? Si los hay, hace falta decidir si se infieren (con `monthly_type_id` es cuota, sin él es venta) o se muestran como "Sin tipo". No hay datos para decidirlo desde acá.
- **Lo más probable que salga mal:** renombrar `products` también en `ProductPaymentRequestDTO` (el request) por arrastre, con un reemplazo global de "products" → "paymentProducts". Eso rompe todas las ventas del POS con un 400. El renombre es solo en `PaymentResponseDTO`, y los tests de la spec 0002 (`PaymentStaffFromSessionTest`) y de la spec 0004 (`InactiveClientRulesTest`), que postean ventas, lo detectan. Además, `toDTO` tiene que setear `paymentType` **fuera** del `if/else`, porque un pago con tipo nulo no entra a ninguna rama.
