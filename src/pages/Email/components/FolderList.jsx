import React from 'react';
import { FiInbox, FiSend, FiEdit2, FiTrash2, FiAlertTriangle, FiChevronDown } from 'react-icons/fi';

/**
 * Componente FolderList — Nordic Worklog
 * Lista de pastas de e-mail (Caixa de entrada, Enviadas, Rascunhos, Lixeira, Spam).
 * Exibe um menu dropdown para navegar entre as pastas.
 * 
 * @param {Array} pastas - Lista de pastas retornadas pela API.
 * @param {string} pastaAtual - Path da pasta atualmente selecionada.
 * @param {function} onSelecionarPasta - Callback ao selecionar uma pasta.
 */
export default function FolderList({ pastas, pastaAtual, onSelecionarPasta }) {
  const [aberto, setAberto] = React.useState(false);

  // Ícones para cada tipo de pasta
  const icones = {
    inbox: FiInbox,
    sent: FiSend,
    drafts: FiEdit2,
    trash: FiTrash2,
    junk: FiAlertTriangle,
  };

  // Pasta atual (para exibir no botão)
  const pastaAtiva = pastas.find(p => p.path === pastaAtual) || pastas[0];
  const IconeAtivo = icones[pastaAtiva?.icone] || FiInbox;

  return (
    <div style={{ position: 'relative', marginBottom: '8px' }}>
      {/* Botão principal — mostra a pasta atual */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
          padding: '8px 12px', background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)', borderRadius: '8px',
          cursor: 'pointer', fontFamily: 'var(--font-main)',
          fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)',
        }}
      >
        <IconeAtivo style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{pastaAtiva?.nome || 'Pastas'}</span>
        {pastaAtiva?.total > 0 && (
          <span style={{
            background: 'var(--bg-primary)', borderRadius: '10px',
            padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700,
            color: 'var(--text-secondary)',
          }}>
            {pastaAtiva.total}
          </span>
        )}
        <FiChevronDown style={{
          fontSize: '0.7rem', color: 'var(--text-secondary)',
          transform: aberto ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }} />
      </button>

      {/* Dropdown de pastas */}
      {aberto && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: '8px', marginTop: '4px', overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {pastas.map((pasta) => {
            const Icone = icones[pasta.icone] || FiInbox;
            const ativa = pasta.path === pastaAtual;
            return (
              <button
                key={pasta.path}
                onClick={() => {
                  onSelecionarPasta(pasta.path);
                  setAberto(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                  padding: '10px 12px', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-main)', fontSize: '0.8rem',
                  background: ativa ? 'var(--bg-primary)' : 'transparent',
                  color: ativa ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontWeight: ativa ? 600 : 400,
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <Icone style={{ fontSize: '0.85rem', opacity: ativa ? 1 : 0.6 }} />
                <span style={{ flex: 1, textAlign: 'left' }}>{pasta.nome}</span>
                {pasta.total > 0 && (
                  <span style={{
                    background: ativa ? 'var(--accent-color)' : 'var(--bg-primary)',
                    color: ativa ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    borderRadius: '10px', padding: '1px 7px',
                    fontSize: '0.65rem', fontWeight: 700,
                  }}>
                    {pasta.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
