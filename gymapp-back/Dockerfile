#Imagen que ya tiene Maven y Java instalado
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

#Creamos una carpeta de trabajo dentro de Linux del contenedor
WORKDIR /app

#1. Copiamos solo el pom.xml
COPY pom.xml .

#2. Descargamos las dependencias (Esto se guarda en caché de Docker)
RUN mvn dependency:go-offline

#3. Ahora sí copiamos tu código fuente
COPY src ./src

#4. Empaquetamos la app (Creamos el .jar)
RUN mvn clean package -DskipTests

# --- Etapa 2: EL ejecutor ---
# Usamos una imagen que SOLO tiene Java (JRE)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

#5. El truco: Copiamos el .jar desde la etapa "builder"
COPY --from=builder /app/target/*.jar /app/app.jar

# 6. Le decimos qué puerto va a "escuchar" el contenedor (Informativo)
EXPOSE 8080

# 7. El comando que arranca tu aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]