# ⚙️ Plan de Desarrollo Backend - Fase 1: Perfil, Objetivos y Esquema de Entrenamiento (100%)

**Nomenclatura:** `2026-29-07-be-perfil-objetivo-entrenamiento.md`  
**Fecha:** 29 de Julio, 2026  
**Capa:** Backend (`gymapp-back`)  
**Estado:** 🟡 Planificado / Listo para ejecutar  

---

## 🎯 Objetivo General

Llevar el backend del sistema GymApp al **100% de cumplimiento** en los módulos de **Perfil y Objetivo de Recomposición Corporal** y **Esquema de Entrenamiento (4 días + Cardio LISS al cierre)**.

---

## 📋 Lista de Tareas por Paso

### Paso 1: Extensión de la Entidad `Client` para Estatura y Metas de Recomposición
- [x] **Modificar [`Client.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/entity/Client.java):**
  - Agregar atributo `Double height` (altura en cm / metros).
  - Agregar atributo `Double targetWeight` (peso objetivo kg).
  - Agregar atributo `Double targetFatPercentage` (% de grasa objetivo).
  - Agregar atributo `Double targetMuscleMass` (kg de masa muscular objetivo).
  - Agregar atributo `String primaryGoal` (ej: "Recomposición Corporal", "Hipertrofia", "Pérdida de Grasa").
- [x] **Actualizar DTOs:**
  - [`ClientRequestDTO.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/dto/request/ClientRequestDTO.java) para recibir altura y metas.
  - [`ClientResponseDTO.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/dto/response/ClientResponseDTO.java) y [`ClientMapper.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/mapper/ClientMapper.java) para devolver altura, metas y cálculo automático de IMC.

### Paso 2: Extensión del Modelo de Ejercicios para Cardio LISS y Tipado
- [x] **Crear Enum [`ExerciseType.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/entity/enums/ExerciseType.java):**
  - Valores: `FUERZA_PESAS`, `CARDIO_LISS`, `CARDIO_HIIT`, `ABDOMINALES`, `FLEXIBILIDAD`.
- [x] **Modificar [`Exercise.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/entity/Exercise.java):**
  - Agregar atributo `@Enumerated(EnumType.STRING) private ExerciseType type;`.
- [x] **Modificar [`RoutineExercise.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/entity/RoutineExercise.java):**
  - Agregar campos opcionales para Cardio LISS al final de sesión: `Integer durationMinutes` (ej: 10-15 min) y `String cardioIntensity` (ej: "LISS / Ritmo firme").

### Paso 3: Soporte para Días de Descanso Obligatorios (Viernes a Domingo)
- [x] **Modificar [`ClientSchedule.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/entity/ClientSchedule.java):**
  - Compatibilidad de asignación de días Lunes a Jueves con soporte de descanso.
- [x] **Actualizar [`DataLoader.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/config/DataLoader.java):**
  - Cargar ejercicios y datos mock compatibles.

### Paso 4: Servicio y Controlador de Métricas Integradas
- [x] **Actualizar [`ClientService.java`](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/src/main/java/com/aplicacionGym/gymapp/service/ClientService.java):**
  - Actualización y mapeo de recomposición física.
- [x] **Pruebas de verificación Backend:**
  - Compilación limpia ejecutada exitosamente con Maven (`BUILD SUCCESS`).


---

## 🔗 Navegación de Documentos

- 🗺️ [**`SITEMAP.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/SITEMAP.md)
- 🎨 [**Plan Frontend (`2026-29-07-fe-perfil-objetivo-entrenamiento.md`)**](file:///home/agustin_dev/WorkSpace/gymapp/docs/2026-29-07-fe-perfil-objetivo-entrenamiento.md)
- ⚙️ [**Reglas Backend (`gymapp-back/GEMINI.md`)**](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/GEMINI.md)
