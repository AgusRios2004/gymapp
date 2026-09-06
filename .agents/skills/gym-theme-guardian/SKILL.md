---
name: gym-theme-guardian
description: Aplica y restringe las reglas visuales, paletas de colores y tokens de diseño para la aplicación del Gimnasio (GymApp Light — "Vitality Green"). Úsese al maquetar componentes o vistas web.
---

# 🛡️ Gym Design System Rules & Tokens (GymApp Light — "Vitality Green")

Este documento es el guardián de tema obligatorio para toda la interfaz gráfica de GymApp.

> **Actualizado 06/09/2026:** este skill describía antes el tema oscuro "Industrial Dark" con amber como color de marca. Esa decisión fue reemplazada el 05/09/2026 (QA Sesión 01) — la app es 100% light/white, sin dark mode, y el color de marca real es **emerald** (ver `Button.tsx` y el footer de la app: "VITALITY GREEN"). Amber quedó solo como color de advertencia. Ver [`docs/DESIGN_SYSTEM.md`](file:///home/agustin_dev/WorkSpace/gymapp/docs/DESIGN_SYSTEM.md), que es el documento más detallado — este skill es el resumen operativo.

---

## 🎨 1. Tokens Semánticos de Color (Tailwind)

Estos tokens viven también en `tailwind.config.js` → `theme.extend.colors.gym`. Si algo de acá no coincide con ese archivo, el archivo manda.

- **Primary / Marca ("Vitality Green"):**
  - Textos y detalles: `text-emerald-600` / `text-emerald-700`
  - Botones y CTAs: `bg-emerald-600 hover:bg-emerald-500 text-white`
- **Secondary Accent (Acento Secundario):**
  - `bg-orange-600` / `text-orange-600`
- **Warning (NO es color de marca):**
  - `bg-amber-500` / `text-amber-600` — solo para estados de advertencia
- **Backgrounds (Light Mode Único):**
  - Fondo de Aplicación: `bg-slate-50`
  - Superficies de Paneles / Tarjetas: `bg-white border border-slate-200`
- **Status & Metrics (Métricas Especializadas):**
  - **Calorías / % Grasa:** `rose-500` (`text-rose-600`, `bg-rose-50`)
  - **Progreso / Masa Muscular / Éxito:** `emerald-600` (`text-emerald-600`, `bg-emerald-50`)
  - **Textos Secundarios:** `text-slate-500` / `text-slate-400`

---

## 🅰️ 2. Tipografía y Estructura

- **Fuentes:**
  - Títulos/Encabezados: `font-display` (Outfit / Inter)
  - Cuerpo/Formularios: `font-sans` (Inter)
- **Headings (Titulares):**
  - Mayúsculas obligatorias para secciones principales (`uppercase tracking-tight font-black`).
- **Card System (`src/components/ui/Card.tsx`):**
  - Usar los subcomponentes `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`.

---

## 🧱 3. Componentes Core UI Disponibles

- `Button` (`src/components/ui/Button.tsx`): Variantes `primary` (emerald), `secondary`, `outline`, `danger`, `success`, `ghost`.
- `Badge` (`src/components/ui/Badge.tsx`): Variantes `energy`, `success`, `danger`, `warning`, `neutral`, `outline`.
- `MetricCard` (`src/components/ui/MetricCard.tsx`): Tarjetas de métricas con acento lateral, tendencia e icono. Default `emerald`.
- `ProgressBar` (`src/components/ui/ProgressBar.tsx`): Barras de progreso animadas con gradientes. Default `emerald`.
- `Input` / `TextArea` (`src/components/ui/Input.tsx`): Campos de texto claros con anillo de enfoque emerald y soporte de iconos.
- `Modal` (`src/components/ui/Modal.tsx`): Ventanas emergentes, cierra con ESC.
- `EmptyState` (`src/components/ui/EmptyState.tsx`): Estado vacío/error para listas sin datos.
- `Skeleton` / `SkeletonRow` (`src/components/ui/Skeleton.tsx`): Placeholder de carga.
- `SearchableSelect`: Combobox con buscador, para listas de +10 ítems.
- `ConfirmModal`: Modal de confirmación genérico.

---

## 🚫 4. Restricciones Estrictas (Clean Code UI)

1. ❌ **Prohibido** usar fondos oscuros (`bg-slate-950`, `bg-zinc-900`, `bg-zinc-950`, `bg-gray-900`, `text-white` como color de texto por defecto, `bg-*-950/80` en badges) en contenedores principales, paneles o inputs.
2. ❌ **Prohibido** usar valores hexadecimales directos dentro de clases de Tailwind (ej: `bg-[#121212]`).
3. ❌ **Prohibido** usar tonos azules genéricos de Bootstrap/Tailwind por defecto (ej: `bg-blue-600`).
4. ❌ **Prohibido** usar amber como color de marca/primario — es solo para warnings.
5. ✅ **Siempre** importar e implementar los componentes centralizados de `src/components/ui/`.
6. ✅ **Siempre** fondo blanco y texto `slate-900` en inputs, selects y textareas.
7. ✅ **Siempre** que agregues un color nuevo, sumalo primero a `tailwind.config.js` → `theme.extend.colors.gym`.
