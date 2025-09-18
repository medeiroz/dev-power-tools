# Etapa 1: Build com Node 22 (LTS)
FROM node:22 AS build
WORKDIR /app

# Copiar dependências primeiro (para melhor cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar o restante do código
COPY . .

# Build do projeto com Vite
RUN npm run build

# Etapa 2: Servir com Nginx
FROM nginx:alpine

# Copiar artefatos do build para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta padrão do Nginx
EXPOSE 80

# Rodar o Nginx no primeiro plano
CMD ["nginx", "-g", "daemon off;"]
