# Informe de Cumplimiento de Hoja de Ruta - GymApp

**Fecha de evaluación:** 29 de Julio, 2026  
**Proyecto:** `gymapp` (Backend Java Spring Boot + Frontend React TypeScript)

---

## 📊 Resumen Ejecutivo de Cumplimiento

| Módulo de la Hoja de Ruta | Estado Actual | % Cumplimiento | Resumen |
| :--- | :--- | :---: | :--- |
| **1. Perfil y Objetivo** | 🟡 Parcial | **60%** | Soporta registro físico (peso, masa muscular, % grasa) y meta en rutinas, pero falta altura/IMC y metas explícitas de recomposición. |
| **2. Esquema de Entrenamiento (4 días + Cardio LISS)** | 🟢 Alto | **80%** | Excelente soporte para ABM de rutinas, días específicos (L-J), ejercicios y logs de ejecución (`ExerciseLog`). Falta tipado explícito de cardio LISS. |
| **3. Plan Nutricional y Hábitos** | 🔴 No cumple | **0%** | No existe entidad ni interfaz para planes alimenticios, macronutrientes, reemplazo de galletitas ni timing de comidas. |
| **4. Suplementación e Hidratación** | 🔴 No cumple | **0%** | Existe la tienda de productos, pero no un tracker diario de suplementación (Creatina 5g) ni de hidratación (3L agua). |

**Porcentaje Global de Cumplimiento:** **35%**

---

## 🔍 Análisis Detallado Punto por Punto

### 1. Perfil y Objetivo (Recomposición Corporal)
* 🟢 **Lo que SÍ cumple:**
  * Entidad `PhysicalRecord` y controlador `PhysicalRecordController` registran fecha, peso (`weight`), masa muscular (`muscleMass`) y porcentaje de grasa (`fatPercentage`).
  * Vista en `ClientDetailPage.tsx` permite graficar/historiar métricas físicas del cliente.
  * Entidad `Routine` contiene campo `goal` (objetivo).
* 🔴 **Lo que NO cumple:**
  * No hay campo `height` (altura) en `Client` o `PhysicalRecord` para calcular IMC o contextualizar la estatura de 1,78 m.
  * No existe un módulo de "Objetivos de Recomposición Corporal" con metas numéricas objetivo (ej: reducir grasa a X% manteniendo masa muscular).

---

### 2. Esquema de Entrenamiento (4 Días Lunes-Jueves + Cardio LISS)
* 🟢 **Lo que SÍ cumple:**
  * Entidades `Routine`, `RoutineDay`, `RoutineExercise`: permiten definir exactamente rutinas divididas por días y grupos musculares (ej. Pecho/Bíceps/Hombro, Espalda/Tríceps, Pierna, Brazos).
  * Entidades `ClientRoutine` y `ClientSchedule`: permiten asignar esquemas de 4 días (Lunes a Jueves) usando `assignedDay` (`MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`).
  * Entidad `ExerciseLog`: permite registrar ejecuciones reales (`weight`, `repsAchieved`, `setsAchieved`, `timeInSeconds`, `notes`).
* 🔴 **Lo que NO cumple:**
  * No hay diferenciación formal entre bloques de fuerza (pesas) y bloques de cardio LISS al final de la sesión (10-15 min de cinta a cierto ritmo/inclinación).
  * No hay validación ni alertas de días de descanso obligatorio (Viernes, Sábado y Domingo).

---

### 3. Plan Nutricional y Hábitos
* 🔴 **Lo que NO cumple (Falta 100%):**
  * No existen tablas en la base de datos ni endpoints backend para planes nutricionales (desayunos, almuerzos, cenas, snacks).
  * No se pueden registrar alimentos específicos (ej. 3 huevos, tostadas, frutas, frutos secos).
  * No hay un Habit Tracker para medir el reemplazo de galletitas por frutos secos/fruta.

---

### 4. Suplementación e Hidratación
* 🟢 **Lo que SÍ cumple:**
  * Entidad `Product` y módulo de ventas de productos (permite registrar suplementos en la tienda del gimnasio).
* 🔴 **Lo que NO cumple:**
  * No existe un **Supplement Tracker** diario donde el alumno marque la toma continua de **5g de Creatina**.
  * No existe un **Hydration Tracker** diario para registrar la ingesta de **3 Litros de agua** diarios o el estado de energía/orina.

---

## 🛠️ Recomendaciones y Propuesta de Desarrollo (Backend & Frontend)

Para que **GymApp** cumpla al 100% con esta hoja de ruta, se sugiere incorporar los siguientes módulos:

1. **Backend - Nuevas Entidades:**
   * `NutritionPlan` / `MealLog`: Para estructurar las comidas diarias (desayuno, almuerzo, merienda, cena) y sustitutos saludables.
   * `SupplementLog`: Para registrar la ingesta diaria de creatina (5g) y proteína.
   * `WaterLog`: Registro diario de mililitros/litros de agua consumidos.
   * Amplitud de `PhysicalRecord`: Agregar `height` (altura) y `targetFatPercentage` (meta de % de grasa).

2. **Frontend - Nuevas Secciones:**
   * **Sección Nutrición y Hábitos:** Pestaña en la vista del cliente para visualizar la guía de alimentación y tildar el cumplimiento diario.
   * **Sección Hidratación & Suplementación:** Widget diario (contador de agua de 0 a 3000ml y checkbox de Creatina 5g).
   * **Identificador de Cardio LISS:** Checkbox o etiqueta en `ExerciseLog` para marcar la sesión de cinta final de 10-15 min.
