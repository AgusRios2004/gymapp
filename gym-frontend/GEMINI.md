# 🎨 GEMINI.md - Rules & Architecture: Frontend (`gym-frontend`)

Este documento establece la guía técnica, convenciones de código y arquitectura de UI/UX obligatoria para el desarrollo del **Frontend** de GymApp.

---

## 🛠️ 1. Stack Tecnológico del Frontend

- **Librería UI:** React 19.2.0
- **Lenguaje:** TypeScript 5.9.3 (Strict Type Checking)
- **Bundler / Dev Server:** Vite 7.2.4
- **Enrutamiento:** React Router DOM 7.11.0
- **Estilos:** TailwindCSS 3.4.17
- **Iconos:** Lucide React (`lucide-react`)
- **Formularios & Validación:** React Hook Form + Zod + `@hookform/resolvers`
- **Cliente HTTP:** Axios con Interceptor Bearer Token en `localStorage`
- **Manejo de Estado Asíncrono:** TanStack React Query v5
- **Visualización / Charts:** Recharts 3.8.1
- **Notificaciones:** React Toastify

---

## 🏗️ 2. Estructura de Directorios

```
gym-frontend/src/
├── assets/                 # Recursos estáticos (imágenes, logos, SVGs)
├── components/             # Componentes de UI reutilizables
│   ├── common/             # Modales, Botones, Tablas, Badges, Loaders
│   ├── layout/             # Navbar, Sidebar, Layout principal
│   ├── physical/           # Componentes y widgets de métricas físicas
│   └── routines/           # Modales de creación/edición/asignación de rutinas
├── context/                # Contextos globales (AuthContext)
├── hooks/                  # Custom Hooks reutilizables
├── pages/                  # Vistas/Páginas completas
├── services/               # Clientes Axios por módulo (clientService, physicalRecordService, etc.)
├── types/                  # Definiciones de Interfaces e Integridad TypeScript (`index.ts`)
└── utils/                  # Funciones de formato, fechas, cálculos matemáticos (IMC, % grasa)
```

---

## 📏 3. Reglas de Codificación y Estética UI/UX

### 3.1. Estética y Diseño Visual (Design Excellence)
- **Light Mode único (sin dark mode):** decisión del 05/09/2026, ver [`docs/DESIGN_SYSTEM.md`](file:///home/agustin_dev/WorkSpace/gymapp/docs/DESIGN_SYSTEM.md). Paleta: `bg-white`/`bg-slate-50`, `text-slate-900`, `border-slate-200`; **marca en `emerald-600`** (no amber — amber es solo warning); acento secundario `orange-600`; métricas en `rose-500` (grasa) y `emerald-600` (progreso).
- **Sin Placeholders:** Cada componente debe tener estados visuales limpios (*Loading State*, *Empty State*, *Error State*).
- **Tipografía y Legibilidad:** Usar jerarquía visual clara (`text-2xl font-bold`, `text-sm text-slate-500`).
- **Transiciones y Animaciones:** Micro-interacciones suaves en botones (`transition-all duration-200 hover:scale-[1.02]`).

### 3.2. TypeScript Obligatorio (Strict Typing)
- Evitar el uso de `any`. Todas las respuestas de la API deben tiparse con interfaces en [`src/types/index.ts`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/types/index.ts).
- Cada API Response de backend sigue la forma:
```typescript
export interface WebApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

### 3.3. Formularios con React Hook Form + Zod
- Todos los formularios complejos (crear rutina, registrar datos físicos, login) deben usar esquemas de validación Zod con `@hookform/resolvers/zod`.

### 3.4. Servicios de API
- Toda comunicación HTTP debe estar centralizada en carpetas `src/services/` usando la instancia configurada de `axios`.

---

## 🔗 Enlaces a Documentación General

- 🗺️ [**`SITEMAP.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/SITEMAP.md)
- 📄 [**`CLAUDE.md` / `GEMINI.md` Global**](file:///home/agustin_dev/WorkSpace/gymapp/CLAUDE.md)
- 🎨 [**`DESIGN_SYSTEM.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/DESIGN_SYSTEM.md)
- 📋 [**Sprint activo**](file:///home/agustin_dev/WorkSpace/gymapp/docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md)
