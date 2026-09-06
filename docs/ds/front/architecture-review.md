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

### [FE-01] Descomposición de Vistas (COMPLETADO)
*   **Estado**: Completado con éxito.
*   **Detalle**: Las vistas de alta complejidad (ej: `ClassesPage.tsx`, `ClientDetailPage.tsx`) fueron reestructuradas, abstrayendo modales y vistas lógicas a componentes especializados (`ClassFormModal.tsx`, `ClientGeneralTab.tsx`, etc.).

### [FE-02] Inversión de Dependencias (Custom Hooks) (COMPLETADO)
*   **Estado**: Completado con éxito.
*   **Detalle**: Se crearon capas de hooks específicos (`useClients`, `useClientDetail`, `useAttendance`, `useDashboard`, `useStaff`, `useRoutines`, `useExercises`, etc.) eliminando las consultas directas de React Query en las páginas.

### [FE-03] Estandarización de Formularios (COMPLETADO)
*   **Estado**: Completado con éxito.
*   **Detalle**: Todos los modales del sistema (ej: `ClassFormModal`, `EditRoutineModal`, etc.) se estandarizaron utilizando `react-hook-form` junto con validación tipada vía Zod (`zodResolver`).

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
1.  Refactorizar una página compleja como prueba de concepto de la nueva estructura de componentes. **(COMPLETADO)**
2.  Implementar actualizaciones optimistas (Optimistic Updates) en flujos de alta frecuencia como Asistencia.
3.  Evaluar la instalación de los primeros componentes de Shadcn/UI.

## 6. Hallazgos Críticos de la Auditoría Reciente

Durante la última auditoría del frontend, se detectaron las siguientes desviaciones arquitectónicas y de diseño:

### 6.1. Acoplamiento de Axios Directo (`exerciseLogService.ts`)
* **Problema:** El servicio `exerciseLogService.ts` utiliza una instancia cruda de `axios` de npm en lugar del cliente de Axios configurado (`api` en `src/lib/axios.ts`).
* **Impacto:** Las peticiones a `/exercise-logs` no incluyen cabeceras `Authorization` (Bearer Token) y fallan silenciosamente con códigos 401/403.
* **Acción:** Migrar a la instancia local `api`.

### 6.2. Violaciones de Accesibilidad (WCAG 2.1 AA)
* **Contraste de Color:** Textos descriptivos y etiquetas en `LoginPage.tsx` usan colores tenues (`text-gray-400`) sobre fondo blanco, resultando en un contraste no apto para personas con discapacidades visuales.
* **Viewport Rígido:** La etiqueta `viewport` en `index.html` bloquea la escala máxima y el zoom del usuario (`user-scalable=no`).

### 6.3. Oportunidades de Diseño y Modo Oscuro
* El botón de **Modo Oscuro** y el de **Cerrar Sesión** en `SIdebar.tsx` no tienen estilos optimizados para hover oscuro (`dark:hover:bg-slate-700/50` o `dark:hover:bg-red-950/20`), lo que genera parpadeos o elementos con bajo contraste visual.
* La sombra del avatar del usuario (`shadow-blue-200`) debe desactivarse en modo oscuro para evitar resplandores incoherentes con el fondo gris oscuro.

### 6.4. Falta de Sincronización de Validaciones en Formularios (DNI y Teléfono)
* **Problema:** El formulario de creación/edición de clientes en el frontend no valida de forma estricta las longitudes del DNI (exactamente 8 caracteres) y del teléfono (mínimo 7 caracteres) antes del envío.
* **Impacto:** Los usuarios pueden enviar datos inválidos a la API, provocando errores HTTP 400 (`MethodArgumentNotValidException`) devueltos por el backend en lugar de mostrar errores amigables en tiempo de edición.
* **Acción:** Actualizar los esquemas de Zod del frontend para incluir `.length(8, { message: "El DNI debe tener exactamente 8 caracteres" })` y `.min(7).max(15)` en el campo de teléfono.

### 6.5. Dimensiones y Responsividad del Layout
* **Problema:** El layout principal de la aplicación es demasiado estrecho ("muy chico") y no aprovecha todo el ancho disponible de la pantalla. Adicionalmente, carece de adaptabilidad responsiva completa.
* **Acción:** Modificar las clases de contenedores principales en el Layout para usar `w-full max-w-none` o contenedores flexibles fluidos de pantalla completa y asegurar un comportamiento totalmente responsivo en todos los breakpoints.

### 6.6. Patrón de Diseño "Bento Grid" para el Dashboard
* **Problema:** El Dashboard actual tiene una grilla estándar, perdiendo la oportunidad de presentar métricas y accesos de forma más moderna e interactiva.
* **Acción:** Implementar el patrón de diseño Bento Grid (grillas asimétricas con bordes redondeados y fondos sutiles/translúcidos) para los widgets del Dashboard.
