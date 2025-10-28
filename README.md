# 🏋️‍♀️ GymApp API: Sistema de Gestión de Gimnasio
¡Bienvenido al repositorio de GymApp API! Esta es una API RESTful desarrollada con Spring Boot para la administración integral de un gimnasio o centro deportivo.

El sistema maneja la gestión de clientes, pagos, rutinas de ejercicio, asistencia y personal (administradores y profesores), con énfasis en la seguridad y la estructura modular.

🚀 Tecnologías y Herramientas
La API está construida sobre las siguientes tecnologías principales:

Java: Lenguaje de programación.

Spring Boot: Base del framework de la aplicación.

Spring Data JPA: Para la capa de acceso a datos y mapeo objeto-relacional.

Spring Security: Encargado de la autenticación, autorización y configuración de CORS (SecurityConfig.java, CorsConfig.java).

Maven: Herramienta de gestión de dependencias y construcción.

Patrón Arquitectónico: Sigue el patrón Model-Service-Controller.

📁 Estructura del Código
El proyecto está organizado en paquetes lógicos dentro del directorio src/main/java/com/aplicacionGym/gymapp/:

## Capa de Entidades (Modelos)
Ubicación: .../entity/

Contiene las clases que representan los objetos de la base de datos (JPA Entities):

Usuarios: Client, Professor, Administrator (probablemente heredando de Person).

Entrenamiento: Routine, Exercise, RoutineDay, RoutineExercise.

Finanzas/Comercio: Payment, MonthlyType, Product, PaymentProduct.

Operación: Assistance.

## Lógica del Negocio (Servicios)
Ubicación: .../service/

Implementa la lógica central y las transacciones, desacoplando los controladores del acceso directo a los datos. Ejemplos incluyen ClientService, RoutineService, y PaymentService.

## Capa de Control (API Endpoints)
Ubicación: .../controller/

Maneja las peticiones HTTP y devuelve las respuestas. Cada controlador gestiona un módulo principal:

ClientController

PaymentController

RoutineController

ProductController

AdministratorController

ProfessorController

## Objetos de Transferencia de Datos (DTOs)
Ubicación: .../dto/

Define los formatos de datos para la comunicación con el cliente:

request/: Estructuras para la entrada de datos (ej. RoutineRequestDTO).

response/: Estructuras para la salida de datos (ej. ClientResponseDTO, WebApiResponse).

## Repositorios, Mapeo y Excepciones
repository/: Interfaces de Spring Data JPA para las operaciones CRUD.

mapper/: Clases para convertir datos entre Entidades y DTOs (ej. ClientMapper).

exception/ y handler/: Manejo centralizado de errores con excepciones específicas (ResourceNotFoundException, GlobalExceptionHandler).

⚙️ Configuración y Ejecución
## Requisitos
Java Development Kit (JDK) (versión 17+ recomendada).

Maven (opcional, se incluye Maven Wrapper).

Una Base de Datos (MySQL, PostgreSQL, etc.).

## Pasos para Iniciar
Clonar el Repositorio:

Bash

git clone [URL_DE_TU_REPOSITORIO]
cd gymapp
Configurar la Base de Datos: Asegúrate de configurar los detalles de conexión en src/main/resources/application.properties.

Properties

spring.datasource.url=jdbc:[tipo_db]://[host]:[puerto]/[nombre_db]
spring.datasource.username=tu_usuario
spring.datasource.password=tu_password
Compilar y Ejecutar (Usando Maven Wrapper): Abre la terminal en la raíz del proyecto y usa el wrapper de Maven:

Bash

# Para construir el proyecto
./mvnw clean install

# Para ejecutar la aplicación
./mvnw spring-boot:run
La API se iniciará en http://localhost:8080 (a menos que se especifique lo contrario en la configuración).

💡 Módulos y Endpoints Clave
Módulo	Descripción	Endpoints de Ejemplo
Clientes	Gestión completa de miembros del gimnasio.	POST /clients, GET /clients/{id}
Pagos	Registro de cuotas mensuales y pagos de productos.	POST /payments, GET /payments/client/{clientId}
Rutinas	Creación y asignación de planes de entrenamiento.	POST /routines, GET /routines/{id}
Asistencia	Registro de ingreso/egreso de clientes.	POST /assistance
Productos	Gestión de inventario y venta (suplementos, etc.).	GET /products, PUT /products/{id}

Exportar a Hojas de cálculo

🛡️ Seguridad (Spring Security)
El paquete config/ (con SecurityConfig.java y CorsConfig.java) indica que la API implementa seguridad y maneja políticas de CORS para integrarse con una aplicación frontend moderna. Las rutas están protegidas y requieren autenticación (probablemente basada en roles: Administrator, Professor, Client).

🤝 Contribución
Si deseas contribuir, por favor sigue los siguientes pasos:

Haz un fork del repositorio.

Crea tu rama de funcionalidad (git checkout -b feature/nueva-funcionalidad).

Asegúrate de que tus cambios pasen las pruebas.

Abre un Pull Request.

📄 Licencia
Este proyecto está bajo la Licencia [AÑADIR TIPO DE LICENCIA AQUÍ].
