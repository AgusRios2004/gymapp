# Revisión Arquitectónica y Estrategia de UI - Frontend

Este documento resume el análisis del módulo `@gym-frontend/` y las decisiones estratégicas de diseño.

## 1. Stack Tecnológico Actual
*   **Core**: React 19 + TypeScript + Vite.
*   **Data Fetching**: TanStack Query (React Query) v5.
*   **Estilos**: TailwindCSS.
*   **Validación**: Zod + React Hook Form.

## 2. Análisis del "Arxitect"

### Hallazgos Críticos
*   **Páginas "Dios" (God Components)**: Archivos como `ClassesPage.tsx` superan las 400 líneas, manejando múltiples estados de UI, modales y lógica de negocio simultáneamente. Violación de SRP (Single Responsibility Principle).
*   **Lógica Acoplada**: Alta concentración de lógica de filtrado y procesamiento de datos dentro de los componentes de vista.
*   **Manejo de Errores**: Uso de `alert()` síncronos en interceptores de Axios, lo que degrada la experiencia de usuario.

## 3. Estrategia de Mejora (Refactoring)

### [FE-01] Descomposición de Vistas
*   Extraer sub-componentes lógicos de las páginas principales.
*   *Prioridad*: `ClassesPage.tsx` y `EditRoutineModal.tsx`.

### [FE-02] Inversión de Dependencias (Custom Hooks)
*   Mover la lógica de orquestación de queries y mutaciones a hooks personalizados (ej. `useClasses`, `useAttendance`).

### [FE-03] Estandarización de Formularios
*   Migrar todos los modales al uso de `react-hook-form` + `zodResolver` para mantener coherencia con `EditRoutineModal`.

## 4. Decisión Estratégica: ¿MUI vs. Shadcn/UI?

Se evaluó la migración a una librería de componentes para acelerar el desarrollo.

### Opción A: MUI (Material UI)
*   **Pro**: Componentes extremadamente potentes y accesibles (A11y).
*   **Contra**: Reescritura masiva del DOM, pérdida del look "Modern SaaS" actual, curva de aprendizaje en `sx` prop y Emotion.
*   **Veredicto**: Recomendado solo si se prioriza funcionalidad sobre estética de marca única.

### Opción B: Shadcn/UI (Recomendada)
*   **Pro**: Basado en TailwindCSS (nativo en el proyecto), componentes "copy-paste" altamente personalizables, usa Radix UI para accesibilidad.
*   **Veredicto**: **Evolución natural**. Permite profesionalizar los componentes (Modales, Selects, Tablas) sin perder la flexibilidad y el diseño ya logrado.

## 5. Próximos Pasos Sugeridos
1.  Refactorizar una página compleja como prueba de concepto de la nueva estructura de componentes.
2.  Implementar actualizaciones optimistas (Optimistic Updates) en flujos de alta frecuencia como Asistencia.
3.  Evaluar la instalación de los primeros componentes de Shadcn/UI.
