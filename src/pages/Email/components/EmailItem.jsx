import React from 'react';
import { FiMail, FiEye } from 'react-icons/fi';

/**
 * Componente EmailItem — Nordic Worklog
 * Representa um único e-mail na lista de entrada (inbox).
 * Exibe remetente, assunto, data e indicador de não-lido.
 * O indicador é clicável para alternar lido/não lido.
 * 
 * @param {Object} email - Os dados do e-mail.
 * @param {function} onClick - Callback ao clicar no item (abrir e-mail).
 * @param {function} onToggleLido - Callback para alternar lido/não lido.
 */
export default function EmailItem({ email, onClick, onToggleLido }) {
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
      {/* Indicador de lido/não lido — clicável para alternar */}
      <div
        onClick={(e) => {
          e.stopPropagation(); // Não abrir o e-mail
          if (onToggleLido) onToggleLido(email);
        }}
        style={{
          width: '24px', height: '24px', borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '2px', flexShrink: 0, cursor: 'pointer',
          color: email.lido ? 'var(--text-secondary)' : 'var(--accent-color)',
          opacity: email.lido ? 0.4 : 1,
          transition: 'all 0.2s',
        }}
        title={email.lido ? 'Marcar como não lido' : 'Marcar como lido'}
      >
        {email.lido
          ? <FiEye style={{ fontSize: '0.85rem' }} />
          : <FiMail style={{ fontSize: '0.85rem' }} />
        }
      </div>

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
