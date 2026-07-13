import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiServer, FiLock, FiMail, FiSave, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { getAuth } from 'firebase/auth';

/**
 * Componente EmailSettings — Nordic Worklog
 * Formulário editável para configurar o servidor de e-mail (IMAP e SMTP).
 * Salva no Firestore e permite testar se a configuração está completa.
 * 
 * @param {Object} config - Configuração atual do servidor de e-mail.
 * @param {function} salvarEmailConfig - Callback para salvar no Firestore.
 * @param {function} onVoltar - Callback para voltar à lista.
 */
export default function EmailSettings({ config, salvarEmailConfig, onVoltar }) {
  // Estado local do formulário (inicializado com os valores do Firestore)
  const [form, setForm] = useState({
    email: '',
    senha: '',
    imap: { servidor: 'imap.one.com', porta: 993, encriptacao: 'SSL/TLS' },
    smtp: { servidor: 'send.one.com', porta: 465, encriptacao: 'SSL/TLS' },
  });
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMsg, setTipoMsg] = useState(''); // 'sucesso' | 'erro' | 'info'

  // Sincronizar estado local quando o config do Firestore carregar
  useEffect(() => {
    if (config) {
      setForm({
        email: config.email || '',
        senha: config.senha || '',
        imap: { servidor: 'imap.one.com', porta: 993, encriptacao: 'SSL/TLS', ...config.imap },
        smtp: { servidor: 'send.one.com', porta: 465, encriptacao: 'SSL/TLS', ...config.smtp },
      });
    }
  }, [config]);

  // ═══ Atualizar campo do formulário ═══
  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const atualizarImap = (campo, valor) => {
    setForm((prev) => ({ ...prev, imap: { ...prev.imap, [campo]: valor } }));
  };

  const atualizarSmtp = (campo, valor) => {
    setForm((prev) => ({ ...prev, smtp: { ...prev.smtp, [campo]: valor } }));
  };

  // ═══ Mostrar mensagem com cor adequada ═══
  const mostrarMsg = (texto, tipo = 'info') => {
    setMensagem(texto);
    setTipoMsg(tipo);
    if (tipo !== 'erro') setTimeout(() => setMensagem(''), 3500);
  };

  // ═══ Validar campos obrigatórios ═══
  const validar = () => {
    if (!form.email.trim()) return 'Informe o e-mail';
    if (!form.senha.trim()) return 'Informe a senha';
    if (!form.imap.servidor.trim()) return 'Informe o servidor IMAP';
    if (!form.smtp.servidor.trim()) return 'Informe o servidor SMTP';
    return null;
  };

  const [testando, setTestando] = useState(false);

  // ═══ Testar configuração via API backend ═══
  const handleTestar = async () => {
    const erro = validar();
    if (erro) {
      mostrarMsg(erro, 'erro');
      return;
    }

    // Primeiro salvar para garantir que o backend tem a config atualizada
    setTestando(true);
    setMensagem('');
    try {
      await salvarEmailConfig(form);

      // Obter token do Firebase Auth
      const auth = getAuth();
      if (!auth.currentUser) {
        mostrarMsg('Sessão expirada. Faça login novamente.', 'erro');
        setTestando(false);
        return;
      }
      const token = await auth.currentUser.getIdToken();

      // Chamar a API de teste (URL absoluta para compatibilidade com Safari)
      const apiUrl = `${window.location.origin}/api/email/test`;
      let resposta;
      try {
        resposta = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (fetchErro) {
        throw new Error('Servidor indisponível. Verifique sua conexão.');
      }

      const dados = await resposta.json().catch(() => null);
      if (!dados) {
        throw new Error('Resposta inválida do servidor');
      }

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Falha no teste');
      }

      // Montar mensagem com resultado detalhado
      const partes = [];
      if (dados.imap?.sucesso) partes.push('IMAP ✓');
      else if (dados.imap?.mensagem) partes.push(`IMAP ✗`);
      if (dados.smtp?.sucesso) partes.push('SMTP ✓');
      else if (dados.smtp?.mensagem) partes.push(`SMTP ✗`);

      if (dados.sucesso) {
        mostrarMsg(`Conexão OK: ${partes.join(' | ')}`, 'sucesso');
      } else {
        const detalhes = [];
        if (!dados.imap?.sucesso) detalhes.push(dados.imap?.mensagem || 'Erro IMAP');
        if (!dados.smtp?.sucesso) detalhes.push(dados.smtp?.mensagem || 'Erro SMTP');
        mostrarMsg(detalhes.join('. '), 'erro');
      }
    } catch (err) {
      console.error('Erro ao testar conexão:', err);
      mostrarMsg(err.message || 'Erro ao testar conexão', 'erro');
    } finally {
      setTestando(false);
    }
  };

  // ═══ Salvar configuração no Firestore ═══
  const handleSalvar = async () => {
    const erro = validar();
    if (erro) {
      mostrarMsg(erro, 'erro');
      return;
    }
    setSalvando(true);
    setMensagem('');
    try {
      await salvarEmailConfig(form);
      mostrarMsg('Configurações salvas!', 'sucesso');
    } catch (err) {
      console.error('Erro ao salvar configuração de e-mail:', err);
      mostrarMsg('Erro ao salvar. Tente novamente.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  // ═══ Estilos auxiliares ═══
  const estiloSecao = {
    fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
    marginTop: '16px', marginBottom: '8px', paddingBottom: '6px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', gap: '6px',
  };

  const estiloCampo = {
    width: '100%', padding: '8px 10px', fontSize: '0.8rem',
    border: '1px solid var(--border-color)', borderRadius: '6px',
    backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)',
    outline: 'none', transition: 'border-color 0.2s',
    fontFamily: 'Outfit, sans-serif', boxSizing: 'border-box',
  };

  const estiloLabel = {
    fontSize: '0.75rem', color: 'var(--text-secondary)',
    marginBottom: '4px', display: 'block',
  };

  const estiloGrupo = { marginBottom: '12px' };
  const estiloLinhaDupla = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' };

  // Opções de encriptação
  const opcoesEncriptacao = ['SSL/TLS', 'STARTTLS', 'Nenhuma'];

  // Cor da mensagem de feedback
  const corMensagem = tipoMsg === 'sucesso' ? '#22c55e' : tipoMsg === 'erro' ? '#ef4444' : 'var(--text-secondary)';

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
        {/* ═══ Conta de e-mail ═══ */}
        <div style={estiloSecao}>
          <FiMail /> Conta
        </div>
        <div style={estiloGrupo}>
          <label style={estiloLabel}>E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => atualizarCampo('email', e.target.value)}
            placeholder="seu@email.com"
            style={estiloCampo}
          />
        </div>
        <div style={estiloGrupo}>
          <label style={estiloLabel}>Senha</label>
          <input
            type="password"
            value={form.senha}
            onChange={(e) => atualizarCampo('senha', e.target.value)}
            placeholder="Senha do e-mail"
            style={estiloCampo}
          />
        </div>

        {/* ═══ Servidor de Entrada (IMAP) ═══ */}
        <div style={estiloSecao}>
          <FiServer /> Servidor de Entrada (IMAP)
        </div>
        <div style={estiloGrupo}>
          <label style={estiloLabel}>Servidor</label>
          <input
            type="text"
            value={form.imap.servidor}
            onChange={(e) => atualizarImap('servidor', e.target.value)}
            placeholder="imap.exemplo.com"
            style={estiloCampo}
          />
        </div>
        <div style={{ ...estiloGrupo, ...estiloLinhaDupla }}>
          <div>
            <label style={estiloLabel}>Porta</label>
            <input
              type="number"
              value={form.imap.porta}
              onChange={(e) => atualizarImap('porta', parseInt(e.target.value) || 993)}
              placeholder="993"
              style={estiloCampo}
            />
          </div>
          <div>
            <label style={estiloLabel}>Encriptação</label>
            <select
              value={form.imap.encriptacao}
              onChange={(e) => atualizarImap('encriptacao', e.target.value)}
              style={{ ...estiloCampo, cursor: 'pointer' }}
            >
              {opcoesEncriptacao.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ═══ Servidor de Saída (SMTP) ═══ */}
        <div style={estiloSecao}>
          <FiServer /> Servidor de Saída (SMTP)
        </div>
        <div style={estiloGrupo}>
          <label style={estiloLabel}>Servidor</label>
          <input
            type="text"
            value={form.smtp.servidor}
            onChange={(e) => atualizarSmtp('servidor', e.target.value)}
            placeholder="smtp.exemplo.com"
            style={estiloCampo}
          />
        </div>
        <div style={{ ...estiloGrupo, ...estiloLinhaDupla }}>
          <div>
            <label style={estiloLabel}>Porta</label>
            <input
              type="number"
              value={form.smtp.porta}
              onChange={(e) => atualizarSmtp('porta', parseInt(e.target.value) || 465)}
              placeholder="465"
              style={estiloCampo}
            />
          </div>
          <div>
            <label style={estiloLabel}>Encriptação</label>
            <select
              value={form.smtp.encriptacao}
              onChange={(e) => atualizarSmtp('encriptacao', e.target.value)}
              style={{ ...estiloCampo, cursor: 'pointer' }}
            >
              {opcoesEncriptacao.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ═══ Botões de ação ═══ */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
          {/* Botão Testar */}
          <button
            onClick={handleTestar}
            disabled={testando}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              flex: '0 0 auto', padding: '10px 14px', fontSize: '0.8rem', fontWeight: 500,
              fontFamily: 'Outfit, sans-serif',
              backgroundColor: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              cursor: testando ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              opacity: testando ? 0.5 : 1,
            }}
          >
            <FiRefreshCw style={{ fontSize: '0.75rem', transition: 'transform 0.8s', transform: testando ? 'rotate(360deg)' : 'rotate(0deg)' }} />
            {testando ? 'Testando...' : 'Testar'}
          </button>
          {/* Botão Salvar */}
          <button
            onClick={handleSalvar}
            disabled={salvando}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              flex: 1, padding: '10px', fontSize: '0.85rem', fontWeight: 500,
              fontFamily: 'Outfit, sans-serif',
              backgroundColor: salvando ? 'var(--border-color)' : 'var(--accent-color)',
              color: 'var(--bg-primary)',
              border: 'none', borderRadius: '8px', cursor: salvando ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {salvando ? 'Salvando...' : (
              <>
                <FiSave /> Salvar
              </>
            )}
          </button>
        </div>

        {/* ═══ Mensagem de feedback ═══ */}
        {mensagem && (
          <p style={{
            fontSize: '0.75rem', textAlign: 'center', marginTop: '10px',
            color: corMensagem, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          }}>
            {tipoMsg === 'erro' && <FiAlertCircle style={{ fontSize: '0.7rem' }} />}
            {tipoMsg === 'sucesso' && <FiCheck style={{ fontSize: '0.7rem' }} />}
            {mensagem}
          </p>
        )}

        {/* Aviso */}
        <p style={{
          fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6,
          marginTop: '14px', lineHeight: 1.4, textAlign: 'center',
        }}>
          Configurações salvas no Firebase. Envio e recebimento reais
          dependem de integração com backend dedicado.
        </p>
      </div>
    </div>
  );
}
