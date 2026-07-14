import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiSend } from 'react-icons/fi';
import { API_URL } from '../../../config/api';

/**
 * Componente EmailCompose — Nordic Worklog
 * Formulário para compor, responder ou encaminhar e-mails.
 * Envia via API backend (SMTP real).
 * 
 * @param {function} onVoltar - Callback para voltar à lista.
 * @param {function} onEnviado - Callback após envio bem-sucedido.
 * @param {string} emailConta - Endereço de e-mail da conta configurada.
 * @param {Object} [responderPara] - E-mail para responder (preenche para/assunto/corpo).
 * @param {Object} [encaminharEmail] - E-mail para encaminhar (preenche corpo).
 */
export default function EmailCompose({ onVoltar, onEnviado, emailConta, responderPara, encaminharEmail }) {
  const [form, setForm] = useState({ para: '', assunto: '', corpo: '' });
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');

  // Modo: 'novo', 'responder', 'encaminhar'
  const modo = responderPara ? 'responder' : encaminharEmail ? 'encaminhar' : 'novo';

  // Pré-preencher campos ao responder ou encaminhar
  useEffect(() => {
    if (modo === 'responder' && responderPara) {
      const emailRemetente = responderPara.de.match(/<(.+)>/)?.[1] || responderPara.de;
      setForm({
        para: emailRemetente,
        assunto: responderPara.assunto.startsWith('Re:') ? responderPara.assunto : `Re: ${responderPara.assunto}`,
        corpo: `\n\n--- Mensagem original de ${responderPara.de} (${formatarData(responderPara.data)}) ---\n${responderPara.corpo || ''}`,
      });
    } else if (modo === 'encaminhar' && encaminharEmail) {
      setForm({
        para: '',
        assunto: encaminharEmail.assunto.startsWith('Fwd:') ? encaminharEmail.assunto : `Fwd: ${encaminharEmail.assunto}`,
        corpo: `\n\n---------- Mensagem encaminhada ----------\nDe: ${encaminharEmail.de}\nData: ${formatarData(encaminharEmail.data)}\nAssunto: ${encaminharEmail.assunto}\n\n${encaminharEmail.corpo || ''}`,
      });
    }
  }, []);

  const formatarData = (data) => {
    const d = new Date(data);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErroEnvio('');
  };

  // Enviar e-mail via API backend (SMTP)
  const handleEnviar = async () => {
    if (!form.para || !form.assunto) {
      setErroEnvio('Preencha destinatário e assunto');
      return;
    }

    setEnviando(true);
    setErroEnvio('');

    try {
      // Obter token do Firebase
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      if (!auth.currentUser) {
        setErroEnvio('Sessão expirada');
        setEnviando(false);
        return;
      }
      const token = await auth.currentUser.getIdToken();

      const apiUrl = `${API_URL}/api/email/send`;
      let resposta;
      try {
        resposta = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ para: form.para, assunto: form.assunto, corpo: form.corpo }),
        });
      } catch {
        throw new Error('Servidor indisponível');
      }

      const dados = await resposta.json().catch(() => null);
      if (!dados) throw new Error('Resposta inválida do servidor');
      if (!resposta.ok) throw new Error(dados.erro || 'Falha ao enviar');

      // Sucesso — notificar e voltar
      if (onEnviado) onEnviado();
      onVoltar();
    } catch (erro) {
      setErroEnvio(erro.message || 'Erro ao enviar e-mail');
    } finally {
      setEnviando(false);
    }
  };

  // Estilo reutilizável para inputs
  const estiloInput = {
    width: '100%', background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)', borderRadius: '6px',
    padding: '5px 10px', fontSize: '0.82rem', color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)', outline: 'none', transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };

  const estiloLabel = {
    fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', opacity: 0.7,
  };

  const titulos = { novo: 'Novo E-Mail', responder: 'Responder', encaminhar: 'Encaminhar' };

  return (
    <div className="fade-in">
      {/* Barra superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button
          onClick={onVoltar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft /> Voltar
        </button>
        <button
          onClick={handleEnviar}
          disabled={enviando}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem',
            color: enviando ? 'var(--text-secondary)' : '#22c55e',
            padding: '4px 10px', borderRadius: '4px', border: `1px solid ${enviando ? 'var(--border-color)' : '#22c55e'}`,
            cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.5 : 1,
          }}
        >
          <FiSend /> {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>

      {/* Mensagem de erro */}
      {erroEnvio && (
        <div style={{
          padding: '6px 10px', marginBottom: '8px', borderRadius: '6px',
          backgroundColor: 'rgba(239, 68, 68, 0.08)', fontSize: '0.75rem', color: '#ef4444',
        }}>
          {erroEnvio}
        </div>
      )}

      {/* Formulário de composição */}
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Campo: Para */}
          <div>
            <label style={estiloLabel}>Para</label>
            <input
              type="email"
              value={form.para}
              onChange={(e) => atualizarCampo('para', e.target.value)}
              style={estiloInput}
              placeholder="destinatario@exemplo.com"
            />
          </div>

          {/* Campo: Assunto */}
          <div>
            <label style={estiloLabel}>Assunto</label>
            <input
              type="text"
              value={form.assunto}
              onChange={(e) => atualizarCampo('assunto', e.target.value)}
              style={estiloInput}
              placeholder="Assunto do e-mail"
            />
          </div>

          {/* Campo: Corpo */}
          <div>
            <label style={estiloLabel}>Mensagem</label>
            <textarea
              value={form.corpo}
              onChange={(e) => atualizarCampo('corpo', e.target.value)}
              rows={10}
              style={{ ...estiloInput, resize: 'vertical', lineHeight: 1.5 }}
              placeholder="Escreva sua mensagem..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
