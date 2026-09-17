# 0009 — Estándar mobile: breakpoints, touch targets y sin scroll horizontal de página

**Fecha:** 16/09/2026
**Estado:** Activa

## Contexto

La app nunca tuvo una pasada dedicada a mobile — el diseño responsive fue best-effort página por página durante los Sprints 1 y 2. Al auditar el frontend completo (Sprint 3) aparecieron inconsistencias concretas:

- `ProductsPage.tsx` tiene dos tablas sin `overflow-x-auto` (el contenedor usa `overflow-hidden`), así que en mobile el contenido se recorta en vez de poder scrollearse.
- Las cards resumidas de `ClassesPage.tsx` (T-28) usan botones de acción `p-1` con íconos de 15-16px — el target táctil final ronda 24-28px, bien por debajo del mínimo recomendado.
- Algunos formularios en modales usan `grid-cols-3` sin colapsar a una columna en pantallas chicas (ej. registro físico en `ClientDetailPage.tsx`).

No había una regla escrita a la que apuntar en la revisión — cada corrección se decidía de nuevo. Además, el usuario ya había fijado como regla de producto (no solo preferencia de sesión) que la app nunca debe forzar scroll horizontal de página completa.

## Decisión

Se fija un estándar mobile único, documentado en `docs/DESIGN_SYSTEM.md` § Mobile, obligatorio para todo componente nuevo y objetivo de corrección para el existente:

1. **Breakpoints:** los de Tailwind por defecto (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px) — no se agregan breakpoints custom. El sidebar colapsa a drawer por debajo de `lg` (ya así en `MainLayout.tsx`).
2. **Sin scroll horizontal de página.** Un scroll horizontal *contenido* dentro de un elemento específico (una tabla ancha, una barra de tabs/filtros) es aceptable; que la página entera necesite scrollearse a los costados, no.
3. **Tablas:** toda `<table>` va envuelta en un contenedor con `overflow-x-auto` (nunca `overflow-hidden` solo). Es el mínimo obligatorio; una vista de cards alternativa para mobile es una mejora deseable pero no bloqueante.
4. **Targets táctiles ≥ 44×44px** en cualquier elemento interactivo (botón, ícono clickeable, checkbox). Un ícono de 15-16px con `p-1`/`p-1.5` no llega — como mínimo `p-2.5` con ícono de 16-18px, o agrandar el área clickeable con `min-h-11 min-w-11` sin cambiar el ícono visual.
5. **Formularios en modales:** grids de 3+ columnas colapsan a `grid-cols-1 sm:grid-cols-3` (o el N que corresponda). Grids de 2 columnas con campos cortos pueden quedar fijos si no aprietan por debajo de 375px de viewport.
6. **Modales:** mantener el patrón ya usado en `Modal.tsx` (`max-h-[80vh] overflow-y-auto` en el contenido, backdrop con `p-4`) — no reinventarlo por pantalla.

## Alternativas consideradas

- **No escribir regla, corregir caso a caso:** es lo que veníamos haciendo y generó las tres inconsistencias de arriba — descartado.
- **Mobile-first total (rediseñar todo desde cero para mobile):** desproporcionado para el estado actual de la app, que ya es responsive en la mayoría de las vistas (grids con breakpoints correctos). Se prefiere una auditoría dirigida + estándar escrito.

## Consecuencias

- Sprint 3 (`docs/sprints/16-09-2026-sprint-3-mobile-frontend.md`) ejecuta este estándar página por página.
- Cualquier componente o vista nueva se revisa contra esta lista antes de mergear, igual que ya se hace con `docs/DESIGN_SYSTEM.md` para colores.
- Si en el futuro se necesita un patrón mobile que esta lista no cubre, se agrega acá (o se reemplaza este ADR si cambia algo ya decidido), no se resuelve ad-hoc por pantalla.
