---
name: gym-theme-guardian
description: Aplica y restringe las reglas visuales, paletas de colores y tokens de diseño para la aplicación del Gimnasio (GymApp Industrial Dark). Úsese al maquetar componentes o vistas web.
---

# 🛡️ Gym Design System Rules & Tokens (GymApp Industrial Dark)

Este documento es el guardián de tema obligatorio para toda la interfaz gráfica de GymApp.

---

## 🎨 1. Tokens Semánticos de Color (Tailwind)

- **Primary Energy (Energía y Acentuación Principal):**
  - Textos y detalles: `text-amber-500` / `text-amber-400`
  - Botones y CTAs: `bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black`
  - Sombras Glow: `shadow-glow-amber`
- **Secondary Accent (Acento Secundario de Marca):**
  - `bg-orange-600` / `text-orange-500` / `shadow-glow-orange`
- **Backgrounds Industriales (Dark Mode First):**
  - Fondo de Aplicación: `bg-slate-950`
  - Superficies de Paneles: `bg-zinc-950`
  - Tarjetas y Contenedores: `bg-zinc-900/80 border border-zinc-800/90`
  - Paneles de Vidrio: `.glass-panel` (`bg-zinc-900/70 backdrop-blur-md border border-zinc-800/80`)
- **Status & Metrics (Métricas Especializadas):**
  - **Calorías / Ritmo Cardíaco:** `rose-500` (`text-rose-400`, `bg-rose-500`, `shadow-glow-rose`)
  - **Progreso / Hidratación / Éxito:** `emerald-500` (`text-emerald-400`, `bg-emerald-500`, `shadow-glow-emerald`)
  - **Textos Secundarios:** `text-zinc-400` / `text-zinc-500`

---

## 🅰️ 2. Tipografía y Estructura

- **Fuentes:**
  - Títulos/Encabezados: `font-display` (Outfit / Inter)
  - Cuerpo/Formularios: `font-sans` (Inter)
- **Headings (Titulares):**
  - Mayúsculas obligatorias para secciones principales (`uppercase tracking-tight font-black`).
  - Gradiente de texto de marca: `.text-gradient-amber` (`bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500`)
- **Card System (`src/components/ui/Card.tsx`):**
  - Usar los subcomponentes `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`.

---

## 🧱 3. Componentes Core UI Disponibles

- `Button` (`src/components/ui/Button.tsx`): Variantes `primary`, `secondary`, `outline`, `danger`, `success`, `ghost`.
- `Badge` (`src/components/ui/Badge.tsx`): Variantes `energy`, `success`, `danger`, `warning`, `neutral`, `outline`.
- `MetricCard` (`src/components/ui/MetricCard.tsx`): Tarjetas de métricas con acento lateral, tendencia e icono.
- `ProgressBar` (`src/components/ui/ProgressBar.tsx`): Barras de progreso animadas con gradientes energéticos.
- `Input` / `TextArea` (`src/components/ui/Input.tsx`): Campos de texto con anillo de enfoque amber y soporte de iconos.
- `Modal` (`src/components/ui/Modal.tsx`): Ventanas emergentes con fondo difuminado backdrop blur.

---

## 🚫 4. Restricciones Estrictas (Clean Code UI)

1. ❌ **Prohibido** usar colores `bg-white` o `bg-gray-100` en contenedores principales de la app.
2. ❌ **Prohibido** usar valores hexadecimales directos dentro de clases de Tailwind (ej: `bg-[#121212]`).
3. ❌ **Prohibido** usar tonos azules genéricos de Bootstrap/Tailwind por defecto (ej: `bg-blue-600`).
4. ✅ **Siempre** importar e implementar los componentes centralizados de `src/components/ui/`.
