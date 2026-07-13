/**
 * Rotas de E-Mail — Nordic Worklog
 * 
 * Endpoints da API para buscar, enviar e testar conexões de e-mail.
 * 
 * Em produção: requer Firebase ID Token no header Authorization.
 * Em desenvolvimento (modoDev=true): auth opcional, config via body.
 */

import { Router } from 'express';
import { buscarEmails, testarConexaoImap } from '../services/imap.js';
import { enviarEmail, testarConexaoSmtp } from '../services/smtp.js';

const router = Router();

/**
 * Middleware de autenticação — valida o Firebase ID Token.
 * Em modo dev, permite requisição sem token (UID fixo para testes).
 */
async function autenticar(req, res, next) {
  // Modo dev — pular autenticação
  if (req.app.locals.modoDev) {
    req.uid = 'dev-user';
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await req.app.locals.firebaseAuth.verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (erro) {
    console.error('Erro ao verificar token:', erro.message);
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

/**
 * Busca a configuração de e-mail do usuário no Firestore.
 * Em modo dev, usa a config enviada no body da requisição.
 */
async function obterConfigEmail(req) {
  // Modo dev — usar config do body ou variáveis de ambiente
  if (req.app.locals.modoDev) {
    // Aceitar config diretamente no body (útil para testes)
    if (req.body?._emailConfig) {
      return req.body._emailConfig;
    }
    // Fallback: variáveis de ambiente
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      return {
        email: process.env.EMAIL_USER,
        senha: process.env.EMAIL_PASS,
        imap: { servidor: 'imap.one.com', porta: 993, encriptacao: 'SSL/TLS' },
        smtp: { servidor: 'send.one.com', porta: 465, encriptacao: 'SSL/TLS' },
      };
    }
    return null;
  }

  // Produção — buscar no Firestore
  const db = req.app.locals.db;
  const docRef = db.doc(`users/${req.uid}/emailConfig/config`);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

// ══════════════════════════════════════════════════════════
// GET /api/email/fetch — Buscar e-mails do servidor IMAP
// ══════════════════════════════════════════════════════════
router.get('/fetch', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config || !config.email || !config.senha || !config.imap?.servidor) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    // Buscar e-mails do IMAP
    const emails = await buscarEmails(config);

    // Salvar e-mails no Firestore (apenas em produção)
    if (!req.app.locals.modoDev && emails.length > 0) {
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
    }

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
    const config = await obterConfigEmail(req);
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
    const config = await obterConfigEmail(req);
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
