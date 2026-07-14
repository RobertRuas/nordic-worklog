/**
 * Configuração da URL da API — Nordic Worklog
 * 
 * Em produção (Firebase Hosting): /api é proxy para Cloud Run via firebase.json rewrites
 * Em desenvolvimento: /api é proxy para Express local via vite.config.js
 * 
 * Usa window.location.origin para URLs absolutas (compatível com Safari).
 */

// URL base da API (sempre absoluta para compatibilidade com Safari)
export const API_URL = window.location.origin;
