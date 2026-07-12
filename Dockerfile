# Dockerfile didático em português para a aplicação Nordic Worklog
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o restante dos arquivos do projeto
COPY . .

# Expõe a porta interna 3000 do contêiner
EXPOSE 3000

# Executa o servidor de desenvolvimento do Vite configurado na porta 3000
CMD ["npm", "run", "dev"]
