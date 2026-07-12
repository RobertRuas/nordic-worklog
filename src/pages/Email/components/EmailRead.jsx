import React from 'react';
import { FiArrowLeft, FiTrash2, FiMail } from 'react-icons/fi';

/**
 * Componente EmailRead — Nordic Worklog
 * Exibe o conteúdo completo de um e-mail com opções de voltar e excluir.
 * 
 * @param {Object} email - Os dados completos do e-mail.
 * @param {function} onVoltar - Callback para voltar à lista.
 * @param {function} onExcluir - Callback para excluir o e-mail.
 */
export default function EmailRead({ email, onVoltar, onExcluir }) {
  // Extrai nome e endereço do remetente
  const nomeRemetente = email.de.split('<')[0].trim();
  const emailRemetente = email.de.match(/<(.+)>/)?.[1] || '';

  // Formata a data completa
  const formatarDataCompleta = (data) => {
    const d = new Date(data);
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dias[d.getDay()]}, ${dia}/${mes}/${ano} às ${hora}:${min}`;
  };

  return (
    <div className="fade-in">
      {/* Barra superior com voltar e ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button
          onClick={onVoltar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft /> Voltar
        </button>
        <button
          onClick={() => { onExcluir(email.id); }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef4444' }}
        >
          <FiTrash2 /> Excluir
        </button>
      </div>

      {/* Conteúdo do e-mail */}
      <div className="card">
        {/* Assunto */}
        <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.3 }}>
          {email.assunto}
        </h2>

        {/* Metadados do remetente */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '14px',
        }}>
          {/* Avatar circular com inicial */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0,
          }}>
            {nomeRemetente.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
              {nomeRemetente}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, opacity: 0.7 }}>
              {emailRemetente}
            </p>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6, flexShrink: 0 }}>
            {formatarDataCompleta(email.data)}
          </span>
        </div>

        {/* Corpo do e-mail */}
        <div style={{
          fontSize: '0.82rem', color: 'var(--text-primary)',
          lineHeight: 1.6, whiteSpace: 'pre-wrap',
        }}>
          {email.corpo}
        </div>
      </div>
    </div>
  );
}
