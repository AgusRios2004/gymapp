# Contexto del Proyecto: Gymania OS (GymApp)

Gymania OS es un sistema integral de gestión de gimnasios y seguimiento de alumnos.

## Stack Tecnológico & Design System
- **Backend**: Java 21, Spring Boot 3.5.0, Spring Data JPA, Spring Security (JWT), MySQL / TiDB.
- **Frontend**: React 19, TypeScript 5.9, Vite 7, TailwindCSS 3, React Hook Form + Zod, TanStack Query, Recharts.
- **Design System**: GymApp Industrial Dark (`gym-theme-guardian`) - Slate-950, Zinc-900, Amber-500, Rose-500, Emerald-500.

---

## 🎨 Skills de Auditoría UX/UI, Accesibilidad (A11y) & Visual Guarding

### 1. `ux-visual-auditor` (Jerarquía Visual & Ritmo)
- **Titulares Impactantes**: Títulos principales con `font-display uppercase tracking-tight text-gradient-amber` y tarjetas `glass-panel` (`bg-zinc-900/80 border border-zinc-800/90`).
- **Ritmo & Espaciado**: Uso de la grilla de 8pt (`p-6`, `p-8` en contenedores, `gap-4` en grillas).
- **Densidad de Información**: Badges e indicadores visuales para tendencias, calorías y progreso (`rose-400`, `emerald-400`, `amber-400`).

### 2. `audit-a11y` (Accesibilidad WCAG 2.1 AA)
- **Navegación por Teclado**: Anillos de foco visibles inconfundibles (`focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-950`).
- **Etiquetas ARIA**: `aria-label` obligatorio en botones de sólo iconos y `aria-hidden="true"` en iconos decorativos.
- **Marcado Semántico**: Uso estricto de elementos HTML5 nativos (`<button>`, `<main>`, `<nav>`, `<header>`, `<section>`).
- **Contraste de Color**: Ratio mínimo 4.5:1 para legibilidad nocturna sobre `slate-950`.

### 3. `gym-theme-guardian` (Reglas de Marca)
- ❌ **Prohibido**: Uso de fondos claros/blancos (`bg-white`), grises planos (`bg-gray-100`) o azul Bootstrap (`bg-blue-600`).
- ✅ **Obligatorio**: Paleta Industrial Dark con acentos energéticos de Amber (`bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black`).

---

## 📋 Lista de Tareas Pendientes & Auditoría Continuous Delivery

### 1. Backend (`gymapp-back`)
- [x] **Seeder de Carga Masiva Extrema (`HeavyDataLoader.java`)**: 150+ Alumnos, 10 Profesores, ~750 Mediciones Físicas, 1,000+ Comidas, 1,120 Registros de Hidratación 3L y Creatina 5g.
- [x] **Módulos de Nutrición, Suplementación, Hidratación e IMC**: Entidades JPA, Repositorios, Servicios REST y Controladores.

### 2. Frontend (`gym-frontend`) & Auditoría Visual UX/UI
- [x] **Auditoría de Componentes Core**: `Button`, `Badge`, `Card`, `MetricCard`, `ProgressBar`, `Input`, `Modal`.
- [x] **Auditoría A11y & Foco**: Añadir indicadores de foco accesibles (`focus:ring-2 focus:ring-amber-500`) y `aria-label` en todos los componentes.
- [x] **Vista `ClientsPage.tsx`**: Paginación/filtrado para la carga masiva de 150+ alumnos en estética Industrial Dark.
- [x] **Vista `ClientDetailPage.tsx`**: Widgets de Recomposición Corporal (IMC), Hidratación 3L, Suplementación (Creatina 5g) y Nutrición.

---

## 🔄 Bucle de Verificación Obligatorio

En cada iteración del bucle agéntico:
1. Modifica o crea los archivos correspondientes según las tareas pendientes.
2. Ejecuta la compilación y tests del Backend dentro de un **subshell independiente**:
   ```bash
   (cd gymapp-back && JAVA_HOME=${JAVA_HOME:-/home/agustin_dev/.sdkman/candidates/java/21.0.2-tem} ./mvnw test)
   ```
3. Ejecuta la verificación y tests del Frontend dentro de un **subshell independiente**:
   ```bash
   (cd gym-frontend && npm run build)
   ```
4. **REGLA DE ORO**: Si algún test o build falla, analiza el log de error, corrige el código y vuelve a ejecutar la verificación. No avances a la siguiente tarea con tests fallidos.
5. **COMMITS ATÓMICOS EN GIT**: Realiza commits con mensajes convencionales (ej: `feat(ui): Audit A11y focus rings and Industrial Dark styling`).

---

## 🛑 Condición de Salida (Completion Signal)

CUANDO Y SOLO CUANDO:
1. Todas las tareas de la lista estén completadas al 100%.
2. Tanto el Backend como el Frontend compilen limpiamente.
3. Todos los tests pasen exitosamente con 0 fallos.

Escribe el tag de cierre uniendo las etiquetas: "<promise>" seguido de "COMPLETE_TASK" seguido de "</promise>".

