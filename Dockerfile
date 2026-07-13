# Dockerfile de produção — Nordic Worklog
# Multi-estágio: Node (build) → Node + Nginx (serve frontend + API)

# ═══ Estágio 1: Build da aplicação frontend ═══
FROM node:20-alpine AS build

# Argumentos de build para variáveis de ambiente Vite (prefixo VITE_)
ARG VITE_OPENWEATHER_API_KEY
ARG VITE_WEATHER_CITY

ENV VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY
ENV VITE_WEATHER_CITY=$VITE_WEATHER_CITY

WORKDIR /app

# Copia dependências primeiro (cache de camada)
COPY package*.json ./
RUN npm ci

# Copia o restante do código e gera o build estático
COPY . .
RUN npm run build

# ═══ Estágio 2: Node + Nginx (frontend + API no mesmo container) ═══
FROM node:20-alpine

# Instalar Nginx no Alpine
RUN apk add --no-cache nginx

# Remover configuração padrão do Nginx
RUN rm -f /etc/nginx/conf.d/default.conf

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Diretório da aplicação
WORKDIR /app

# Copiar dependências Node (inclui backend)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código do backend
COPY backend/ ./backend/

# Copiar arquivos estáticos do build frontend
COPY --from=build /app/dist /usr/share/nginx/html/worklog

# Script de inicialização (inicia Express + Nginx)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Diretórios necessários do Nginx
RUN mkdir -p /run/nginx

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
