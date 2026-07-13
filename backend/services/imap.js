/**
 * Serviço IMAP — Nordic Worklog
 * 
 * Conecta ao servidor IMAP configurado do usuário e busca e-mails.
 * Usa imapflow para conexão eficiente e assíncrona.
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

/**
 * Busca e-mails não lidos da caixa de entrada.
 * 
 * @param {Object} config - Configuração IMAP do usuário.
 * @param {string} config.email - E-mail do usuário.
 * @param {string} config.senha - Senha do e-mail.
 * @param {Object} config.imap - Dados do servidor IMAP.
 * @param {string} config.imap.servidor - Endereço do servidor.
 * @param {number} config.imap.porta - Porta do servidor.
 * @param {string} config.imap.encriptacao - Tipo de encriptação.
 * @param {Date} [desde] - Buscar e-mails desde esta data (padrão: últimos 7 dias).
 * @returns {Promise<Array>} Lista de e-mails encontrados.
 */
export async function buscarEmails(config, desde = null) {
  const { email, senha, imap } = config;

  // Configurar TLS com base na encriptação
  const tls = imap.encriptacao === 'SSL/TLS';

  // Criar cliente IMAP
  const client = new ImapFlow({
    host: imap.servidor,
    port: imap.porta,
    secure: tls,
    auth: {
      user: email,
      pass: senha,
    },
    logger: false, // Não logar em produção
  });

  try {
    // Conectar ao servidor
    await client.connect();

    // Abrir a caixa de entrada
    const mailbox = await client.mailboxOpen('INBOX');

    // Definir período de busca (padrão: últimos 7 dias)
    const dataDesde = desde || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Buscar todos os e-mails desde a data (lidos e não lidos)
    const mensagens = [];
    for await (const msg of client.fetch({
      since: dataDesde,
    }, {
      uid: true,
      envelope: true,
      bodyStructure: true,
      source: {
        maxBytes: 1024 * 1024, // Limitar a 1MB por e-mail
      },
      flags: true, // Incluir flags para saber se foi lido
    })) {
      // Parsear o e-mail completo
      const parsed = await simpleParser(msg.source);

      mensagens.push({
        id: `imap_${msg.uid}`,
        uid: msg.uid,
        de: parsed.from?.text || msg.envelope?.from?.[0]?.address || '',
        para: parsed.to?.text || msg.envelope?.to?.[0]?.address || '',
        assunto: parsed.subject || '(Sem assunto)',
        data: parsed.date?.toISOString() || new Date().toISOString(),
        corpo: parsed.text || '',
        lido: msg.flags?.has('\\seen') || false,
      });
    }

    return mensagens;
  } finally {
    // Sempre fechar a conexão
    await client.logout().catch(() => {});
  }
}

/**
 * Testa a conexão IMAP com as credenciais fornecidas.
 * 
 * @param {Object} config - Configuração IMAP do usuário.
 * @returns {Promise<Object>} Resultado do teste { sucesso, mensagem }.
 */
export async function testarConexaoImap(config) {
  const { email, senha, imap } = config;
  const tls = imap.encriptacao === 'SSL/TLS';

  const client = new ImapFlow({
    host: imap.servidor,
    port: imap.porta,
    secure: tls,
    auth: {
      user: email,
      pass: senha,
    },
    logger: false,
  });

  try {
    await client.connect();
    await client.logout();
    return { sucesso: true, mensagem: 'Conexão IMAP bem-sucedida' };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: `Erro IMAP: ${erro.message}`,
    };
  }
}
