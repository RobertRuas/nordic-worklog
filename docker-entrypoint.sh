#!/bin/sh
# Script de inicialização — Nordic Worklog
# Inicia o servidor Express (API) e o Nginx (frontend) no mesmo container.

set -e

# ═══ Iniciar Express em background (porta 3001) ═══
echo "🚀 Iniciando API Nordic Worklog..."
node /app/backend/server.js &

# ═══ Iniciar Nginx em foreground (porta 3000) ═══
echo "🌐 Iniciando Nginx..."
exec nginx -g 'daemon off;'
