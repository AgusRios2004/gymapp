# Revisión de Arquitectura y API - Frontend (`gym-frontend`)

Este documento detalla los hallazgos tras una revisión profunda del frontend, enfocándose en la modularidad, el diseño de API y la calidad de los componentes.

## 1. Estructura de Proyecto: "Feature-Based" (Modular)
El proyecto ha sido migrado exitosamente a una estructura basada en **Features** (módulos). 

*   **Fortalezas**:
    *   **Encapsulamiento**: Cada módulo (`attendance`, `auth`, `clients`, etc.) agrupa sus propias páginas, componentes y servicios.
    *   **Escalabilidad**: Facilita la implementación del Plan de Modularización ya que las fronteras de negocio están físicamente definidas.
    *   **Navegación Limpia**: Las rutas y lógica de vista están desacopladas del core de la aplicación.

## 2. Análisis de Componentes: El Desafío del "God Component"
A pesar de la buena estructura de carpetas, la implementación interna de algunos componentes sigue siendo problemática.

*   **Hallazgo Crítico [FE-API-001]**: **Componentes de Página Obesos**. 
    *   Ejemplo: `ClientDetailPage.tsx` (+300 líneas).
    *   **Problema**: Mezcla la lógica de múltiples tabs (Pagos, Rutinas, Asistencia), definiciones de columnas de tablas, estados de modales y lógica de gráficos (`recharts`) en un solo archivo.
    *   **Impacto**: Difícil de testear, propenso a errores al modificar una pestaña que no tiene relación con otra, y tiempo de renderizado innecesario.
    *   **Recomendación**: Extraer cada Tab a su propio componente (`ClientPaymentsTab.tsx`, `ClientProgressTab.tsx`, etc.) y usar un componente contenedor ligero.

## 3. Diseño de API y Data Fetching
El uso de `TanStack Query` es correcto, pero la orquestación puede mejorar.

*   **Hallazgo [FE-API-002]**: **Lógica de Query en Vistas**.
    *   Las llamadas a `useQuery` y `useMutation` están declaradas directamente en los componentes de página.
    *   **Recomendación**: Implementar **Custom Hooks** por feature (ej: `useClientDetail(id)`, `useClientPhysicalRecords(id)`). Esto permite reutilizar la lógica de caché y estados de carga en diferentes partes de la app.

*   **Hallazgo [FE-API-003]**: **Validación y Tipado**.
    *   Se observa un buen uso de `Zod` para esquemas, pero el tipado en los servicios es inconsistente (algunos usan `any` o retornos genéricos).
    *   **Recomendación**: Estandarizar todos los servicios para que retornen tipos estrictos basados en los esquemas de la API.

## 4. Diseño de UI y Componentes Base
El sistema utiliza TailwindCSS de forma efectiva, pero los componentes de `src/components/ui` son manuales.

*   **Hallazgo [FE-UI-001]**: **Duplicación de Estilos y Comportamiento**.
    *   Componentes como `Modal.tsx` o `Button.tsx` están implementados desde cero.
    *   **Recomendación**: Seguir con el plan de migración a **Shadcn/UI**. Esto proporcionará componentes accesibles (Radix UI) y con un diseño consistente sin tener que mantener la lógica de "bajo nivel" (como el cierre de modales con Escape o el foco del teclado).

## 5. Próximos Pasos (Frontend Roadmap)
1.  **Refactorizar `ClientDetailPage.tsx`**: Aplicar descomposición por pestañas (Tabs Decomposition). **(COMPLETADO)**
2.  **Crear Capa de Hooks**: Mover todos los `useQuery` de las páginas a hooks especializados en la carpeta `hooks/` de cada feature. **(COMPLETADO)**
3.  **Instalar Shadcn/UI**: Comenzar por los componentes de `Dialog` (Modales) y `Table` para estandarizar las vistas de datos.
