# Plan de Modularización - Frontend (Feature-Based Architecture)

Este plan describe la evolución hacia una arquitectura orientada a características (Features), permitiendo que la UI sea dinámica y se adapte a los módulos activos del backend.

## 1. Estrategia: Feature Folders + Config-Driven UI
Organizaremos el código en "Features" autocontenidas. La visibilidad de estas características en la interfaz dependerá de una configuración centralizada.

## 2. Fases de Implementación

### Fase 1: Nueva Estructura de Carpetas (COMPLETADO)
Migrar de `src/pages` y `src/components` a una estructura basada en dominios:
```
src/
  ├── features/
  │   ├── auth/
  │   ├── clients/
  │   ├── payments/
  │   └── routines/
  │       ├── components/ (específicos del módulo)
  │       ├── hooks/
  │       ├── services/
  │       └── types/
  ├── components/ui/ (componentes genéricos/atómicos)
  └── routes/ (configuración de rutas dinámicas)
```

### Fase 2: Feature Toggle Provider (COMPLETADO)
Crear un contexto (`FeatureContext`) o un archivo de configuración que reciba del backend (o de una variable de entorno) qué módulos están activos.

### Fase 3: Navegación y Rutas Dinámicas (COMPLETADO)
*   **Sidebar**: El componente `Sidebar` iterará sobre una lista de rutas filtrada por el estado de activación de cada feature.
*   **Router**: Las rutas de módulos desactivados no serán registradas en el `BrowserRouter`, evitando el acceso directo vía URL.

### Fase 4: Shared UI Components (COMPLETADO)
Utilizar `src/components/ui` para componentes transversales (Botones, Modales base, Inputs) para asegurar consistencia visual entre módulos sin duplicar código.

## 3. Beneficios
1.  **Carga bajo demanda**: Facilita la implementación futura de *Code Splitting* para que el navegador solo descargue los módulos activos.
2.  **Aislamiento**: Los cambios en la lógica de "Pagos" no afectarán visualmente a "Rutinas".
3.  **Adaptabilidad**: La interfaz se "encoge" o "agranda" automáticamente según el perfil del cliente.
