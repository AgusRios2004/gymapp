# Tareas — spec 0008: fechas en hora local

> Spec: [`0008-fechas-en-hora-local.md`](./0008-fechas-en-hora-local.md) · Estado de la spec: `aprobada`
> Solo frontend. Tamaños **relativos** entre sí (chica / media / grande), sin base histórica para estimar en horas.

| # | Tarea | Archivos | Depende de | AC | Tamaño |
|:---:|:---|:---|:---:|:---|:---:|
| T1 | **Helpers y TZ fijo en los tests.** Fijar `TZ=America/Argentina/Buenos_Aires` para Vitest, en `test.env` de `vite.config.ts` o al principio de `src/test/setup.ts` (lo que realmente llegue antes del primer `Date`), y comprobar que el test de AC-0008-01 **falla** contra `toISOString().split('T')[0]`. Después, crear `todayLocalISO`, `parseLocalDate` y `formatDate` | `vite.config.ts` o `src/test/setup.ts`, `src/utils/date.ts`, `src/utils/date.test.ts` | — | AC-0008-01 a 04 | chica |
| T2 | **"Hoy" en asistencias.** `AttendancePage` (consulta del día y registro) y `ClassesPage` (asistencia desde una clase) usan `todayLocalISO()` | `pages/AttendancePage.tsx`, `pages/AttendancePage.test.tsx`, `pages/ClassesPage.tsx`, `pages/ClassesPage.test.tsx` | T1 | AC-0008-07, 08 | media |
| T3 | **"Hoy" en altas con fecha.** Fecha de inicio de `AssignRoutineModal` (al abrir y al resetear), fecha de pago de `PaymentsPage` (por defecto y en `resetForm`) y fecha de la venta en `ProductsPage` | `components/routines/AssignRoutineModal.tsx` y su test, `pages/PaymentsPage.tsx` y su test, `pages/ProductsPage.tsx` y su test | T1 | AC-0008-05, 06, 09 | media |
| T4 | **Ficha del alumno.** Registro físico nuevo con `todayLocalISO()`. Fechas mostradas con `formatDate`/`parseLocalDate` en las pestañas Pagos, Compras, Progreso (lista y eje del gráfico) y Asistencias (mes, número de día y día de la semana) | `pages/ClientDetailPage.tsx`, `pages/ClientDetailPage.test.tsx` | T1 | AC-0008-10, 14, 15, 16 | media |
| T5 | **Fechas mostradas en listas.** Columna de fecha de `PaymentsPage` e historial de ventas de `ProductsPage` con `formatDate`. Revisar a 375px que el formato nuevo no ensanche las tablas (ADR-0009) | `pages/PaymentsPage.tsx` y su test, `pages/ProductsPage.tsx` y su test | T3 | AC-0008-12, 13 | chica |
| T6 | **Nombre del PDF de cierre.** `DashboardPage` arma el nombre con `todayLocalISO()` | `pages/DashboardPage.tsx`, `pages/DashboardPage.test.tsx` (nuevo) | T1 | AC-0008-11 | chica |
| T7 | **Regla de lint y cierre.** `no-restricted-syntax` en `eslint.config.js` para `toISOString().split(...)`/`.slice(...)`, con un mensaje que apunte a `todayLocalISO()`. Test que corre la API de ESLint sobre un fragmento. `eslint .` con 0 errores. Pasar la spec a `implementada` | `eslint.config.js`, `src/utils/date.lint.test.ts`, `specs/0008-*.md` | T2–T6 | AC-0008-17 | chica |

## Orden

```
      ┌──► T2 ─────────────┐
      ├──► T3 ──► T5 ──────┤
T1 ───┼──► T4 ─────────────┼──► T7
      └──► T6 ─────────────┘
```

Después de T1, las ramas T2, T3→T5, T4 y T6 son independientes entre sí. T7 va al final: la regla de lint rompería `eslint .` mientras quede algún `toISOString().split` sin reemplazar.

## Choques de archivo a tener en cuenta

- **`PaymentsPage.tsx` y `ProductsPage.tsx`:** los tocan T3 ("hoy") y T5 (mostrar), en ese orden.
- **`ClientDetailPage.tsx`:** lo toca solo T4.
- **`AssignRoutineModal.tsx`:** lo toca solo T3. El cambio del pie de `fd34060` ya está en `main`.
- **`vite.config.ts` / `src/test/setup.ts`:** solo T1. Si el TZ se fija ahí, afecta a **todos** los tests del frontend. Correr la suite completa al cerrar T1, por si algún test existente dependía sin querer de UTC.
