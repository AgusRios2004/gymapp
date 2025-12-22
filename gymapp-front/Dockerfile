# --- ETAPA 1: EL CONSTRUCTOR (Node) ---
# Usamos Node para instalar librerías y armar el proyecto
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copiamos los archivos de dependencias
COPY package*.json ./

# 2. Instalamos las dependencias (node_modules)
RUN npm install

# 3. Copiamos todo el código fuente
COPY . .

# 4. Construimos la app para producción
# Esto crea una carpeta 'dist' con tus html/js/css optimizados
RUN npm run build

# --- ETAPA 2: EL SERVIDOR (Nginx) ---
# Usamos Nginx: un servidor web ultra rápido y ligero
FROM nginx:alpine

# 5. Copiamos los archivos generados en la etapa anterior a la carpeta pública de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 6. Exponemos el puerto 80 (el estándar web)
EXPOSE 80

# 7. Arrancamos Nginx en primer plano para que el contenedor no se apague
CMD ["nginx", "-g", "daemon off;"]