import React from 'react';
import { FiArrowLeft, FiServer, FiLock, FiMail } from 'react-icons/fi';

/**
 * Componente EmailSettings — Nordic Worklog
 * Exibe as configurações do servidor de e-mail (POP e SMTP).
 * 
 * @param {Object} config - Configuração do servidor de e-mail.
 * @param {function} onVoltar - Callback para voltar à lista.
 */
export default function EmailSettings({ config, onVoltar }) {
  // Estilo para seções de configuração
  const estiloSecao = {
    fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    marginTop: '16px', marginBottom: '8px', paddingBottom: '6px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', gap: '6px',
  };

  // Estilo para linhas de informação
  const estiloLinha = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0', borderBottom: '1px solid var(--border-color)',
  };

  const estiloLabel = {
    fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.7,
  };

  const estiloValor = {
    fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)',
  };

  return (
    <div className="fade-in">
      {/* Barra superior */}
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={onVoltar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft /> Voltar
        </button>
      </div>

      <div className="card">
        {/* Conta de e-mail */}
        <div style={estiloSecao}>
          <FiMail /> Conta
        </div>
        <div style={estiloLinha}>
          <span style={estiloLabel}>E-mail</span>
          <span style={estiloValor}>{config.email}</span>
        </div>
        <div style={{ ...estiloLinha, borderBottom: 'none' }}>
          <span style={estiloLabel}>Senha</span>
          <span style={estiloValor}>{config.senha}</span>
        </div>

        {/* Servidor de Entrada (POP) */}
        <div style={estiloSecao}>
          <FiServer /> Servidor de Entrada (POP)
        </div>
        <div style={estiloLinha}>
          <span style={estiloLabel}>Servidor</span>
          <span style={estiloValor}>{config.pop.servidor}</span>
        </div>
        <div style={estiloLinha}>
          <span style={estiloLabel}>Porta</span>
          <span style={estiloValor}>{config.pop.porta}</span>
        </div>
        <div style={{ ...estiloLinha, borderBottom: 'none' }}>
          <span style={estiloLabel}>Encriptação</span>
          <span style={{ ...estiloValor, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiLock style={{ fontSize: '0.65rem', color: '#22c55e' }} />
            {config.pop.encriptacao}
          </span>
        </div>

        {/* Servidor de Saída (SMTP) */}
        <div style={estiloSecao}>
          <FiServer /> Servidor de Saída (SMTP)
        </div>
        <div style={estiloLinha}>
          <span style={estiloLabel}>Servidor</span>
          <span style={estiloValor}>{config.smtp.servidor}</span>
        </div>
        <div style={estiloLinha}>
          <span style={estiloLabel}>Porta</span>
          <span style={estiloValor}>{config.smtp.porta}</span>
        </div>
        <div style={{ ...estiloLinha, borderBottom: 'none' }}>
          <span style={estiloLabel}>Encriptação</span>
          <span style={{ ...estiloValor, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FiLock style={{ fontSize: '0.65rem', color: '#22c55e' }} />
            {config.smtp.encriptacao}
          </span>
        </div>

        {/* Aviso sobre funcionamento */}
        <p style={{
          fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6,
          marginTop: '14px', lineHeight: 1.4, textAlign: 'center',
        }}>
          Configurações salvas localmente. Envio e recebimento reais dependem de integração com backend.
        </p>
      </div>
    </div>
  );
}
