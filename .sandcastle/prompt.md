# Contexto del Proyecto: Gymania OS (GymApp)

Gymania OS es un sistema integral de gestión de gimnasios y seguimiento de alumnos.

## Stack Tecnológico
- **Backend**: Java 21, Spring Boot 3.5.0, Spring Data JPA, Spring Security (JWT), MySQL / TiDB.
- **Frontend**: React 19, TypeScript 5.9, Vite 7, TailwindCSS 3, React Hook Form + Zod, TanStack Query, Recharts.
- **Gestión de estado & Builds**: Maven (`./mvnw`), npm (`npm run build` / `npm test`).

---

## 📋 Lista de Tareas Pendientes (Checklist de Producción)

### 1. Backend (`gymapp-back`)
- [ ] **Módulo de Registro y Seguimiento Físico**:
  - Ampliar entidad `PhysicalRecord` y `Client` agregando campos: `height` (altura en cm/m), `targetFatPercentage` (meta % de grasa) y `targetMuscleMass` (meta masa muscular).
  - Actualizar `PhysicalRecordDTO`, `PhysicalRecordRequestDTO`, `PhysicalRecordResponseDTO` y su `PhysicalRecordMapper`.
  - Crear/actualizar endpoints en `PhysicalRecordController` para cálculo automático de IMC (Índice de Masa Corporal) y % de avance hacia la meta de recomposición corporal.
- [ ] **Módulo de Nutrición y Hábitos**:
  - Crear entidad `NutritionPlan` (con relaciones a `Client`, comidas del día, calorías objetivo, macros: proteína, carbohidratos, grasas).
  - Crear entidad `MealLog` para registro de alimentos diarios.
  - Implementar Repositorios, Servicios y Controladores REST para Nutrición.
- [ ] **Módulo de Suplementación e Hidratación**:
  - Crear entidad `SupplementLog` (registro diario de toma de creatina 5g / proteína).
  - Crear entidad `WaterLog` (registro de hidratación diaria hasta meta de 3000ml).
  - Implementar Repositorios, Servicios y Controladores REST para Suplementación e Hidratación.
- [ ] **Diferenciación de Cardio LISS**:
  - Añadir soporte en `RoutineExercise` / `ExerciseLog` para identificar bloques de Cardio LISS (ej. 10-15 min cinta) vs Bloques de Fuerza.

### 2. Frontend (`gym-frontend`)
- [ ] **Vista de Evolución Física y Recomposición**:
  - Actualizar `ClientDetailPage.tsx` y componentes de seguimiento para mostrar IMC, altura y progreso visual del alumno hacia su objetivo.
- [ ] **Sección y Hooks de Nutrición y Hábitos**:
  - Crear servicio `nutritionService.ts` e integración TanStack Query (`useNutrition.ts`).
  - Crear vista `NutritionPage.tsx` / `ClientNutritionTab.tsx` para visualizar plan alimentario y check de hábitos diarios.
- [ ] **Widget de Hidratación & Suplementación**:
  - Crear componente `HydrationTracker.tsx` (meta de 3L/día) y `SupplementTracker.tsx` (Creatina 5g).
  - Integrar widgets en el dashboard del cliente.
- [ ] **Etiquetado de Cardio LISS**:
  - Añadir indicador visual (Badge / Checkbox) en el registro de rutinas (`ExerciseLog`) para marcar sesiones de cardio LISS.

### 3. Base de Datos & Mapeo JPA (Sanity Check)
- [ ] Asegurar que Hibernate / Scripts DDL actualicen la estructura de tablas (`physical_record`, `client`, `nutrition_plan`, `meal_log`, `supplement_log`, `water_log`).
- [ ] **Sanity Check JPA/Hibernate**: Asegurarse de que las entidades (`PhysicalRecord`, `Client`, `NutritionPlan`, etc.) no tengan conflictos de mapeo JPA (ej. `@ManyToOne`, `@OneToMany`, `@JoinColumn`, relaciones bidireccionales en bucle) ni errores DDL en la inicialización del contexto Spring.
- [ ] Verificar compatibilidad de tipos numéricos y claves foráneas en TiDB/MySQL.

### 4. Tests y Calidad de Código
- [ ] Crear pruebas unitarias e integración en el backend (`@SpringBootTest`, `@WebMvcTest`) para los nuevos controladores y servicios.
- [ ] Asegurar que `JAVA_HOME` esté configurado e invocar la suite de pruebas del backend en subshell.
- [ ] Agregar/ejecutar pruebas y verificación en frontend mediante build y typecheck en subshell.

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
5. **COMMITS ATÓMICOS EN GIT**: Tras completar y verificar exitosamente cada sub-módulo (backend, frontend o tests), realiza un commit atómico en Git con un mensaje descriptivo convencionales (ej: `feat(back): Add PhysicalRecord endpoints and calculation logic` o `feat(front): Add HydrationTracker widget`).

---

## 🛑 Condición de Salida (Completion Signal)

CUANDO Y SOLO CUANDO:
1. Todas las tareas de la lista estén completadas al 100%.
2. Tanto el Backend como el Frontend compilen limpiamente.
3. Todos los tests pasen exitosamente con 0 fallos.

Escribe el tag de cierre uniendo las etiquetas: "<promise>" seguido de "COMPLETE_TASK" seguido de "</promise>".
