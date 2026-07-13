import React, { useState, useCallback } from 'react';
import { FiPlus, FiSettings, FiRefreshCw, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';
import EmailItem from './components/EmailItem';
import EmailRead from './components/EmailRead';
import EmailCompose from './components/EmailCompose';
import EmailSettings from './components/EmailSettings';
import useEmailConfig from '../../hooks/useEmailConfig';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from 'firebase/auth';

/**
 * Página de E-Mail — Nordic Worklog
 * Cliente de e-mail com lista de entrada, leitura, composição e configurações.
 * Busca e-mails reais do servidor IMAP via API backend.
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 * @param {Array} emails - Lista de e-mails do Firestore.
 * @param {function} salvarEmail - Função para salvar e-mail no Firestore.
 * @param {function} marcarLido - Função para marcar e-mail como lido.
 * @param {function} excluirEmail - Função para excluir e-mail do Firestore.
 */
export default function Email({ onTitleChange, emails, salvarEmail, marcarLido, excluirEmail, registerGoBack }) {
  // Configuração do servidor de e-mail (do Firestore)
  const { emailConfig, loading: configLoading, salvarEmailConfig, configValida } = useEmailConfig();
  const { user } = useAuth();

  // Visualização atual: 'lista', 'leitura', 'compor', 'configuracoes'
  const [view, setView] = useState('lista');
  // E-mail selecionado para leitura
  const [emailSelecionado, setEmailSelecionado] = useState(null);
  // Estado de atualização
  const [atualizando, setAtualizando] = useState(false);
  // Mensagem de status da atualização
  const [statusMsg, setStatusMsg] = useState('');
  const [statusTipo, setStatusTipo] = useState(''); // 'sucesso' | 'erro'

  // Ref para a função voltarLista (usado pelo gesto de swipe)
  const voltarListaRef = React.useRef(null);

  // Registra a função de voltar para o gesto de swipe
  React.useEffect(() => {
    if (registerGoBack) {
      registerGoBack(view !== 'lista' ? () => voltarListaRef.current?.() : null);
    }
    return () => { if (registerGoBack) registerGoBack(null); };
  }, [view]);

  // ═══ Navegação entre views ═══

  const abrirEmail = (email) => {
    marcarLido(email.id);
    setEmailSelecionado({ ...email, lido: true });
    setView('leitura');
    if (onTitleChange) onTitleChange('E-Mail');
  };

  const voltarLista = () => {
    setEmailSelecionado(null);
    setView('lista');
    if (onTitleChange) onTitleChange('E-Mail');
  };
  voltarListaRef.current = voltarLista;

  const abrirCompor = () => {
    setView('compor');
    if (onTitleChange) onTitleChange('Novo E-Mail');
  };

  const abrirConfig = () => {
    setView('configuracoes');
    if (onTitleChange) onTitleChange('Configurações');
  };

  // ═══ Ações ═══

  // Atualizar caixa de entrada — chama a API backend para buscar e-mails do IMAP
  const handleAtualizar = useCallback(async () => {
    if (atualizando || !configValida()) return;

    setAtualizando(true);
    setStatusMsg('');
    setStatusTipo('');

    try {
      // Obter o token do Firebase Auth
      const auth = getAuth();
      if (!auth.currentUser) {
        setStatusMsg('Sessão expirada. Faça login novamente.');
        setStatusTipo('erro');
        setAtualizando(false);
        return;
      }
      const token = await auth.currentUser.getIdToken();

      // Chamar a API backend (URL absoluta para compatibilidade com Safari)
      const apiUrl = `${window.location.origin}/api/email/fetch`;
      const resposta = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Falha ao buscar e-mails');
      }

      if (dados.total > 0) {
        setStatusMsg(`${dados.total} e-mail(is) sincronizado(s)`);
        setStatusTipo('sucesso');
      } else {
        setStatusMsg('Nenhum e-mail novo');
        setStatusTipo('sucesso');
      }

      // Limpar mensagem após 4 segundos
      setTimeout(() => { setStatusMsg(''); setStatusTipo(''); }, 4000);
    } catch (erro) {
      console.error('Erro ao atualizar e-mails:', erro);
      setStatusMsg(erro.message || 'Erro ao atualizar');
      setStatusTipo('erro');
    } finally {
      setAtualizando(false);
    }
  }, [atualizando, configValida]);

  // Enviar novo e-mail
  const enviarEmail = async (novoEmail) => {
    const emailId = `email_${Date.now()}`;
    await salvarEmail(emailId, {
      ...novoEmail,
      lido: true,
      data: new Date().toISOString(),
    });
    voltarLista();
  };

  // Excluir e-mail
  const handleExcluirEmail = async (id) => {
    await excluirEmail(id);
    voltarLista();
  };

  // ═══ Renderização condicional por view ═══

  if (view === 'leitura' && emailSelecionado) {
    return <EmailRead email={emailSelecionado} onVoltar={voltarLista} onExcluir={handleExcluirEmail} />;
  }

  if (view === 'compor') {
    return <EmailCompose onVoltar={voltarLista} onEnviar={enviarEmail} emailConta={emailConfig.email || ''} />;
  }

  if (view === 'configuracoes') {
    return <EmailSettings config={emailConfig} salvarEmailConfig={salvarEmailConfig} onVoltar={voltarLista} />;
  }

  // ═══ View: Lista de entrada (Inbox) ═══

  const naoLidos = emails.filter((e) => !e.lido).length;
  const configurado = !configLoading && configValida();

  return (
    <div className="fade-in">
      {/* ═══ Aviso: configuração pendente ═══ */}
      {!configLoading && !configurado && (
        <div
          onClick={abrirConfig}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', marginBottom: '10px',
            backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: '8px', cursor: 'pointer', transition: 'opacity 0.2s',
          }}
        >
          <FiAlertTriangle style={{ fontSize: '0.8rem', color: '#f59e0b', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            Configure seu servidor de e-mail para começar
          </span>
        </div>
      )}

      <div className="card">
        {/* Cabeçalho da inbox com contador e botões */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Caixa de Entrada
            {naoLidos > 0 && (
              <span style={{
                fontSize: '0.6rem', fontWeight: 600, padding: '1px 7px',
                borderRadius: '10px', background: 'var(--accent-color)',
                color: 'var(--bg-primary)',
              }}>
                {naoLidos}
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Botão Atualizar */}
            <button
              onClick={handleAtualizar}
              disabled={atualizando || !configurado}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px', borderRadius: '6px',
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                cursor: (atualizando || !configurado) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', opacity: (atualizando || !configurado) ? 0.4 : 1,
              }}
              title="Atualizar caixa de entrada"
            >
              <FiRefreshCw
                style={{ fontSize: '0.8rem', transition: 'transform 0.8s', transform: atualizando ? 'rotate(360deg)' : 'rotate(0deg)' }}
              />
            </button>
            {/* Botão Configurações */}
            <button
              onClick={abrirConfig}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px', borderRadius: '6px',
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
              }}
              title="Configurações do servidor"
            >
              <FiSettings style={{ fontSize: '0.85rem' }} />
            </button>
          </div>
        </div>

        {/* ═══ Mensagem de status da atualização ═══ */}
        {statusMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            padding: '6px 10px', marginBottom: '8px',
            backgroundColor: statusTipo === 'sucesso' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            borderRadius: '6px', fontSize: '0.75rem',
            color: statusTipo === 'sucesso' ? '#22c55e' : '#ef4444',
          }}>
            {statusTipo === 'sucesso' ? <FiCheck style={{ fontSize: '0.7rem' }} /> : <FiX style={{ fontSize: '0.7rem' }} />}
            {statusMsg}
          </div>
        )}

        {/* ═══ Lista de e-mails ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {emails.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0', opacity: 0.6 }}>
              {configurado ? 'Nenhum e-mail. Toque em atualizar para buscar.' : 'Configure seu servidor para começar.'}
            </p>
          ) : (
            emails.map((email) => (
              <EmailItem
                key={email.id}
                email={email}
                onClick={() => abrirEmail(email)}
              />
            ))
          )}
        </div>
      </div>

      {/* Botão flutuante para compor novo e-mail */}
      <button
        onClick={abrirCompor}
        style={{
          position: 'fixed', bottom: '80px', right: '20px',
          width: '48px', height: '48px', borderRadius: '50%',
          border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.2rem', zIndex: 100,
        }}
        title="Novo E-Mail"
      >
        <FiPlus />
      </button>
    </div>
  );
}
