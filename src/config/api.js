/**
 * Configuração da URL da API — Nordic Worklog
 * 
 * Em produção (Firebase Hosting): chama o backend no servidor Docker diretamente
 * Em desenvolvimento: /api é proxy para Express local via vite.config.js
 * 
 * Usa URL absoluta para compatibilidade com Safari.
 */

// Em dev, usa o proxy do Vite. Em produção, aponta para o servidor backend.
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_URL = isDev
  ? window.location.origin  // Vite proxy → localhost:8080
  : 'https://nordic-worklog.duckdns.org';  // Servidor Docker (porta 443 via HTTPS)
