# 🎨 Design System Guide - GymApp Light ("Vitality Green")

Este documento describe la arquitectura de diseño visual, tokens de diseño y componentes UI reutilizables creados para **GymApp**.

> **Actualizado 06/09/2026:** este documento describía antes un tema "Industrial Dark" con acento amber. Esa decisión quedó reemplazada el 05/09/2026 (QA Sesión 01, ver [`notes/BITACORA_QA.md`](./notes/BITACORA_QA.md) y [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md)): **la app es 100% light/white, sin dark mode**, y el color de marca real es **emerald** (así lo usa `Button.tsx`, `Sidebar.tsx` y el propio footer de la app: "VITALITY GREEN"), no amber. Amber quedó como color de advertencia (`warning`), no como acento principal.

**Fuente de verdad real:** los tokens en [`tailwind.config.js`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/tailwind.config.js) (`theme.extend.colors.gym`) y el Showcase en vivo (`/design-system`). Este documento explica esos tokens — si alguna vez no coinciden, el código manda, no este archivo.

---

## 🚀 1. Concepto Visual y Estética

- **Estilo:** Light mode único — fondo blanco/slate-50, superficies claras, texto oscuro de alto contraste.
- **Marca ("Vitality Green"):** **Emerald 600** (`#059669`) es el acento primario — botones CTA, links activos, elementos de marca.
- **Acento secundario:** **Orange 600** (`#ea580c`), uso puntual (no compite con el primario).
- **Advertencia:** **Amber 500** (`#f59e0b`) — reservado para estados de warning, nunca como color de marca.
- **Métricas:** **Rose 500** (`#f43f5e`) para grasa corporal/calorías, **Emerald 600** para masa muscular/progreso/éxito.
- **Efectos:** Sombras suaves y sutiles (`shadow-industrial`), sin glow de neón ni glassmorphism oscuro.

---

## 🎨 2. Tokens de Color (`tailwind.config.js` → `theme.extend.colors.gym`)

| Token | Valor | Uso |
|:---|:---|:---|
| `gym.bg` | `#f8fafc` (slate-50) | Fondo de aplicación |
| `gym.surface` / `gym.card` | `#ffffff` | Paneles, tarjetas |
| `gym.border` | `#e2e8f0` (slate-200) | Bordes por defecto |
| `gym.muted` | `#64748b` (slate-500) | Texto secundario |
| `gym.primary` | `#059669` (emerald-600) | **Marca** — CTAs, links activos |
| `gym.accent` | `#ea580c` (orange-600) | Acento secundario |
| `gym.success` | `#10b981` (emerald-500) | Progreso / éxito |
| `gym.danger` | `#f43f5e` (rose-500) | Grasa / error |
| `gym.warning` | `#f59e0b` (amber-500) | Advertencias — no es color de marca |

Uso recomendado en componentes: preferir clases directas de Tailwind consistentes con estos valores (`bg-emerald-600`, `text-slate-900`, `border-slate-200`, etc.) más que inventar tonos nuevos. Si un componente necesita un color que no está en esta tabla, agregalo primero a `tailwind.config.js` y después usalo — así el token vive en un solo lugar.

### Paleta categórica — tipo de entrenamiento (no día de la semana)

Decisión del 16/09/2026 ([ADR-0008](./adr/0008-paleta-categorica-tipo-entrenamiento.md)), aplicada en `TrainingSchemeWidget.tsx`: las cards de esquema de entrenamiento se colorean por **función** (qué tipo de sesión es), no por día — el día es texto neutro. Son colores estándar de Tailwind, no tokens custom en `tailwind.config.js`.

| Categoría | Color | Clases de referencia |
|:---|:---|:---|
| Empuje | Blue | `bg-blue-50 border-blue-200` / badge `bg-blue-100 text-blue-700 border-blue-200` |
| Tracción | Violet | `bg-violet-50 border-violet-200` / badge `bg-violet-100 text-violet-700 border-violet-200` |
| Pierna | Orange (`gym.accent`) | `bg-orange-50 border-orange-200` / badge `bg-orange-100 text-orange-700 border-orange-200` |
| Refuerzo | Teal | `bg-teal-50 border-teal-200` / badge `bg-teal-100 text-teal-700 border-teal-200` |
| Descanso | Slate (neutral) | `bg-slate-50 border-slate-200` / badge `bg-slate-100 text-slate-600` |
| Cardio (fijo, no varía por categoría) | Cyan | `bg-cyan-50 border-cyan-200 text-cyan-700`, ícono `text-cyan-600` |

El estado "completado" sigue pisando todo con `emerald` (semántica de éxito). No aplica a `ClassesPage.tsx` (T-28) — ahí el color por día sigue vigente porque ahí sí importa el día de la clase.

**Prohibido:** cualquier clase de fondo oscuro en contenedores principales o inputs (`bg-gray-900`, `bg-slate-950`, `bg-zinc-900`, `bg-zinc-950`, `text-white` como color de texto por defecto, `bg-*-950/80` en badges). Si encontrás alguna en el código, es deuda técnica del tema viejo — reportarla (ver `FE-04` en `prd/PRD_REFACTOR.md`).

---

## 🛠️ 3. Componentes UI Reutilizables

Estado real por componente (06/09/2026) — todos viven en [`gym-frontend/src/components/ui/`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui):

| Componente | Archivo | Estado | Descripción |
| :--- | :--- | :---: | :--- |
| **Button** | `Button.tsx` | ✅ Light | Variantes `primary` (emerald), `secondary`, `outline`, `danger`, `success`, `ghost`. |
| **Modal** | `Modal.tsx` | ✅ Light | Fondo blanco, cierra con ESC y overlay. |
| **Sidebar / SidebarItem** | `SIdebar.tsx` / `SidebarItem.tsx` | ✅ Light | Navegación lateral, acento emerald en el ítem activo. |
| **Card** (+ Header/Title/Description/Content/Footer) | `Card.tsx` | ✅ Light | Corregido 06/09/2026 — antes era 100% dark. |
| **Badge** | `Badge.tsx` | ✅ Light | Corregido 06/09/2026 — variantes `success`, `danger`, `warning`, `neutral`, `energy`, `outline`. |
| **Input / TextArea** | `Input.tsx` / `TextArea.tsx` | ✅ Light | Corregido 06/09/2026 — antes eran 100% dark (`bg-zinc-900`). |
| **ProgressBar** | `ProgressBar.tsx` | ✅ Light | Corregido 06/09/2026 — color por defecto pasó de amber a emerald. |
| **MetricCard** | `MetricCard.tsx` | ✅ Light | Corregido 06/09/2026 — usaba `Card variant="glass"` oscuro; color por defecto pasó a emerald. |
| **EmptyState** *(nuevo — 06/09/2026)* | `EmptyState.tsx` | ✅ Light | Estado vacío/error estándar para listas y vistas sin datos. Variantes `empty` / `error`. |
| **Skeleton / SkeletonRow** *(nuevo — 06/09/2026)* | `Skeleton.tsx` | ✅ Light | Placeholder de carga genérico, para usar mientras responde TanStack Query. |
| **SearchableSelect** *(nuevo — Sprint 1)* | `SearchableSelect.tsx` | ✅ Light | Combobox con buscador por texto/DNI, para listas de +10 ítems. En uso en selects de profesor/rutina/clase (T-17). |
| **ConfirmModal** *(nuevo — Sprint 2, T-18)* | `ConfirmModal.tsx` | ✅ Light | Modal de confirmación genérico (variantes `danger` / `warning`). Demo en `/design-system` (T-20). |

---

## 🎯 4. Vista de Demostración (Showcase)

Ruta `/design-system` en la aplicación, o desde el menú lateral, para ver la galería en vivo de todos los componentes y tokens del sistema.

- Archivo de vista: [`DesignSystemShowcasePage.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/pages/DesignSystemShowcasePage.tsx)

---

## 🛡️ 5. Skill Local `gym-theme-guardian`

Cualquier agente que trabaje en el CLI de Antigravity o en el IDE carga automáticamente las reglas desde:
👉 [`.agents/skills/gym-theme-guardian/SKILL.md`](file:///home/agustin_dev/WorkSpace/gymapp/.agents/skills/gym-theme-guardian/SKILL.md)

Ese skill fue actualizado el 06/09/2026 para reflejar el tema light con emerald como color de marca — antes describía el tema oscuro descartado con amber como marca.

---

## 🩹 6. Estados de componente (Loading / Empty / Error)

Regla fija en `gym-frontend/GEMINI.md`: ningún componente que liste o cargue datos puede quedar en blanco. Usar:

- **Loading:** `<Skeleton>` / `<SkeletonRow>` (`components/ui/Skeleton.tsx`) mientras responde TanStack Query.
- **Empty / Error:** `<EmptyState>` (`components/ui/EmptyState.tsx`), con `variant="error"` cuando falló la carga (mostrar `error.message` del backend, ver regla de errores descriptivos del PRD).

---

## 📱 6.1 Mobile ([ADR-0009](./adr/0009-estandar-mobile.md))

Reglas obligatorias para toda vista, nueva o existente:

| Regla | Detalle |
|:---|:---|
| **Breakpoints** | Los de Tailwind por defecto: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. Sin breakpoints custom. Sidebar colapsa a drawer por debajo de `lg` (`MainLayout.tsx`). |
| **Sin scroll horizontal de página** | La página completa nunca debe necesitar scroll lateral. Un scroll horizontal *contenido* en un elemento puntual (tabla ancha, barra de tabs/filtros) sí está permitido. |
| **Tablas** | Toda `<table>` va envuelta en un contenedor con `overflow-x-auto` — nunca solo `overflow-hidden`. Una vista de cards alternativa en mobile es una mejora, no un requisito. |
| **Targets táctiles** | Mínimo 44×44px en cualquier botón/ícono clickeable. Un ícono de 15-16px con `p-1`/`p-1.5` no alcanza — usar `p-2.5`+ o `min-h-11 min-w-11`. |
| **Formularios en modales** | Grids de 3+ columnas colapsan con `grid-cols-1 sm:grid-cols-3` (o el N que sea). Grids de 2 columnas con campos cortos pueden quedar fijos. |
| **Modales** | Mantener el patrón de `Modal.tsx`: `max-h-[80vh] overflow-y-auto` en el contenido, backdrop con `p-4`. No reinventar por pantalla. |

Plan de auditoría y corrección página por página: [`docs/sprints/16-09-2026-sprint-3-mobile-frontend.md`](./sprints/16-09-2026-sprint-3-mobile-frontend.md).

## 📌 7. Cómo evitar que esto se desincronice de nuevo

Esta migración se atrasó porque cada archivo (`tailwind.config.js`, cada componente, los docs, el skill) tenía su propia versión de la paleta, sin un único lugar que mandara. Reglas para que no vuelva a pasar:

1. **Un color nuevo se agrega primero en `tailwind.config.js`** (`theme.extend.colors.gym`), nunca inventado inline en un componente.
2. **Este documento describe tokens, no valores hardcodeados sueltos** — si hay que copiar un hex a mano en dos lugares, algo está mal diseñado.
3. Antes de mergear un componente nuevo, comparar contra `/design-system` (Showcase) — es la referencia visual viva, más confiable que cualquier markdown.
