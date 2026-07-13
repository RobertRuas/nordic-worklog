/**
 * Rotas de E-Mail — Nordic Worklog
 * 
 * Endpoints da API para buscar, enviar, excluir e gerenciar e-mails.
 * 
 * Em produção: requer Firebase ID Token no header Authorization.
 * Em desenvolvimento (modoDev=true): auth opcional, config via body/env.
 */

import { Router } from 'express';
import { buscarEmails, buscarEmailPorUid, testarConexaoImap, marcarLido, excluirEmail, listarPastas } from '../services/imap.js';
import { enviarEmail, testarConexaoSmtp } from '../services/smtp.js';

const router = Router();

/**
 * Middleware de autenticação — valida o Firebase ID Token.
 * Em modo dev, permite requisição sem token (UID fixo para testes).
 */
async function autenticar(req, res, next) {
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
 * Busca a configuração de e-mail do usuário.
 * Em modo dev, usa variáveis de ambiente.
 */
async function obterConfigEmail(req) {
  if (req.app.locals.modoDev) {
    if (req.body?._emailConfig) return req.body._emailConfig;
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

  const db = req.app.locals.db;
  const docRef = db.doc(`users/${req.uid}/emailConfig/config`);
  const snap = await docRef.get();
  if (!snap.exists) return null;
  return snap.data();
}

// ══════════════════════════════════════════════════════════
// GET /api/email/folders — Listar pastas de e-mail
// ══════════════════════════════════════════════════════════
router.get('/folders', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha || !config?.imap?.servidor) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    const pastas = await listarPastas(config);
    res.json({ sucesso: true, pastas });
  } catch (erro) {
    console.error('Erro ao listar pastas:', erro.message);
    res.status(500).json({ erro: `Falha ao listar pastas: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/email/fetch — Buscar e-mails (com paginação e pasta)
// ══════════════════════════════════════════════════════════
router.get('/fetch', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha || !config?.imap?.servidor) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    const pagina = parseInt(req.query.pagina) || 1;
    const porPagina = parseInt(req.query.porPagina) || 10;
    const pasta = req.query.pasta || 'INBOX';

    const todosEmails = await buscarEmails(config, pasta);
    const inicio = (pagina - 1) * porPagina;
    const emailsPagina = todosEmails.slice(inicio, inicio + porPagina);

    // Salvar no Firestore (apenas em produção)
    if (!req.app.locals.modoDev && emailsPagina.length > 0) {
      const db = req.app.locals.db;
      const batch = db.batch();
      for (const email of emailsPagina) {
        const docRef = db.doc(`users/${req.uid}/emails/${email.id}`);
        batch.set(docRef, { ...email, atualizadoEm: req.app.locals.admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
      await batch.commit();
    }

    res.json({
      sucesso: true,
      total: todosEmails.length,
      pagina,
      porPagina,
      totalPaginas: Math.ceil(todosEmails.length / porPagina),
      emails: emailsPagina.map(e => ({
        id: e.id, uid: e.uid, de: e.de, para: e.para,
        assunto: e.assunto, data: e.data, lido: e.lido,
      })),
    });
  } catch (erro) {
    console.error('Erro ao buscar e-mails:', erro.message);
    res.status(500).json({ erro: `Falha ao buscar e-mails: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// GET /api/email/:uid — Buscar e-mail específico por UID
// ══════════════════════════════════════════════════════════
router.get('/:uid', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    const email = await buscarEmailPorUid(config, req.params.uid);
    if (!email) {
      return res.status(404).json({ erro: 'E-mail não encontrado' });
    }

    res.json({ sucesso: true, email });
  } catch (erro) {
    console.error('Erro ao buscar e-mail:', erro.message);
    res.status(500).json({ erro: `Falha ao buscar e-mail: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/email/send — Enviar e-mail via SMTP
// ══════════════════════════════════════════════════════════
router.post('/send', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha || !config?.smtp?.servidor) {
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
// POST /api/email/mark-read — Marcar como lido/não lido
// ══════════════════════════════════════════════════════════
router.post('/mark-read', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    const { uid, lido } = req.body;
    if (!uid) {
      return res.status(400).json({ erro: 'UID do e-mail é obrigatório' });
    }

    const resultado = await marcarLido(config, uid, lido !== false);
    res.json(resultado);
  } catch (erro) {
    console.error('Erro ao marcar e-mail:', erro.message);
    res.status(500).json({ erro: `Falha ao marcar e-mail: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// DELETE /api/email/:uid — Excluir e-mail do servidor
// ══════════════════════════════════════════════════════════
router.delete('/:uid', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

    const resultado = await excluirEmail(config, req.params.uid);
    res.json(resultado);
  } catch (erro) {
    console.error('Erro ao excluir e-mail:', erro.message);
    res.status(500).json({ erro: `Falha ao excluir e-mail: ${erro.message}` });
  }
});

// ══════════════════════════════════════════════════════════
// POST /api/email/test — Testar conexão IMAP e SMTP
// ══════════════════════════════════════════════════════════
router.post('/test', autenticar, async (req, res) => {
  try {
    const config = await obterConfigEmail(req);
    if (!config?.email || !config?.senha) {
      return res.status(400).json({ erro: 'Configuração de e-mail incompleta' });
    }

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
