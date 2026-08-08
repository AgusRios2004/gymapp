# 🎨 Plan de Desarrollo Frontend - Fase 1: Perfil, Objetivos y Esquema de Entrenamiento (100%)

**Nomenclatura:** `2026-29-07-fe-perfil-objetivo-entrenamiento.md`  
**Fecha:** 29 de Julio, 2026  
**Capa:** Frontend (`gym-frontend`)  
**Estado:** 🟡 Planificado / Listo para ejecutar  

---

## 🎯 Objetivo General

Implementar las vistas, componentes e interfaces gráficas en React TypeScript para visualizar el **Perfil del Cliente al 100%** (Estatura, Metas de Recomposición Corporal, IMC, Masa Magra/Grasa) y el **Esquema de Entrenamiento de 4 Días** incorporando el bloque final de **Cardio LISS (10-15 min de cinta)** y la señalización de **Días de Descanso (Viernes a Domingo)**.

---

## 📋 Lista de Tareas por Paso

### Paso 1: Actualización de Tipos TypeScript (`src/types/index.ts`)
- [x] **Modificar [`index.ts`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/types/index.ts):**
  - Agregar `height`, `targetWeight`, `targetFatPercentage`, `targetMuscleMass`, `primaryGoal` y `bmi` a la interfaz `Client`.
  - Agregar `ExerciseType` (`'FUERZA_PESAS'` | `'CARDIO_LISS'` | etc.) y `durationMinutes`, `cardioIntensity` a `Exercise` / `RoutineExercise`.

### Paso 2: Widget de Recomposición Corporal & Metas en [`ClientDetailPage.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/pages/ClientDetailPage.tsx)
- [x] **Crear componente [`RecompositionWidget.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/physical/RecompositionWidget.tsx):**
  - Muestra la estatura (1.78m) y calcula automáticamente el IMC.
  - Gráfico/Progreso comparativo: **Estado Actual vs. Meta de Recomposición** (Peso, % Grasa objetivo).
  - Medidor de distribución: **Kg de Masa Magra vs. Kg de Masa Grasa**.
  - Badge visual de la fase: 🟢 *"Recomposición Corporal Activa"*.

### Paso 3: Tarjeta de Cardio LISS al Cierre de la Rutina
- [x] **Modificar la visualización de días de rutina:**
  - Agregar tarjeta destacada al final de la lista de ejercicios de fuerza:
    🏃‍♂️ **"Cierre de Sesión: 10 a 15 min de Cinta (Ritmo firme LISS)"**
  - Checkbox/Botón para tildar la realización del cardio y pesas al registrar la sesión.

### Paso 4: Calendario de 4 Días (Lunes-Jueves) y Días de Descanso (Viernes-Domingo)
- [x] **Actualizar la pestaña de Rutina Asignada:**
  - Renderizar visualmente el esquema de 4 días de entrenamiento (Lunes a Jueves) en [`TrainingSchemeWidget.tsx`](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/src/components/routines/TrainingSchemeWidget.tsx).
  - Mostrar tarjetas especiales para Viernes, Sábado y Domingo:
    🔒 **"Día de Descanso Total / Recuperación Muscular"**.

### Paso 5: Verificación y Build Frontend
- [x] Ejecutar comprobación de tipos y build de Vite (`npm run build`) -> **`built in 6.07s`**.


---

## 🔗 Navegación de Documentos

- 🗺️ [**`SITEMAP.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/SITEMAP.md)
- ⚙️ [**Plan Backend (`2026-29-07-be-perfil-objetivo-entrenamiento.md`)**](file:///home/agustin_dev/WorkSpace/gymapp/docs/2026-29-07-be-perfil-objetivo-entrenamiento.md)
- 🎨 [**Reglas Frontend (`gym-frontend/GEMINI.md`)**](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/GEMINI.md)
