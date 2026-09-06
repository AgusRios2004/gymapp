# 0001 — Color de marca: emerald, no amber

**Fecha:** 06/09/2026
**Estado:** Activa

## Contexto

Al auditar la documentación (`DESIGN_SYSTEM.md`, skill `gym-theme-guardian`) contra el código real (`Button.tsx`, `Sidebar.tsx`), se encontró que los documentos describían **amber** como acento de marca principal, mientras que el código ya usaba **emerald** (`Button.tsx` primary = `bg-emerald-600`) y el propio footer de la app decía "VITALITY GREEN". Nadie había escrito en ningún lado cuál era el color correcto — cada archivo tenía el suyo.

## Decisión

El color de marca de GymApp es **emerald** (`emerald-600` como acento primario). **Amber queda reservado exclusivamente para estados de advertencia (`warning`)**, nunca como color de marca o CTA primario. Orange se mantiene como acento secundario puntual.

## Alternativas consideradas

- Cambiar el código para que use amber (alinear al documento viejo) — descartada: el código ya estaba en producción con emerald y la propia marca ("Vitality Green") lo confirma.

## Consecuencias

- `tailwind.config.js` define `gym.primary = emerald-600` y `gym.warning = amber-500` como tokens separados.
- Todo componente nuevo usa `emerald-600` para CTAs y estados activos; `amber` solo aparece en badges/alertas de tipo warning.
- Se corrigieron `DESIGN_SYSTEM.md`, `gym-theme-guardian/SKILL.md`, `CLAUDE.md`, `GEMINI.md` (raíz y frontend) para reflejar esto.
