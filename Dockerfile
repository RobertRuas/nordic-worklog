# Dockerfile de produção — Nordic Worklog
# Multi-estágio: build com Node → serve com Nginx

# ═══ Estágio 1: Build da aplicação ═══
FROM node:20-alpine AS build

# Argumentos de build para variáveis de ambiente Vite (prefixo VITE_)
ARG VITE_OPENWEATHER_API_KEY
ARG VITE_WEATHER_CITY

# Define as variáveis como environment variables durante o build
ENV VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY
ENV VITE_WEATHER_CITY=$VITE_WEATHER_CITY

WORKDIR /app

# Copia dependências primeiro (cache de camada)
COPY package*.json ./
RUN npm ci

# Copia o restante do código e gera o build estático
COPY . .
RUN npm run build

# ═══ Estágio 2: Servir com Nginx ═══
FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia configuração customizada (subpath /worklog/)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia apenas os arquivos estáticos do build
COPY --from=build /app/dist /usr/share/nginx/html/worklog

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
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
