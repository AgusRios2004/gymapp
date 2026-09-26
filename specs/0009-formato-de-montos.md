---
id: 0009
titulo: Formato de montos en pesos argentinos ($22.000, no $22,000)
estado: implementada          # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 26/09/2026
adrs_relacionados: [ADR-0009]
---

## Objetivo

Los montos del frontend se muestran con `toLocaleString()` sin locale, que usa el idioma del navegador. En un Chrome en inglés, una cuota de veintidós mil pesos sale `$22,000`: con la coma, un argentino lee "veintidós pesos". En algunos lugares directamente no hay formato: la opción del tipo de cuota dice `Plan Full - $20000`, y el promedio por alumno del dashboard se arma con `toFixed(0)`.

Es el mismo problema de locale implícito que la [spec 0008](./0008-fechas-en-hora-local.md) resolvió para las fechas. Registrado como BUG-19 en la [bitácora de QA](../docs/notes/BITACORA_QA.md) (24/09/2026). Lo sufre el admin en cada pantalla con plata: cobros, ventas, planes, dashboard y ficha del alumno.

## Restricciones

- El backend no cambia: los montos siguen llegando como `double` (`Payment.amount`, `MonthlyType.price`, `Product.price`, `DashboardStatsDTO.monthlyRevenue`).
- La UI va en español (regla del proyecto). Los montos se muestran en formato argentino: punto para los miles y coma para los decimales.
- No se agrega una librería: alcanza con `Intl.NumberFormat`, igual que en la spec 0008 alcanzaron funciones propias.
- Sigue valiendo ADR-0009 (sin scroll horizontal): el formato nuevo no puede ensanchar tablas ni tarjetas a 375px.

## Comportamiento esperado

1. Existe un único helper, `formatMoney(amount)` en `src/utils/money.ts`, que devuelve el monto como texto:
   - Con el signo `$` pegado al número, sin espacio, como se muestra hoy (`$22.000`).
   - Con punto como separador de miles, también en números de 4 cifras (`$1.500`).
   - **Sin decimales si el monto es entero** (`$22.000`). **Con dos decimales y coma si no lo es** (`$1.234,50`).
   - `-` si el monto es `null` o `undefined`.
2. Todos los montos que hoy se muestran con `toLocaleString()`, `toFixed()` o sin formato pasan a usar `formatMoney`:
   - `DashboardPage`: los ingresos del mes y el promedio por alumno activo.
   - `MonthlyTypesPage`: el precio de cada plan.
   - `PaymentsPage`: el monto en la lista de pagos y el precio en la opción de "Tipo de Cuota" del formulario.
   - `ProductsPage`: el precio en la tabla de inventario, en las tarjetas del punto de venta y en cada línea del carrito (`2 x $25.000`), el total de la venta y el monto del historial de ventas.
   - `ClientDetailPage`: "Último pago" del encabezado y de "Resumen Reciente", el monto de la pestaña Pagos, y el precio y el subtotal de la pestaña Compras.
3. Una regla de ESLint impide volver a llamar a `toLocaleString()` **sin argumentos** en `src/`. El mensaje apunta a `formatMoney`. Las llamadas con locale explícito (como las de fechas en `es-ES`) siguen permitidas.

## Casos de borde

- **Cero:** `$0`, no `-`. Un plan gratuito o un total vacío valen cero, no "sin dato".
- **4 cifras:** `$1.500`. En algunos locales `es`, ICU no agrupa los números de 4 cifras (`1500`). En `es-AR` sí agrupa (verificado en Node, ICU 77), pero lo fija un AC.
- **Decimales que redondean a entero** (`99.999`): `$100`, sin `,00`.
- **Un solo decimal** (`1234.5`): `$1.234,50`, no `$1.234,5`.
- **Monto `null` o `undefined`** (un pago viejo o un DTO incompleto): `-`, sin `$NaN` ni romper el render.
- **Promedio por alumno con 0 alumnos activos:** hoy divide por `activeClients || 1`. Esta spec solo cambia el formato; la cuenta queda igual.
- **Montos negativos:** hoy no existen (no hay reintegros). Si aparecen, `Intl` los formatea como `-$500` sin ajuste extra. No tienen AC.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0009-01 | `formatMoney(22000)` devuelve `'$22.000'` y `formatMoney(1500)` devuelve `'$1.500'`. |  |
| AC-0009-02 | `formatMoney(1234567)` devuelve `'$1.234.567'` y `formatMoney(0)` devuelve `'$0'`. |  |
| AC-0009-03 | `formatMoney(1234.5)` devuelve `'$1.234,50'` y `formatMoney(99.999)` devuelve `'$100'`. |  |
| AC-0009-04 | `formatMoney(null)` y `formatMoney(undefined)` devuelven `'-'`. |  |
| AC-0009-05 | `DashboardPage` con `monthlyRevenue: 150000` y `activeClients: 8`: muestra `$150.000` como ingresos del mes y `$18.750` como promedio por alumno. |  |
| AC-0009-06 | `MonthlyTypesPage` con un plan de `price: 20000`: la tarjeta muestra `$20.000`. |  |
| AC-0009-07 | `PaymentsPage` con un pago de `amount: 20000`: la fila muestra `$20.000`. En el formulario, la opción del tipo de cuota "Plan Full" de `price: 20000` dice `Plan Full - $20.000`. |  |
| AC-0009-08 | `ProductsPage`, pestaña Inventario, con un producto de `price: 25000`: la fila muestra `$25.000`. |  |
| AC-0009-09 | `ProductsPage`, Punto de Venta, con un producto de `price: 25000`: la tarjeta muestra `$25.000`. Con 2 unidades en el carrito, la línea dice `2 x $25.000` y el total `$50.000`. |  |
| AC-0009-10 | `ProductsPage`, Historial Ventas, con una venta de `amount: 25000`: la fila muestra `$25.000`. |  |
| AC-0009-11 | `ClientDetailPage` con un último pago de `amount: 15000`: "Último pago" del encabezado y "Último Pago" de "Resumen Reciente" muestran `$15.000`. |  |
| AC-0009-12 | `ClientDetailPage`, pestaña Pagos, con un pago de `amount: 15000`: la fila muestra `$15.000`. En la pestaña Compras, una compra de `price: 25000` y `quantity: 2` muestra `$25.000` de precio y `$50.000` de subtotal. |  |
| AC-0009-13 | Correr ESLint sobre un archivo de `src/` que contiene `amount.toLocaleString()` da un error cuyo mensaje menciona `formatMoney`. Con `date.toLocaleString('es-ES', { month: 'short' })` no da error. Correr `eslint .` sobre `gym-frontend` da 0 errores. |  |

## Fuera de alcance

- **El PDF de cierre de mes del backend.** `ReportService` arma los montos con `String.format("%.2f")`, que depende del locale de la JVM (`$150000.00`). Es el mismo problema, pero en otra capa y otro formato de salida. Se anota como deuda para una spec de backend.
- **Los inputs numéricos de precio** (formularios de plan y de producto). Son `type="number"` y el navegador maneja la entrada. Formatearlos mientras se escribe es otra funcionalidad, con sus propios casos de borde (cursor, pegado de texto).
- **El porcentaje de clientes activos del dashboard** (`toFixed(0)%`). No es un monto, y un porcentaje entero se lee igual en cualquier locale.
- **Pasar los montos a enteros (centavos) en el backend.** `double` para plata es discutible, pero cambiarlo es una migración de datos y de contrato, no un tema de formato.
- **El texto de los tooltips de Recharts.** Hoy no muestran montos (el gráfico de Progreso es de peso y porcentajes).

## Notas de handoff

**Qué se asumió:**
- El formato es `$22.000`, con el signo pegado. Se descartó `Intl` con `style: 'currency'`, que devuelve `$ 22.000,00` con espacio y siempre con decimales: cambiaría el aspecto de todas las pantallas y sumaría `,00` en montos que siempre son enteros.
- Los montos enteros van sin decimales y los no enteros con dos. Hoy todos los precios cargados son enteros.

**Preguntas abiertas:**
1. ¿`$22.000` con el signo pegado te sirve, o preferís `$ 22.000` con espacio, que es lo que devuelve el formato de moneda estándar de `es-AR`?
2. ¿Los montos no enteros deben mostrarse con dos decimales (`$1.234,50`) o redondeados a pesos (`$1.235`)? En un gimnasio no debería haber centavos, pero `double` los permite.

**Lo más probable que salga mal:**
- **Tres tests existentes de la ficha** (AC-0007-04 de "Último pago", H-0007-1-04 y H-0007-2-05) arman el valor esperado con `` `$${amount.toLocaleString()}` ``, que en Node da `$15,000`. Van a fallar cuando cambie el formato. **Esta spec autoriza actualizar esas expectativas a `formatMoney`/`$15.000`.** No es aflojar un test: es el contrato de formato que cambia. T6 los actualiza en el mismo commit y lo dice en el mensaje.
- **La prueba de "sin espacio"** depende de que `Intl` no meta un espacio duro (`U+00A0`) entre el signo y el número. Si `formatMoney` usara `style: 'currency'`, el texto tendría `$ 22.000` con ese espacio y un `toHaveTextContent('$22.000')` fallaría de una forma difícil de ver en el diff. Por eso el signo se concatena a mano.
- **La regla de lint puede dar falsos positivos:** también saltaría con un `toLocaleString()` sin argumentos que no fuera un monto, como una fecha. Hoy no queda ninguno (la spec 0008 los reemplazó), y el mensaje explica qué usar en cada caso.
