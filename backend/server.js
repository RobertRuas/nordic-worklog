/**
 * Servidor Express — Nordic Worklog
 * 
 * Backend para operações de e-mail (IMAP/SMTP).
 * Roda no mesmo container que o Nginx (porta 3001).
 * Nginx faz proxy de /api/* para este servidor.
 */

import express from 'express';
import admin from 'firebase-admin';
import emailRoutes from './routes/email.js';

const app = express();
const PORTA = 3001;

// ═══ Middleware ═══
app.use(express.json({ limit: '1mb' }));

// ═══ Inicializar Firebase Admin SDK ═══
// A chave do service account é passada via variável de ambiente
let serviceAccount;
try {
  if (process.env.FIREBASE_SA_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SA_KEY);
  } else {
    console.warn('⚠️  FIREBASE_SA_KEY não configurado. API de e-mail não funcionará.');
  }
} catch (erro) {
  console.error('Erro ao parsear FIREBASE_SA_KEY:', erro.message);
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin inicializado');
}

// ═══ Disponibilizar Firebase Admin e Firestore para as rotas ═══
app.locals.adminAuth = admin.auth();
app.locals.db = admin.firestore();
app.locals.admin = admin;

// ═══ Rotas da API ═══
app.use('/api/email', emailRoutes);

// ═══ Rota de health check ═══
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebase: !!serviceAccount,
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
});
