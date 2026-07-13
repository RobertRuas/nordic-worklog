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
    lido: msg.flags?.has('\\Seen') || false,
  };
}

/**
 * Lista as pastas disponíveis no servidor IMAP.
 * Retorna apenas pastas especiais (Inbox, Sent, Drafts, Trash, Junk).
 */
export async function listarPastas(config) {
  const client = criarCliente(config);
  try {
    await client.connect();
    const lista = await client.list();

    // Mapear pastas especiais por tipo
    const pastas = [];
    const vistos = new Set();

    const mapaTipos = {
      '\\Inbox': { nome: 'Caixa de entrada', icone: 'inbox' },
      '\\Sent': { nome: 'Enviadas', icone: 'send' },
      '\\Drafts': { nome: 'Rascunhos', icone: 'edit' },
      '\\Trash': { nome: 'Lixeira', icone: 'trash' },
      '\\Junk': { nome: 'Spam', icone: 'alert' },
    };

    for (const pasta of lista) {
      const tipo = pasta.specialUse;
      if (tipo && mapaTipos[tipo] && !vistos.has(tipo)) {
        vistos.add(tipo);
        // Contar mensagens na pasta
        let total = 0, naoLidos = 0;
        try {
          await client.mailboxOpen(pasta.path);
          total = client.mailbox?.exists || 0;
          naoLidos = client.mailbox?.specialUseExists || 0;
        } catch {}

        pastas.push({
          path: pasta.path,
          nome: mapaTipos[tipo].nome,
          icone: mapaTipos[tipo].icone,
          tipo: tipo.replace('\\', '').toLowerCase(),
          total,
        });
      }
    }

    // Garantir que Inbox está sempre presente
    if (!pastas.find(p => p.tipo === 'inbox')) {
      pastas.unshift({ path: 'INBOX', nome: 'Caixa de entrada', icone: 'inbox', tipo: 'inbox', total: 0 });
    }

    return pastas;
  } finally {
    await client.logout().catch(() => {});
  }
}

/**
 * Busca todos os e-mails de uma pasta específica.
 * Padrão: INBOX.
 */
export async function buscarEmails(config, pasta = 'INBOX') {
  const client = criarCliente(config);
  try {
    await client.connect();
    await client.mailboxOpen(pasta);

    // Se a pasta está vazia, retornar array vazio
    if (!client.mailbox?.exists) {
      return [];
    }

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
