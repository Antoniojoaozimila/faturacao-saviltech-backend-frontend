# Estágio 1: Build da aplicação React
FROM node:20-alpine as build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código
COPY . .

# Gera os arquivos estáticos de produção
RUN npm run build

# Estágio 2: Servir os arquivos com Nginx
FROM nginx:alpine

# Copia os arquivos gerados para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia uma configuração personalizada do Nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
