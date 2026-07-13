import React, { useState } from 'react';
import { FiArrowLeft, FiSend, FiX } from 'react-icons/fi';

/**
 * Componente EmailCompose — Nordic Worklog
 * Formulário para compor um novo e-mail.
 * 
 * @param {function} onVoltar - Callback para voltar à lista.
 * @param {function} onEnviar - Callback para enviar o e-mail.
 * @param {string} emailConta - Endereço de e-mail da conta configurada.
 */
export default function EmailCompose({ onVoltar, onEnviar, emailConta }) {
  const [form, setForm] = useState({ para: '', assunto: '', corpo: '' });

  // Atualiza um campo do formulário
  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  // Envia o e-mail (simulado)
  const handleEnviar = () => {
    if (!form.para || !form.assunto) return;
    onEnviar({
      id: Date.now(),
      de: emailConta,
      para: form.para,
      assunto: form.assunto,
      data: new Date().toISOString(),
      lido: true,
      corpo: form.corpo,
    });
  };

  // Estilo reutilizável para inputs
  const estiloInput = {
    width: '100%', background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)', borderRadius: '6px',
    padding: '5px 10px', fontSize: '0.82rem', color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)', outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  // Estilo para labels
  const estiloLabel = {
    fontSize: '0.65rem', fontWeight: 500, color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px',
    opacity: 0.7,
  };

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
          style={{
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem',
            color: '#22c55e', padding: '4px 10px', borderRadius: '4px',
            border: '1px solid #22c55e',
          }}
        >
          <FiSend /> Enviar
        </button>
      </div>

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
