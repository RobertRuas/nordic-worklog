/**
 * Servidor Express — Nordic Worklog
 * 
 * Backend para operações de e-mail (IMAP/SMTP).
 * Roda no mesmo container que o Nginx (porta 3003).
 * Nginx faz proxy de /api/* para este servidor.
 * 
 * Em produção: requer FIREBASE_SA_KEY para autenticação e Firestore.
 * Em desenvolvimento: funciona sem Firebase (modo dev).
 */

import express from 'express';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import emailRoutes from './routes/email.js';

// Carregar variáveis de ambiente do .env do backend
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '.env') });

const app = express();
const PORTA = 3003;

// ═══ Middleware ═══
app.use(express.json({ limit: '1mb' }));

// ═══ Inicializar Firebase Admin SDK (opcional em dev) ═══
let firebaseAuth = null;
let firebaseDb = null;
let firebaseAdmin = null;

try {
  if (process.env.FIREBASE_SA_KEY) {
    const admin = await import('firebase-admin');
    const serviceAccount = JSON.parse(process.env.FIREBASE_SA_KEY);
    admin.default.initializeApp({
      credential: admin.default.credential.cert(serviceAccount),
    });
    firebaseAuth = admin.default.auth();
    firebaseDb = admin.default.firestore();
    firebaseAdmin = admin.default;
    console.log('✅ Firebase Admin inicializado');
  } else {
    console.log('⚠️  FIREBASE_SA_KEY não configurado — rodando em modo desenvolvimento');
  }
} catch (erro) {
  console.error('Erro ao inicializar Firebase:', erro.message);
  console.log('⚠️  Rodando em modo desenvolvimento (sem Firebase)');
}

// ═══ Disponibilizar Firebase para as rotas ═══
app.locals.firebaseAuth = firebaseAuth;
app.locals.db = firebaseDb;
app.locals.admin = firebaseAdmin;
app.locals.modoDev = !firebaseAuth;

// ═══ Rotas da API ═══
app.use('/api/email', emailRoutes);

// ═══ Rota de health check ═══
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebase: !!firebaseAuth,
    modoDev: !firebaseAuth,
  });
});

// ═══ Middleware de erro global ═══
app.use((erro, req, res, next) => {
  console.error('Erro não tratado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// ═══ Iniciar servidor ═══
app.listen(PORTA, () => {
  console.log(`🚀 API Nordic Worklog rodando na porta ${PORTA}`);
  if (!firebaseAuth) {
    console.log('📋 Modo dev: autenticação desativada, config via body');
  }
});
