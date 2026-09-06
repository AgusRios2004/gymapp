# 0002 — Tema visual único: light mode

**Fecha:** 05/09/2026
**Estado:** Activa

## Contexto

QA Manual Sesión 01 (05/09/2026, ver [`notes/BITACORA_QA.md`](../notes/BITACORA_QA.md)) relevó 13 issues de diseño, la mayoría originados en el tema oscuro "Industrial Dark": inputs con fondo negro ilegibles (DES-01), contraste insuficiente (DES-04), componentes sin terminar de migrar. El tema oscuro había sido la estética original del proyecto (ver [`archive/GEMINI.md`](../archive/GEMINI.md)), pero generaba más deuda de legibilidad que valor de marca.

## Decisión

**GymApp usa un único tema visual: 100% light/white. No hay dark mode ni toggle de tema.** Fondo `slate-50`/blanco, texto `slate-900`, bordes `slate-200`.

## Alternativas consideradas

- Mantener dark mode y arreglar el contraste dentro de ese tema — descartada: la superficie del bug era grande (13 issues) y el tiempo de arreglarlo en dark no era menor que migrar a light directamente.
- Soportar ambos temas con un toggle — descartada por ahora: duplica el trabajo de QA visual sin que nadie lo haya pedido; se puede reconsiderar más adelante si un cliente lo pide explícitamente.

## Consecuencias

- Todos los componentes de `src/components/ui/` deben usar los tokens claros (`gym.bg`, `gym.surface`, `gym.border`, etc. — ver [`DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md)).
- `tailwind.config.js` mantiene `darkMode: 'class'` por compatibilidad, pero ninguna clase `dark:` debería usarse mientras esta decisión esté vigente.
- El skill `gym-theme-guardian` prohíbe explícitamente fondos oscuros en contenedores principales.
