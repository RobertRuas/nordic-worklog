import React from 'react';

/**
 * Componente EmailItem — Nordic Worklog
 * Representa um único e-mail na lista de entrada (inbox).
 * Exibe remetente, assunto, data e indicador de não-lido.
 * 
 * @param {Object} email - Os dados do e-mail.
 * @param {string} email.de - Remetente (nome <email>).
 * @param {string} email.assunto - Assunto do e-mail.
 * @param {string} email.data - Data/hora do envio (ISO).
 * @param {boolean} email.lido - Se já foi lido.
 * @param {function} onClick - Callback ao clicar no item.
 */
export default function EmailItem({ email, onClick }) {
  // Extrai o nome do remetente (antes do <)
  const nomeRemetente = email.de.split('<')[0].trim();

  // Formata a data para "DD/MM HH:mm"
  const formatarData = (data) => {
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} ${hora}:${min}`;
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
      }}
    >
      {/* Indicador de não-lido (bolinha) */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        marginTop: '5px', flexShrink: 0,
        background: email.lido ? 'transparent' : 'var(--accent-color)',
      }} />

      {/* Conteúdo do e-mail */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Remetente + Data */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: email.lido ? 400 : 600,
            color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {nomeRemetente}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', flexShrink: 0, opacity: 0.7 }}>
            {formatarData(email.data)}
          </span>
        </div>
        {/* Assunto */}
        <p style={{
          fontSize: '0.75rem',
          fontWeight: email.lido ? 400 : 500,
          color: email.lido ? 'var(--text-secondary)' : 'var(--text-primary)',
          margin: '2px 0 0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {email.assunto}
        </p>
      </div>
    </div>
  );
}
