/**
 * Serviço IMAP — Nordic Worklog
 * 
 * Conecta ao servidor IMAP configurado do usuário e busca e-mails.
 * Usa imapflow para conexão eficiente e assíncrona.
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

/**
 * Cria um cliente IMAP conectado.
 * Função auxiliar para reutilizar a conexão.
 */
function criarCliente(config) {
  const { email, senha, imap } = config;
  return new ImapFlow({
    host: imap.servidor,
    port: imap.porta,
    secure: imap.encriptacao === 'SSL/TLS',
    auth: { user: email, pass: senha },
    logger: false,
  });
}

/**
 * Parseia uma mensagem IMAP em objeto de e-mail.
 */
async function parsearMensagem(msg) {
  const parsed = await simpleParser(msg.source);
  return {
    id: `imap_${msg.uid}`,
    uid: msg.uid,
    de: parsed.from?.text || msg.envelope?.from?.[0]?.address || '',
    para: parsed.to?.text || msg.envelope?.to?.[0]?.address || '',
    cc: parsed.cc?.text || '',
    assunto: parsed.subject || '(Sem assunto)',
    data: parsed.date?.toISOString() || new Date().toISOString(),
    corpo: parsed.text || '',
    corpoHtml: parsed.html || '',
    lido: msg.flags?.has('\\seen') || false,
  };
}

/**
 * Busca todos os e-mails da caixa de entrada (lidos e não lidos).
 * Ordenados por data (mais recente primeiro).
 */
export async function buscarEmails(config) {
  const client = criarCliente(config);
  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    const mensagens = [];
    for await (const msg of client.fetch({ all: true }, {
      uid: true,
      envelope: true,
      bodyStructure: true,
      source: { maxBytes: 1024 * 1024 },
      flags: true,
    })) {
      mensagens.push(await parsearMensagem(msg));
    }

    // Ordenar por data (mais recente primeiro)
    mensagens.sort((a, b) => new Date(b.data) - new Date(a.data));
    return mensagens;
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Busca um e-mail específico pelo UID.
 */
export async function buscarEmailPorUid(config, uid) {
  const client = criarCliente(config);
  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    for await (const msg of client.fetch({ uid: parseInt(uid) }, {
      uid: true,
      envelope: true,
      source: { maxBytes: 2 * 1024 * 1024 },
      flags: true,
    })) {
      return await parsearMensagem(msg);
    }
    return null;
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Marca um e-mail como lido ou não lido.
 */
export async function marcarLido(config, uid, lido = true) {
  const client = criarCliente(config);
  try {
    await client.connect();
    const lock = await client.mailboxOpen('INBOX');

    if (lido) {
      await client.messageFlagsAdd({ uid: parseInt(uid) }, ['\\Seen']);
    } else {
      await client.messageFlagsRemove({ uid: parseInt(uid) }, ['\\Seen']);
    }
    return { sucesso: true, mensagem: lido ? 'Marcado como lido' : 'Marcado como não lido' };
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Exclui um e-mail do servidor IMAP (move para lixeira ou marca como excluído).
 */
export async function excluirEmail(config, uid) {
  const client = criarCliente(config);
  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    // Marcar como deletado e expurgar
    await client.messageFlagsAdd({ uid: parseInt(uid) }, ['\\Deleted']);
    await client.messageFlagsRemove({ uid: parseInt(uid) }, ['\\Seen']);
    
    // Tentar mover para Trash (se existir)
    try {
      await client.messageMove({ uid: parseInt(uid) }, 'Trash');
    } catch {
      // Se não tem pasta Trash, apenas marca como deletado
      await client.messageFlagsAdd({ uid: parseInt(uid) }, ['\\Deleted']);
    }

    return { sucesso: true, mensagem: 'E-mail excluído' };
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Testa a conexão IMAP com as credenciais fornecidas.
 */
export async function testarConexaoImap(config) {
  const client = criarCliente(config);
  try {
    await client.connect();
    await client.logout();
    return { sucesso: true, mensagem: 'Conexão IMAP bem-sucedida' };
  } catch (erro) {
    return { sucesso: false, mensagem: `Erro IMAP: ${erro.message}` };
  }
}
