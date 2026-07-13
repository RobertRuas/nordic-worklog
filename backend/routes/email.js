/**
 * Rotas de E-Mail — Nordic Worklog
 * 
 * Endpoints da API para buscar, enviar e testar conexões de e-mail.
 * Todas as rotas requerem autenticação via Firebase ID Token no header Authorization.
 */

import { Router } from 'express';
import { buscarEmails, testarConexaoImap } from '../services/imap.js';
import { enviarEmail, testarConexaoSmtp } from '../services/smtp.js';

const router = Router();

/**
 * Middleware de autenticação — valida o Firebase ID Token.
 * O token é enviado no header Authorization: Bearer <token>.
 */
async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    // Verificar o token com Firebase Admin
    const decodedToken = await req.app.locals.adminAuth.verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (erro) {
    console.error('Erro ao verificar token:', erro.message);
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

/**
 * Busca a configuração de e-mail do usuário no Firestore.
 */
async function obterConfigEmail(uid, db) {
  const docRef = db.doc(`users/${uid}/emailConfig/config`);
  const snap = await docRef.get();
  if (!snap.exists) {
    return null;
  }
  return snap.data();
}

// ══════════════════════════════════════════════════════════
// GET /api/email/fetch — Buscar e-mails do servidor IMAP
// ══════════════════════════════════════════════════════════
router.get('/fetch', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req.uid, req.app.locals.db);
    if (!config || !config.email || !config.senha || !config.imap?.servidor) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    // Buscar e-mails dos últimos 7 dias
    const emails = await buscarEmails(config);

    // Salvar e-mails no Firestore (substituir os existentes)
    const db = req.app.locals.db;
    const batch = db.batch();
    for (const email of emails) {
      const docRef = db.doc(`users/${req.uid}/emails/${email.id}`);
      batch.set(docRef, {
        ...email,
        atualizadoEm: req.app.locals.admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    await batch.commit();

    res.json({
      sucesso: true,
      total: emails.length,
      emails: emails.map(e => ({ id: e.id, de: e.de, assunto: e.assunto, data: e.data })),
    });
  } catch (erro) {
    console.error('Erro ao buscar e-mails:', erro.message);
    res.status(500).json({ erro: `Falha ao buscar e-mails: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/email/send — Enviar e-mail via SMTP
// ══════════════════════════════════════════════════════════
router.post('/send', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req.uid, req.app.locals.db);
    if (!config || !config.email || !config.senha || !config.smtp?.servidor) {
      return res.status(400).json({ erro: 'Configuração SMTP incompleta' });
    }

    const { para, assunto, corpo } = req.body;
    if (!para || !assunto) {
      return res.status(400).json({ erro: 'Destinatário e assunto são obrigatórios' });
    }

    const resultado = await enviarEmail(config, { para, assunto, corpo });
    res.json(resultado);
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro.message);
    res.status(500).json({ erro: `Falha ao enviar e-mail: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/email/test — Testar conexão IMAP e SMTP
// ══════════════════════════════════════════════════════════
router.post('/test', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req.uid, req.app.locals.db);
    if (!config || !config.email || !config.senha) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    // Testar IMAP e SMTP em paralelo
    const [imapResult, smtpResult] = await Promise.all([
      testarConexaoImap(config),
      testarConexaoSmtp(config),
    ]);

    res.json({
      imap: imapResult,
      smtp: smtpResult,
      sucesso: imapResult.sucesso && smtpResult.sucesso,
    });
  } catch (erro) {
    console.error('Erro ao testar conexão:', erro.message);
    res.status(500).json({ erro: `Falha no teste: ${erro.message}` });
  }
});

export default router;
