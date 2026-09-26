# Tareas — spec 0009: formato de montos

> Spec: [`0009-formato-de-montos.md`](./0009-formato-de-montos.md) · Estado de la spec: `implementada`
> Solo frontend. Tamaños **relativos** entre sí (chica / media / grande), sin base histórica para estimar en horas.

| # | Tarea | Archivos | Depende de | AC | Tamaño |
|:---:|:---|:---|:---:|:---|:---:|
| T1 | **Helper `formatMoney`.** `Intl.NumberFormat('es-AR')` con el `$` concatenado a mano (sin `style: 'currency'`). Sin decimales si el monto es entero, dos si no lo es. `-` para `null`/`undefined` | `src/utils/money.ts`, `src/utils/money.test.ts` | — | AC-0009-01 a 04 | chica |
| T2 | **Dashboard.** Ingresos del mes y promedio por alumno activo con `formatMoney`; el promedio deja de usar `toFixed(0)` | `pages/DashboardPage.tsx`, `pages/DashboardPage.test.tsx` | T1 | AC-0009-05 | chica |
| T3 | **Planes.** Precio de cada tarjeta de plan con `formatMoney` | `pages/MonthlyTypesPage.tsx`, `pages/MonthlyTypesPage.test.tsx` (nuevo) | T1 | AC-0009-06 | chica |
| T4 | **Pagos.** Monto de la lista y precio de la opción "Tipo de Cuota" con `formatMoney` | `pages/PaymentsPage.tsx`, `pages/PaymentsPage.test.tsx` | T1 | AC-0009-07 | chica |
| T5 | **Productos.** Inventario, tarjetas del punto de venta, líneas del carrito, total de la venta e historial de ventas con `formatMoney`. Revisar a 375px que las tarjetas del punto de venta no se desborden con el formato nuevo (ADR-0009) | `pages/ProductsPage.tsx`, `pages/ProductsPage.test.tsx` | T1 | AC-0009-08, 09, 10 | media |
| T6 | **Ficha del alumno.** "Último pago" del encabezado y de "Resumen Reciente", monto de la pestaña Pagos, y precio y subtotal de la pestaña Compras con `formatMoney`. Actualizar las expectativas de AC-0007-04, H-0007-1-04 y H-0007-2-05, que arman el valor con `toLocaleString()` (lo autoriza la spec; decirlo en el commit) | `pages/ClientDetailPage.tsx`, `pages/ClientDetailPage.test.tsx` | T1 | AC-0009-11, 12 | media |
| T7 | **Regla de lint y cierre.** `no-restricted-syntax` contra `toLocaleString()` sin argumentos, con un mensaje que apunte a `formatMoney`. Test con la API de ESLint (con y sin argumentos). `eslint .` con 0 errores. Pasar la spec a `implementada` y cerrar BUG-19 en la bitácora de QA | `eslint.config.js`, `src/utils/money.lint.test.ts`, `specs/0009-*.md`, `docs/notes/BITACORA_QA.md` | T2–T6 | AC-0009-13 | chica |

## Orden

```
      ┌──► T2 ──┐
      ├──► T3 ──┤
T1 ───┼──► T4 ──┼──► T7
      ├──► T5 ──┤
      └──► T6 ──┘
```

Después de T1, las tareas T2 a T6 tocan archivos distintos y son independientes entre sí. T7 va al final: la regla de lint rompería `eslint .` mientras quede algún `toLocaleString()` sin argumentos.

## Choques de archivo a tener en cuenta

- **`eslint.config.js`:** T7 agrega una segunda entrada a `no-restricted-syntax`, junto a la de la spec 0008. Hay que sumarla al mismo array: una segunda clave `no-restricted-syntax` pisaría la primera.
- **`DashboardPage.test.tsx`:** ya existe (spec 0008, AC-0008-11). T2 le agrega un `describe` sin tocar el que está.
- **`ClientDetailPage.test.tsx`:** T6 cambia tres expectativas existentes de la spec 0007. No se borra ni se afloja ninguna: pasan de `toLocaleString()` al formato nuevo.
