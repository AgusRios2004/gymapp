# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Usamos 'npm ci' en lugar de 'install' para asegurar versiones exactas del lockfile
RUN npm ci

# Copiamos el resto del código y construimos
COPY . .
RUN npm run build

# Etapa 2: Servidor Producción (Nginx)
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]