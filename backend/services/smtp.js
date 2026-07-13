/**
 * Serviço SMTP — Nordic Worklog
 * 
 * Envia e-mails através do servidor SMTP configurado do usuário.
 * Usa nodemailer para envio confiável.
 */

import nodemailer from 'nodemailer';

/**
 * Envia um e-mail através do servidor SMTP.
 * 
 * @param {Object} config - Configuração SMTP do usuário.
 * @param {string} config.email - E-mail do usuário (remetente).
 * @param {string} config.senha - Senha do e-mail.
 * @param {Object} config.smtp - Dados do servidor SMTP.
 * @param {string} config.smtp.servidor - Endereço do servidor.
 * @param {number} config.smtp.porta - Porta do servidor.
 * @param {string} config.smtp.encriptacao - Tipo de encriptação.
 * @param {Object} email - Dados do e-mail a enviar.
 * @param {string} email.para - Destinatário.
 * @param {string} email.assunto - Assunto do e-mail.
 * @param {string} email.corpo - Corpo do e-mail (HTML ou texto).
 * @returns {Promise<Object>} Resultado do envio { sucesso, mensagem, messageId }.
 */
export async function enviarEmail(config, email) {
  const { email: remetente, senha, smtp } = config;

  // Configurar transporte SMTP
  const secure = smtp.encriptacao === 'SSL/TLS';
  const transporter = nodemailer.createTransport({
    host: smtp.servidor,
    port: smtp.porta,
    secure: secure, // true para 465 (SSL), false para 587 (STARTTLS)
    auth: {
      user: remetente,
      pass: senha,
    },
  });

  // Enviar o e-mail
  const info = await transporter.sendMail({
    from: remetente,
    to: email.para,
    subject: email.assunto,
    text: email.corpo,
  });

  return {
    sucesso: true,
    mensagem: 'E-mail enviado com sucesso',
    messageId: info.messageId,
  };
}

/**
 * Testa a conexão SMTP com as credenciais fornecidas.
 * 
 * @param {Object} config - Configuração SMTP do usuário.
 * @returns {Promise<Object>} Resultado do teste { sucesso, mensagem }.
 */
export async function testarConexaoSmtp(config) {
  const { email: remetente, senha, smtp } = config;
  const secure = smtp.encriptacao === 'SSL/TLS';

  const transporter = nodemailer.createTransport({
    host: smtp.servidor,
    port: smtp.porta,
    secure: secure,
    auth: {
      user: remetente,
      pass: senha,
    },
  });

  try {
    // Verificar a conexão
    await transporter.verify();
    return { sucesso: true, mensagem: 'Conexão SMTP bem-sucedida' };
  } catch (erro) {
    return {
      sucesso: false,
      mensagem: `Erro SMTP: ${erro.message}`,
    };
  }
}
