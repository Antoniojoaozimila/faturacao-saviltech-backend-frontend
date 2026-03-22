# Estágio 1: Build da aplicação React
FROM node:20-alpine as build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código
COPY . .

# Vite: URL da API no browser (build time). Sobrescreva no docker-compose ou --build-arg.
ARG VITE_API_URL=http://147.93.89.17:3000
ENV VITE_API_URL=$VITE_API_URL

# Gera os arquivos estáticos de produção
RUN npm run build

# Estágio 2: Servir os arquivos com Nginx
FROM nginx:alpine

# Copia os arquivos gerados para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
