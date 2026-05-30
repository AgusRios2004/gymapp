# Estrategia de Infraestructura y Despliegue

Este documento resume las recomendaciones de infraestructura para mejorar la velocidad y escalabilidad del sistema una vez finalizada la fase de desarrollo local.

## 1. Problemas Identificados en Setup Actual (Vercel + Render Free)
*   **Latencia de Red**: Desconexión geográfica entre el Frontend (Vercel), Backend (Render) y la Base de Datos. Cada petición suma latencia por saltos de red innecesarios.
*   **Cold Starts**: El plan gratuito de Render pone a dormir la instancia, causando esperas de +30s en la primera carga del día.
*   **Distancia a la DB**: El backend y la base de datos deben vivir en la misma región física para que las consultas SQL sean instantáneas (<1ms).

## 2. Recomendaciones de Migración (Fase Pre-Comercial)

### Opción A: Railway.app (Balance Costo/Velocidad)
*   **Ventaja**: Permite desplegar el Backend (Spring Boot) y la Base de Datos en el mismo entorno.
*   **Impacto**: Eliminación total del delay entre Back y DB. Despliegue extremadamente sencillo mediante Docker o Nixpacks.

### Opción B: VPS (Hetzner / DigitalOcean) + Docker
*   **Ventaja**: Rendimiento bruto máximo. Sin capas de abstracción que limiten la CPU/RAM de la JVM (Java Virtual Machine).
*   **Costo**: Fijo (~$5 USD/mes).
*   **Uso**: Ideal para cuando se tengan los primeros 2-3 clientes reales.

## 3. Optimización del Frontend
*   **Veredicto**: Mantener en **Vercel**. Es la mejor plataforma para delivery de assets estáticos y manejo de Edge Network. No requiere cambios, solo asegurar que apunte a la nueva URL del backend cuando se migre.

## 4. Próximos Pasos Técnicos
*   [ ] Optimizar `Dockerfile` de Spring Boot para reducir consumo de RAM (usar JRE liviano).
*   [ ] Configurar variables de entorno unificadas para facilitar el cambio de `localhost` a `production`.
*   [ ] Evaluar el costo de un tier "Hobby/Starter" para evitar que el sistema se duerma durante demos comerciales.
