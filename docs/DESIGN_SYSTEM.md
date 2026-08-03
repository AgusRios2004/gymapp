# 🎨 Design System Guide - GymApp Industrial Dark

Este documento describe la arquitectura de diseño visual, tokens de diseño y componentes UI reutilizables creados para **GymApp**.

---

## 🚀 1. Concepto Visual y Estética

La estética de **GymApp** está inspirada en los gimnasios industriales de alto rendimiento:
- **Estilo:** Dark Mode First con paleta industrial (`slate-950`, `zinc-950`, `zinc-900`).
- **Energía y Foco:** Acentos vibrantes en **Amber 500** (`#f59e0b`) y **Orange 600** (`#ea580c`).
- **Métricas:** Colores semánticos para métricas corporales y calorías (**Rose 500** `#f43f5e`) y estado/progreso (**Emerald 500** `#10b981`).
- **Efectos:** Glassmorphism suave con sombras de resplandor (Glow Shadows).

---

## 🛠️ 2. Componentes UI Reutilizables

Todos los componentes se encuentran centralizados en [`gym-frontend/src/components/ui/`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui):

| Componente | Archivo | Descripción |
| :--- | :--- | :--- |
| **Button** | [`Button.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/Button.tsx) | Botones con variantes `primary` (Amber), `secondary`, `outline`, `danger`, `success` y `ghost`. |
| **Card** | [`Card.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/Card.tsx) | Sistema modular de tarjetas (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter). |
| **Badge** | [`Badge.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/Badge.tsx) | Etiquetas semánticas (`energy`, `success`, `danger`, `warning`, `neutral`, `outline`). |
| **MetricCard** | [`MetricCard.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/MetricCard.tsx) | Tarjetas de alto impacto para peso, calorías, agua y volumen con indicadores de tendencia. |
| **ProgressBar** | [`ProgressBar.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/ProgressBar.tsx) | Barras de progreso animadas con gradientes de energía. |
| **Input / TextArea** | [`Input.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/Input.tsx) | Campos de entrada oscuros con resplandor amber y soporte para iconos. |
| **Modal** | [`Modal.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/Modal.tsx) | Ventana modal emergente con difuminado backdrop blur. |
| **Sidebar** | [`SIdebar.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/ui/SIdebar.tsx) | Navegación lateral adaptada al tema industrial con acceso al Showcase. |

---

## 🎯 3. Vista de Demostración (Showcase)

Puedes navegar a la ruta `/design-system` en la aplicación o ingresar mediante el menú lateral para interactuar con la galería en vivo de todos los componentes y tokens del sistema.

- Archivo de vista: [`DesignSystemShowcasePage.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/pages/DesignSystemShowcasePage.tsx)

---

## 🛡️ 4. Skill Local `gym-theme-guardian`

Cualquier agente que trabaje en el CLI de Antigravity o en el IDE cargará automáticamente las reglas desde:
👉 [`.agents/skills/gym-theme-guardian/SKILL.md`](file:///home/agustin_dev/WorkSpace/gymapp/.agents/skills/gym-theme-guardian/SKILL.md)
