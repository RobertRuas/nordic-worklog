import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FiPlus, FiSettings, FiRefreshCw, FiAlertTriangle, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiChevronDown, FiSearch } from 'react-icons/fi';
import EmailItem from './components/EmailItem';
import EmailRead from './components/EmailRead';
import EmailCompose from './components/EmailCompose';
import EmailSettings from './components/EmailSettings';
import FolderList from './components/FolderList';
import useEmailConfig from '../../hooks/useEmailConfig';
import { useAuth } from '../../context/AuthContext';
import { getAuth } from 'firebase/auth';

/**
 * Página de E-Mail — Nordic Worklog
 * Cliente de e-mail completo com:
 * - Lista com paginação e busca
 * - Leitura, resposta e encaminhamento
 * - Exclusão via API (IMAP)
 * - Atualização automática periódica
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 * @param {Array} emails - Lista de e-mails do Firestore (fallback).
 * @param {function} salvarEmail - Função para salvar e-mail no Firestore.
 * @param {function} marcarLido - Função para marcar e-mail como lido.
 * @param {function} excluirEmail - Função para excluir e-mail do Firestore.
 */
export default function Email({ onTitleChange, emails, salvarEmail, marcarLido, excluirEmail, registerGoBack }) {
  const { emailConfig, loading: configLoading, salvarEmailConfig, configValida } = useEmailConfig();
  const { user } = useAuth();

  // ═══ Estado de views ═══
  const [view, setView] = useState('lista'); // 'lista' | 'leitura' | 'compor' | 'configuracoes'
  const [emailSelecionado, setEmailSelecionado] = useState(null);
  const [modoCompor, setModoCompor] = useState(null); // null | { responderPara } | { encaminharEmail }

  // ═══ E-mails vindos da API ═══
  const [emailsApi, setEmailsApi] = useState([]);

  // ═══ Pastas de e-mail ═══
  const [pastas, setPastas] = useState([]);
  const [pastaAtual, setPastaAtual] = useState('INBOX');

  // ═══ Paginação ═══
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [porPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);

  // ═══ Busca ═══
  const [busca, setBusca] = useState('');
  const [mostrarBusca, setMostrarBusca] = useState(false);

  // ═══ Atualização automática ═══
  const [atualizando, setAtualizando] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusTipo, setStatusTipo] = useState('');
  const [ultimoRefresh, setUltimoRefresh] = useState(null);
  const intervaloRef = useRef(null);
  const INTERVALO_MS = 5 * 60 * 1000; // 5 minutos

  // Ref para voltar à lista (swipe)
  const voltarListaRef = React.useRef(null);

  // ═══ Auto-refresh a cada 5 minutos ═══
  useEffect(() => {
    if (!configValida()) return;

    // Buscar pastas e e-mails ao montar
    buscarPastas();
    buscarEmailsPagina(1, true);

    // Configurar intervalo
    intervaloRef.current = setInterval(() => {
      buscarEmailsPagina(paginaAtual, true);
    }, INTERVALO_MS);

    return () => clearInterval(intervaloRef.current);
  }, [configValida]);

  // Registra função voltar para swipe
  React.useEffect(() => {
    if (registerGoBack) {
      registerGoBack(view !== 'lista' ? () => voltarListaRef.current?.() : null);
    }
    return () => { if (registerGoBack) registerGoBack(null); };
  }, [view]);

  // ═══ Função central de busca na API ═══
  const buscarEmailsPagina = useCallback(async (pagina = 1, silencioso = false) => {
    if (!configValida()) return;
    if (!silencioso) setAtualizando(true);
    setStatusMsg('');
    setStatusTipo('');

    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();

      const apiUrl = `${window.location.origin}/api/email/fetch?pagina=${pagina}&porPagina=${porPagina}&pasta=${encodeURIComponent(pastaAtual)}`;
      let resposta;
      try {
        resposta = await fetch(apiUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch {
        if (!silencioso) throw new Error('Servidor indisponível');
        return;
      }

      const dados = await resposta.json().catch(() => null);
      if (!dados) {
        if (!silencioso) throw new Error('Resposta inválida');
        return;
      }
      if (!resposta.ok) {
        if (!silencioso) throw new Error(dados.erro || 'Falha ao buscar');
        return;
      }

      setEmailsApi(dados.emails || []);
      setPaginaAtual(dados.pagina || 1);
      setTotalPaginas(dados.totalPaginas || 1);
      setTotalEmails(dados.total || 0);
      setUltimoRefresh(new Date());

      if (!silencioso && dados.total > 0) {
        setStatusMsg(`${dados.total} e-mail(is) — pág. ${dados.pagina}/${dados.totalPaginas}`);
        setStatusTipo('sucesso');
        setTimeout(() => { setStatusMsg(''); setStatusTipo(''); }, 3000);
      }
    } catch (erro) {
      if (!silencioso) {
        setStatusMsg(erro.message || 'Erro ao atualizar');
        setStatusTipo('erro');
      }
    } finally {
      setAtualizando(false);
    }
  }, [configValida, porPagina, pastaAtual]);

  // ═══ Buscar pastas de e-mail ═══
  const buscarPastas = useCallback(async () => {
    if (!configValida()) return;
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();

      const resposta = await fetch(`${window.location.origin}/api/email/folders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const dados = await resposta.json().catch(() => null);
      if (dados?.sucesso && dados.pastas) {
        setPastas(dados.pastas);
      }
    } catch {}
  }, [configValida]);

  // ═══ Ações de e-mail ═══

  const handleAtualizar = () => buscarEmailsPagina(paginaAtual);

  const irPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      buscarEmailsPagina(novaPagina);
    }
  };

  // ═══ Carregando e-mail completo ═══
  const [carregandoEmail, setCarregandoEmail] = useState(false);

  // Abrir e-mail para leitura — busca o corpo completo via API
  const abrirEmail = async (email) => {
    // Marcar como lido na API (em background)
    try {
      const auth = getAuth();
      if (auth.currentUser && email.uid) {
        const token = await auth.currentUser.getIdToken();
        fetch(`${window.location.origin}/api/email/mark-read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: email.uid, lido: true }),
        }).catch(() => {});
      }
    } catch {}

    // Atualizar estado local (marcar como lido)
    setEmailsApi(prev => prev.map(e => e.id === email.id ? { ...e, lido: true } : e));

    // Buscar e-mail completo (com corpo) via API
    if (email.uid && !email.corpo) {
      setCarregandoEmail(true);
      setEmailSelecionado({ ...email, lido: true });
      setView('leitura');
      if (onTitleChange) onTitleChange('E-Mail');

      try {
        const auth = getAuth();
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
        const resposta = await fetch(`${window.location.origin}/api/email/${email.uid}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const dados = await resposta.json().catch(() => null);
        if (dados?.sucesso && dados.email) {
          setEmailSelecionado({ ...dados.email, lido: true });
        }
      } catch {}
      setCarregandoEmail(false);
    } else {
      // Já tem o corpo (fallback)
      setEmailSelecionado({ ...email, lido: true });
      setView('leitura');
      if (onTitleChange) onTitleChange('E-Mail');
    }
  };

  // Excluir e-mail via API
  const handleExcluir = async (id, uid) => {
    try {
      const auth = getAuth();
      if (auth.currentUser && uid) {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${window.location.origin}/api/email/delete/${uid}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}

    // Remover da lista local
    setEmailsApi(prev => prev.filter(e => e.id !== id));
    voltarLista();
  };

  // Alternar lido/não lido via API
  const handleToggleLido = async (email) => {
    const novoStatus = !email.lido;

    // Atualizar estado local imediatamente (optimistic update)
    setEmailsApi(prev => prev.map(e =>
      e.id === email.id ? { ...e, lido: novoStatus } : e
    ));

    // Chamar API (em background)
    try {
      const auth = getAuth();
      if (auth.currentUser && email.uid) {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${window.location.origin}/api/email/mark-read`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: email.uid, lido: novoStatus }),
        }).catch(() => {});
      }
    } catch {}
  };

  // Responder e-mail
  const handleResponder = (email) => {
    setModoCompor({ responderPara: email });
    setView('compor');
    if (onTitleChange) onTitleChange('Responder');
  };

  // Encaminhar e-mail
  const handleEncaminhar = (email) => {
    setModoCompor({ encaminharEmail: email });
    setView('compor');
    if (onTitleChange) onTitleChange('Encaminhar');
  };

  // Voltar à lista
  const voltarLista = () => {
    setEmailSelecionado(null);
    setModoCompor(null);
    setView('lista');
    if (onTitleChange) onTitleChange('E-Mail');
  };
  voltarListaRef.current = voltarLista;

  // Selecionar pasta
  const handleSelecionarPasta = (pasta) => {
    if (pasta === pastaAtual) return;
    setPastaAtual(pasta);
    setPaginaAtual(1);
    buscarEmailsPagina(1, true);
    buscarPastas(); // Atualizar contadores
  };

  const abrirCompor = () => {
    setModoCompor(null);
    setView('compor');
    if (onTitleChange) onTitleChange('Novo E-Mail');
  };

  const abrirConfig = () => {
    setView('configuracoes');
    if (onTitleChange) onTitleChange('Configurações');
  };

  // ═══ Filtro de busca ═══
  const [filtroRemetente, setFiltroRemetente] = useState('');

  // Lista de remetentes únicos (para o filtro)
  const remetentesUnicos = React.useMemo(() => {
    const set = new Set();
    emailsApi.forEach(e => {
      const nome = e.de?.split('<')[0].trim().replace(/"/g, '') || e.de;
      if (nome) set.add(nome);
    });
    return Array.from(set).sort();
  }, [emailsApi]);

  // Aplicar ambos os filtros (busca textual + remetente)
  const listaFiltrada = emailsApi.filter(e => {
    const nomeRemetente = e.de?.split('<')[0].trim().replace(/"/g, '') || e.de;
    const matchBusca = !busca || (
      e.assunto?.toLowerCase().includes(busca.toLowerCase()) ||
      e.de?.toLowerCase().includes(busca.toLowerCase())
    );
    const matchRemetente = !filtroRemetente || nomeRemetente === filtroRemetente;
    return matchBusca && matchRemetente;
  });

  // ═══ Acordeão: separar lidos e não lidos ═══
  const [acordeaoNaoLidos, setAcordeaoNaoLidos] = useState(true);
  const [acordeaoLidos, setAcordeaoLidos] = useState(false);

  const emailsNaoLidos = listaFiltrada.filter(e => !e.lido);
  const emailsLidos = listaFiltrada.filter(e => e.lido);

  // ═══ Renderização condicional ═══

  if (view === 'leitura' && emailSelecionado) {
    return (
      <EmailRead
        email={emailSelecionado}
        carregando={carregandoEmail}
        onVoltar={voltarLista}
        onExcluir={handleExcluir}
        onResponder={handleResponder}
        onEncaminhar={handleEncaminhar}
      />
    );
  }

  if (view === 'compor') {
    return (
      <EmailCompose
        onVoltar={voltarLista}
        onEnviado={() => buscarEmailsPagina(1)}
        emailConta={emailConfig.email || ''}
        responderPara={modoCompor?.responderPara}
        encaminharEmail={modoCompor?.encaminharEmail}
      />
    );
  }

  if (view === 'configuracoes') {
    return <EmailSettings config={emailConfig} salvarEmailConfig={salvarEmailConfig} onVoltar={voltarLista} />;
  }

  // ═══ View: Lista de entrada ═══
  const naoLidos = emailsApi.filter((e) => !e.lido).length;
  const configurado = !configLoading && configValida();

  // Formatar tempo desde último refresh
  const tempoDesdeRefresh = () => {
    if (!ultimoRefresh) return '';
    const diff = Math.floor((Date.now() - ultimoRefresh.getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff}min`;
    return `${Math.floor(diff / 60)}h`;
  };

  return (
    <div className="fade-in">
      {/* Aviso: configuração pendente */}
      {!configLoading && !configurado && (
        <div
          onClick={abrirConfig}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px', marginBottom: '10px',
            backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: '8px', cursor: 'pointer',
          }}
        >
          <FiAlertTriangle style={{ fontSize: '0.8rem', color: '#f59e0b', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            Configure seu servidor de e-mail para começar
          </span>
        </div>
      )}

      <div className="card">
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Caixa de Entrada
            {naoLidos > 0 && (
              <span style={{
                fontSize: '0.6rem', fontWeight: 600, padding: '1px 7px',
                borderRadius: '10px', background: 'var(--accent-color)', color: 'var(--bg-primary)',
              }}>
                {naoLidos}
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Botão Busca */}
            <button
              onClick={() => setMostrarBusca(!mostrarBusca)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px', borderRadius: '6px',
                border: '1px solid var(--border-color)',
                color: mostrarBusca ? 'var(--accent-color)' : 'var(--text-secondary)',
              }}
              title="Buscar"
            >
              <FiSearch style={{ fontSize: '0.8rem' }} />
            </button>
            {/* Botão Atualizar */}
            <button
              onClick={handleAtualizar}
              disabled={atualizando || !configurado}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px', borderRadius: '6px',
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                cursor: (atualizando || !configurado) ? 'not-allowed' : 'pointer',
                opacity: (atualizando || !configurado) ? 0.4 : 1,
              }}
              title="Atualizar"
            >
              <FiRefreshCw
                style={{ fontSize: '0.8rem', transform: atualizando ? 'rotate(360deg)' : 'rotate(0deg)', transition: 'transform 0.8s' }}
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
              title="Configurações"
            >
              <FiSettings style={{ fontSize: '0.85rem' }} />
            </button>
          </div>
        </div>

        {/* Info sutil do último refresh */}
        {ultimoRefresh && (
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '6px', textAlign: 'right' }}>
            atualizado {tempoDesdeRefresh()} atrás · auto a cada 5min
          </div>
        )}

        {/* Seletor de pastas */}
        {pastas.length > 0 && (
          <FolderList
            pastas={pastas}
            pastaAtual={pastaAtual}
            onSelecionarPasta={handleSelecionarPasta}
          />
        )}

        {/* Campo de busca + filtro por remetente */}
        {(mostrarBusca || filtroRemetente) && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {/* Busca textual */}
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar assunto..."
              autoFocus={mostrarBusca}
              style={{
                flex: 1, minWidth: '120px', background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: '6px',
                padding: '5px 10px', fontSize: '0.8rem', color: 'var(--text-primary)',
                fontFamily: 'var(--font-main)', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {/* Filtro por remetente */}
            <select
              value={filtroRemetente}
              onChange={(e) => setFiltroRemetente(e.target.value)}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: '6px', padding: '5px 8px', fontSize: '0.75rem',
                color: 'var(--text-primary)', fontFamily: 'var(--font-main)',
                outline: 'none', cursor: 'pointer', minWidth: '100px',
              }}
            >
              <option value="">Todos remetentes</option>
              {remetentesUnicos.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status */}
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

        {/* Lista de e-mails em acordeão */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {listaFiltrada.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0', opacity: 0.6 }}>
              {busca ? 'Nenhum resultado encontrado.' : configurado ? 'Nenhum e-mail. Toque em atualizar.' : 'Configure seu servidor.'}
            </p>
          ) : (
            <>
              {/* Seção: Não Lidos */}
              {emailsNaoLidos.length > 0 && (
                <div>
                  <button
                    onClick={() => setAcordeaoNaoLidos(!acordeaoNaoLidos)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                      padding: '8px 10px', background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)', borderRadius: '8px',
                      cursor: 'pointer', fontFamily: 'var(--font-main)',
                      fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                      marginBottom: acordeaoNaoLidos ? '2px' : '0',
                      borderBottomLeftRadius: acordeaoNaoLidos ? '0' : '8px',
                      borderBottomRightRadius: acordeaoNaoLidos ? '0' : '8px',
                    }}
                  >
                    {acordeaoNaoLidos ? <FiChevronDown style={{ fontSize: '0.7rem' }} /> : <FiChevronRight style={{ fontSize: '0.7rem' }} />}
                    Não lidos
                    <span style={{
                      background: 'var(--accent-color)', color: 'var(--bg-primary)',
                      borderRadius: '10px', padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700,
                    }}>
                      {emailsNaoLidos.length}
                    </span>
                  </button>
                  {acordeaoNaoLidos && emailsNaoLidos.map((email) => (
                    <div key={email.id} style={{ padding: '0 8px', borderLeft: '2px solid var(--border-color)', marginLeft: '8px' }}>
                      <EmailItem
                        email={email}
                        onClick={() => abrirEmail(email)}
                        onToggleLido={handleToggleLido}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Seção: Lidos */}
              {emailsLidos.length > 0 && (
                <div>
                  <button
                    onClick={() => setAcordeaoLidos(!acordeaoLidos)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
                      padding: '8px 10px', background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)', borderRadius: '8px',
                      cursor: 'pointer', fontFamily: 'var(--font-main)',
                      fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
                      marginBottom: acordeaoLidos ? '2px' : '0',
                      borderBottomLeftRadius: acordeaoLidos ? '0' : '8px',
                      borderBottomRightRadius: acordeaoLidos ? '0' : '8px',
                    }}
                  >
                    {acordeaoLidos ? <FiChevronDown style={{ fontSize: '0.7rem' }} /> : <FiChevronRight style={{ fontSize: '0.7rem' }} />}
                    Lidos
                    <span style={{
                      background: 'var(--border-color)', color: 'var(--text-secondary)',
                      borderRadius: '10px', padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700,
                    }}>
                      {emailsLidos.length}
                    </span>
                  </button>
                  {acordeaoLidos && emailsLidos.map((email) => (
                    <div key={email.id} style={{ padding: '0 8px', borderLeft: '2px solid var(--border-color)', marginLeft: '8px' }}>
                      <EmailItem
                        email={email}
                        onClick={() => abrirEmail(email)}
                        onToggleLido={handleToggleLido}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && !busca && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
            marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-color)',
          }}>
            <button
              onClick={() => irPagina(paginaAtual - 1)}
              disabled={paginaAtual <= 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                cursor: paginaAtual <= 1 ? 'not-allowed' : 'pointer',
                opacity: paginaAtual <= 1 ? 0.3 : 1,
              }}
            >
              <FiChevronLeft style={{ fontSize: '0.85rem' }} />
            </button>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {paginaAtual} / {totalPaginas}
            </span>
            <button
              onClick={() => irPagina(paginaAtual + 1)}
              disabled={paginaAtual >= totalPaginas}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '6px',
                border: '1px solid var(--border-color)', color: 'var(--text-secondary)',
                cursor: paginaAtual >= totalPaginas ? 'not-allowed' : 'pointer',
                opacity: paginaAtual >= totalPaginas ? 0.3 : 1,
              }}
            >
              <FiChevronRight style={{ fontSize: '0.85rem' }} />
            </button>
          </div>
        )}
      </div>

      {/* Botão flutuante para compor */}
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
