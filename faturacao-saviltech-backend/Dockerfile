FROM node:20-alpine

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o código do backend
COPY . .

# Expõe a porta que seu backend usa
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "src/server.js"]
