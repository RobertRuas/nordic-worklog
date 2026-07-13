import React, { useState } from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiSave, FiX, FiCalendar, FiUser, FiMapPin, FiClock, FiFileText, FiPlus, FiUsers } from 'react-icons/fi';

/**
 * Componente RegistroForm didático
 * Exibe o formulário com todas as informações do registro, separadas por categorias.
 * Permite visualizar, editar, excluir e criar novos registros.
 * 
 * @param {Object} registro - Os dados completos do registro (vazio se for novo).
 * @param {function} onVoltar - Função para voltar à lista de registros.
 * @param {function} onSalvar - Função para salvar as alterações ou novo registro.
 * @param {function} onExcluir - Função para excluir o registro (null se for novo).
 * @param {boolean} modoNovo - Indica se o formulário está em modo de criação.
 * @param {Array} projetos - Lista de projetos cadastrados (para o select de projeto).
 */
export default function RegistroForm({ registro, onVoltar, onSalvar, onExcluir, modoNovo = false, projetos = [] }) {
  // Estado local para controlar o modo de edição e os dados do formulário
  // Se for um novo registro, já inicia em modo de edição
  const [editando, setEditando] = useState(modoNovo);
  const [form, setForm] = useState({ ...registro });

  // Função para atualizar um campo específico do formulário
  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  // Função para salvar as alterações feitas no registro
  const handleSalvar = () => {
    onSalvar(form);
    setEditando(false);
    // Se for um novo registro, após salvar volta para a lista
    if (modoNovo) onVoltar();
  };

  // ═══ Funções para o Time (técnicos do projeto) ═══

  // Busca os técnicos do projeto selecionado
  const tecnicosDoProjeto = () => {
    const projeto = projetos.find((p) => p.nome === form.projeto);
    return projeto?.tecnicos || [];
  };

  // Adiciona um técnico do projeto ao time do registro
  const adicionarTecnicoAoTime = (tecnico) => {
    // Verifica se o técnico já está no time
    if ((form.time || []).some((t) => t.id === tecnico.id)) return;
    setForm((prev) => ({ ...prev, time: [...(prev.time || []), tecnico] }));
  };

  // Remove um técnico do time do registro
  const removerTecnicoDoTime = (id) => {
    setForm((prev) => ({ ...prev, time: (prev.time || []).filter((t) => t.id !== id) }));
  };

  // Função para cancelar a edição e restaurar os dados originais
  const handleCancelar = () => {
    setForm({ ...registro });
    setEditando(false);
  };

  // Função para confirmar a exclusão do registro
  const handleExcluir = () => {
    if (window.confirm(`Deseja realmente excluir o registro de ${registro.dia}?`)) {
      onExcluir(registro.id);
    }
  };

  // Gera as opções de horas (0 a 24) para os seletores
  const opcoesHoras = Array.from({ length: 25 }, (_, i) => ({
    valor: i,
    rotulo: `${i}h`,
  }));

  // Estilo reutilizável para os rótulos dos campos (rótulo sutil e discreto)
  const estiloLabel = {
    fontSize: '0.65rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    opacity: 0.7,
  };

  // Estilo reutilizável para os valores em modo visualização (destaque claro)
  const estiloValor = {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: 'var(--text-primary)',
    lineHeight: '1.5',
    paddingTop: '2px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--border-color)',
  };

  // Estilo reutilizável para os inputs, selects e textareas
  const estiloInput = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '5px 10px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    marginBottom: '6px',
  };

  // Estilo para os títulos de seção/categoria
  const estiloSecao = {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginTop: '16px',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  // Estilo para grid de 2 colunas (campos pequenos lado a lado)
  const estiloGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  };

  // Componente auxiliar para renderizar um campo de visualização ou edição
  const renderCampo = (campo, valor, placeholder, tipo = 'text') => {
    if (editando) {
      return (
        <input
          type={tipo}
          value={valor}
          onChange={(e) => atualizarCampo(campo, e.target.value)}
          style={estiloInput}
          placeholder={placeholder}
        />
      );
    }
    return <p style={estiloValor}>{valor || '—'}</p>;
  };

  // Componente auxiliar para renderizar um seletor de horas (0-24)
  const renderSeletorHoras = (campo, valor) => {
    if (editando) {
      return (
        <select
          value={valor}
          onChange={(e) => atualizarCampo(campo, parseInt(e.target.value))}
          style={{ ...estiloInput, cursor: 'pointer' }}
        >
          <option value="">Selecionar...</option>
          {opcoesHoras.map((op) => (
            <option key={op.valor} value={op.valor}>{op.rotulo}</option>
          ))}
        </select>
      );
    }
    return <p style={estiloValor}>{valor !== '' && valor !== null ? `${valor}h` : '—'}</p>;
  };

  return (
    <div className="fade-in">
      {/* Barra superior com botão de voltar e ações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        {/* Botão Voltar */}
        <button
          onClick={onVoltar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft />
          Voltar
        </button>

        {/* Botões de Ação (Editar/Salvar/Cancelar/Excluir) */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {editando ? (
            <>
              {/* Botão Salvar */}
              <button
                onClick={handleSalvar}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', border: '1px solid #22c55e' }}
              >
                <FiSave /> Salvar
              </button>
              {/* Botão Cancelar */}
              <button
                onClick={handleCancelar}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <FiX /> Cancelar
              </button>
            </>
          ) : (
            <>
              {/* Botão Editar */}
              <button
                onClick={() => setEditando(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              >
                <FiEdit2 /> Editar
              </button>
              {/* Botão Excluir (não exibido para novos registros) */}
              {!modoNovo && (
                <button
                  onClick={handleExcluir}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef4444' }}
                >
                  <FiTrash2 /> Excluir
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Formulário com as informações do registro separadas por categorias */}
      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ═══ Seção: Informações Gerais ═══ */}
          <div style={estiloSecao}>
            <FiCalendar /> Informações Gerais
          </div>

          {/* Semana e Dia lado a lado */}
          <div style={estiloGrid}>
            <div>
              <label style={estiloLabel}>Semana</label>
              {editando ? (
                <input
                  type="number"
                  min="1"
                  max="53"
                  value={form.semana}
                  onChange={(e) => atualizarCampo('semana', parseInt(e.target.value) || '')}
                  style={estiloInput}
                  placeholder="Nº da semana"
                />
              ) : (
                <p style={estiloValor}>Semana {form.semana}</p>
              )}
            </div>
            <div>
              <label style={estiloLabel}>Dia</label>
              {renderCampo('dia', form.dia, 'Ex: 2025-07-12', 'date')}
            </div>
          </div>

          {/* Projeto vinculado — Select com projetos cadastrados */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>Projeto</label>
            {editando ? (
              <select
                value={form.projeto}
                onChange={(e) => atualizarCampo('projeto', e.target.value)}
                style={{ ...estiloInput, cursor: 'pointer' }}
              >
                <option value="">Selecionar projeto...</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.nome}>{p.nome}</option>
                ))}
              </select>
            ) : (
              <p style={estiloValor}>{form.projeto || '—'}</p>
            )}
          </div>

          {/* ═══ Seção: Time ═══ */}
          <div style={estiloSecao}>
            <FiUsers /> Time
          </div>

          {/* Lista de técnicos no time do registro */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(form.time || []).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                Nenhum técnico no time.
              </p>
            ) : (
              (form.time || []).map((tec, index) => (
                <div
                  key={tec.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                  }}
                >
                  {/* Informações do técnico em uma só linha */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                    {/* Número de ordem */}
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)',
                      minWidth: '18px', opacity: 0.6,
                    }}>
                      {index + 1}.
                    </span>
                    {/* Nome em destaque */}
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tec.nome}
                    </span>
                    {/* IRATA Level e WindaID na mesma linha */}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
                      {tec.irataLevel} · {tec.windaId}
                    </span>
                  </div>
                  {/* Botão remover (apenas em modo de edição) */}
                  {editando && (
                    <button
                      onClick={() => removerTecnicoDoTime(tec.id)}
                      style={{ fontSize: '0.7rem', color: '#ef4444', cursor: 'pointer' }}
                      title="Remover do time"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Seletor para adicionar técnicos do projeto ao time (apenas em modo de edição) */}
          {editando && tecnicosDoProjeto().length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <label style={estiloLabel}>Adicionar Técnico</label>
              <select
                value=""
                onChange={(e) => {
                  const tecnico = tecnicosDoProjeto().find((t) => t.id === parseInt(e.target.value));
                  if (tecnico) adicionarTecnicoAoTime(tecnico);
                }}
                style={{ ...estiloInput, cursor: 'pointer' }}
              >
                <option value="">Selecionar técnico...</option>
                {tecnicosDoProjeto()
                  .filter((t) => !(form.time || []).some((ft) => ft.id === t.id))
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.nome} ({t.irataLevel})</option>
                  ))}
              </select>
            </div>
          )}

          {/* Mensagem se o projeto não tem técnicos cadastrados */}
          {editando && form.projeto && tecnicosDoProjeto().length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '6px' }}>
              Este projeto não possui técnicos cadastrados.
            </p>
          )}

          {/* Mensagem se nenhum projeto foi selecionado */}
          {editando && !form.projeto && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '6px' }}>
              Selecione um projeto para adicionar técnicos ao time.
            </p>
          )}

          {/* ═══ Seção: Turbina e Localização ═══ */}
          <div style={estiloSecao}>
            <FiMapPin /> Turbina e Localização
          </div>

          {/* Local Turbina No. e Turbina ID No. lado a lado */}
          <div style={estiloGrid}>
            <div>
              <label style={estiloLabel}>Local Turbina No.</label>
              {renderCampo('localTurbinaNo', form.localTurbinaNo, 'Ex: WEA1')}
            </div>
            <div>
              <label style={estiloLabel}>Turbina ID No.</label>
              {renderCampo('turbinaIdNo', form.turbinaIdNo, 'Ex: 552201234')}
            </div>
          </div>

          {/* Max Bögl Tower No. e Blade No. lado a lado */}
          <div style={{ ...estiloGrid, marginTop: '10px' }}>
            <div>
              <label style={estiloLabel}>Max Bögl Tower No.</label>
              {renderCampo('maxBoglTowerNo', form.maxBoglTowerNo, 'Ex: G20_001234_DE')}
            </div>
            <div>
              <label style={estiloLabel}>Blade No.</label>
              {renderCampo('bladeNo', form.bladeNo, 'Ex: B-01')}
            </div>
          </div>

          {/* ═══ Seção: Tempos e Produção ═══ */}
          <div style={estiloSecao}>
            <FiClock /> Tempos e Produção
          </div>

          {/* WTG Downtime Hours e Stand-by Reason */}
          <div style={estiloGrid}>
            <div>
              <label style={estiloLabel}>WTG Downtime (horas)</label>
              {renderCampo('wtgDowntimeHours', form.wtgDowntimeHours, 'Horas', 'number')}
            </div>
            <div>
              <label style={estiloLabel}>Motivo Stand-by</label>
              {renderCampo('standbyReason', form.standbyReason, 'Ex: Aguardando peça')}
            </div>
          </div>

          {/* Working Hours, Stand-by Hours, Travel Hours em 3 colunas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div>
              <label style={estiloLabel}>Working Hours</label>
              {renderSeletorHoras('workingHours', form.workingHours)}
            </div>
            <div>
              <label style={estiloLabel}>Stand-by Hours</label>
              {renderSeletorHoras('standbyHours', form.standbyHours)}
            </div>
            <div>
              <label style={estiloLabel}>Travel Hours</label>
              {renderSeletorHoras('travelHours', form.travelHours)}
            </div>
          </div>

          {/* ═══ Seção: Progresso Diário ═══ */}
          <div style={estiloSecao}>
            <FiFileText /> Progresso Diário
          </div>

          <div>
            <label style={estiloLabel}>Descrição do Dia</label>
            {editando ? (
              <textarea
                value={form.dailyProgress}
                onChange={(e) => atualizarCampo('dailyProgress', e.target.value)}
                rows={4}
                style={{ ...estiloInput, resize: 'vertical' }}
                placeholder="Ex: 07:00 Tooling prepare, grinding, chamfering, lamination, coating&finishing. 19:00 demob."
              />
            ) : (
              <p style={{ ...estiloValor, whiteSpace: 'pre-wrap' }}>{form.dailyProgress || '—'}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
