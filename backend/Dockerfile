# Dockerfile do backend — Nordic Worklog (Cloud Run)
# Container leve apenas com Express para operações IMAP/SMTP

FROM node:20-alpine

# Diretório da aplicação
WORKDIR /app

# Copiar dependências primeiro (cache de camada)
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --omit=dev

# Copiar código do backend
COPY backend/ ./backend/

# Porta que o Cloud Run espera (será sobrescrita pela variável PORT)
ENV PORT=8080

# Expor porta
EXPOSE 8080

# Iniciar o servidor
CMD ["node", "backend/server.js"]
