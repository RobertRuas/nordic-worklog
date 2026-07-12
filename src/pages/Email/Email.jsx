import React, { useState } from 'react';
import { FiPlus, FiSettings } from 'react-icons/fi';
import EmailItem from './components/EmailItem';
import EmailRead from './components/EmailRead';
import EmailCompose from './components/EmailCompose';
import EmailSettings from './components/EmailSettings';
import { mockEmails, mockEmailConfig } from '../../data/mockData';

/**
 * Página de E-Mail — Nordic Worklog
 * Cliente de e-mail visual com lista de entrada, leitura, composição e configurações.
 * Dados fictícios — envio e recebimento reais dependem de backend.
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 */
export default function Email({ onTitleChange, registerGoBack }) {
  // Lista de e-mails (dados fictícios do arquivo centralizado)
  const [emails, setEmails] = useState(mockEmails);
  // Visualização atual: 'lista', 'leitura', 'compor', 'configuracoes'
  const [view, setView] = useState('lista');
  // E-mail selecionado para leitura
  const [emailSelecionado, setEmailSelecionado] = useState(null);

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

  // Abre um e-mail para leitura
  const abrirEmail = (email) => {
    // Marca como lido
    setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, lido: true } : e));
    setEmailSelecionado({ ...email, lido: true });
    setView('leitura');
    if (onTitleChange) onTitleChange('E-Mail');
  };

  // Volta para a lista de e-mails
  const voltarLista = () => {
    setEmailSelecionado(null);
    setView('lista');
    if (onTitleChange) onTitleChange('E-Mail');
  };
  // Atualiza a ref para o gesto de swipe
  voltarListaRef.current = voltarLista;

  // Abre o formulário de composição
  const abrirCompor = () => {
    setView('compor');
    if (onTitleChange) onTitleChange('Novo E-Mail');
  };

  // Abre as configurações do servidor
  const abrirConfig = () => {
    setView('configuracoes');
    if (onTitleChange) onTitleChange('Configurações');
  };

  // Envia um novo e-mail (simulado — adiciona à lista)
  const enviarEmail = (novoEmail) => {
    setEmails((prev) => [novoEmail, ...prev]);
    voltarLista();
  };

  // Exclui um e-mail da lista
  const excluirEmail = (id) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    voltarLista();
  };

  // ═══ Renderização condicional por view ═══

  // View: Leitura de e-mail
  if (view === 'leitura' && emailSelecionado) {
    return <EmailRead email={emailSelecionado} onVoltar={voltarLista} onExcluir={excluirEmail} />;
  }

  // View: Composição de e-mail
  if (view === 'compor') {
    return <EmailCompose onVoltar={voltarLista} onEnviar={enviarEmail} emailConta={mockEmailConfig.email} />;
  }

  // View: Configurações do servidor
  if (view === 'configuracoes') {
    return <EmailSettings config={mockEmailConfig} onVoltar={voltarLista} />;
  }

  // ═══ View: Lista de entrada (Inbox) ═══

  // Contador de e-mails não lidos
  const naoLidos = emails.filter((e) => !e.lido).length;

  return (
    <div className="fade-in">
      <div className="card">
        {/* Cabeçalho da inbox com contador e botão de configurações */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 className="card-title" style={{ margin: 0 }}>
            Caixa de Entrada
            {naoLidos > 0 && (
              <span style={{
                fontSize: '0.6rem', fontWeight: 600, padding: '1px 7px',
                borderRadius: '10px', background: 'var(--accent-color)',
                color: 'var(--bg-primary)', marginLeft: '8px',
              }}>
                {naoLidos}
              </span>
            )}
          </h2>
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

        {/* Lista de e-mails */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {emails.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0', opacity: 0.6 }}>
              Nenhum e-mail na caixa de entrada.
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
