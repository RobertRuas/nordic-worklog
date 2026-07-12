import React, { useState } from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiSave, FiX, FiMapPin, FiUser, FiFileText, FiGlobe, FiPlus, FiCheck, FiUsers } from 'react-icons/fi';

/**
 * Componente ProjectForm didático
 * Exibe o formulário com todas as informações do projeto.
 * Permite visualizar, editar, excluir e criar novos projetos.
 * 
 * @param {Object} projeto - Os dados completos do projeto (vazio se for novo).
 * @param {function} onVoltar - Função para voltar à lista de projetos.
 * @param {function} onSalvar - Função para salvar as alterações ou novo projeto.
 * @param {function} onExcluir - Função para excluir o projeto (null se for novo).
 * @param {boolean} modoNovo - Indica se o formulário está em modo de criação.
 */
export default function ProjectForm({ projeto, onVoltar, onSalvar, onExcluir, modoNovo = false }) {
  // Estado local para controlar o modo de edição e os dados do formulário
  // Se for um novo projeto, já inicia em modo de edição
  const [editando, setEditando] = useState(modoNovo);
  const [form, setForm] = useState({ tecnicos: [], ...projeto });

  // Estado para o formulário de novo técnico (inline)
  const [novoTecnico, setNovoTecnico] = useState({ nome: '', irataLevel: '', windaId: '' });
  const [mostrarFormTecnico, setMostrarFormTecnico] = useState(false);
  // ID do técnico em edição (null se nenhum)
  const [editandoTecnicoId, setEditandoTecnicoId] = useState(null);

  // Função para atualizar um campo específico do formulário
  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  // Função para salvar as alterações feitas no projeto
  const handleSalvar = () => {
    onSalvar(form);
    setEditando(false);
    // Se for um novo projeto, após salvar volta para a lista
    if (modoNovo) onVoltar();
  };

  // Função para cancelar a edição e restaurar os dados originais
  const handleCancelar = () => {
    setForm({ ...projeto });
    setEditando(false);
  };

  // Função para confirmar a exclusão do projeto
  const handleExcluir = () => {
    if (window.confirm(`Deseja realmente excluir o projeto "${projeto.nome}"?`)) {
      onExcluir(projeto.id);
    }
  };

  // ═══ Funções CRUD para Técnicos ═══

  // Adiciona um novo técnico à lista do projeto
  const adicionarTecnico = () => {
    if (!novoTecnico.nome || !novoTecnico.irataLevel || !novoTecnico.windaId) return;
    const tecnico = { ...novoTecnico, id: Date.now() };
    setForm((prev) => ({ ...prev, tecnicos: [...(prev.tecnicos || []), tecnico] }));
    setNovoTecnico({ nome: '', irataLevel: '', windaId: '' });
    setMostrarFormTecnico(false);
  };

  // Remove um técnico da lista do projeto
  const removerTecnico = (id) => {
    setForm((prev) => ({ ...prev, tecnicos: (prev.tecnicos || []).filter((t) => t.id !== id) }));
  };

  // Inicia a edição de um técnico existente
  const iniciarEdicaoTecnico = (tecnico) => {
    setEditandoTecnicoId(tecnico.id);
    setNovoTecnico({ nome: tecnico.nome, irataLevel: tecnico.irataLevel, windaId: tecnico.windaId });
    setMostrarFormTecnico(true);
  };

  // Salva as alterações de um técnico existente
  const salvarEdicaoTecnico = () => {
    setForm((prev) => ({
      ...prev,
      tecnicos: (prev.tecnicos || []).map((t) =>
        t.id === editandoTecnicoId ? { ...t, ...novoTecnico } : t
      ),
    }));
    setNovoTecnico({ nome: '', irataLevel: '', windaId: '' });
    setMostrarFormTecnico(false);
    setEditandoTecnicoId(null);
  };

  // Cancela a edição/adicionação de técnico
  const cancelarFormTecnico = () => {
    setNovoTecnico({ nome: '', irataLevel: '', windaId: '' });
    setMostrarFormTecnico(false);
    setEditandoTecnicoId(null);
  };

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

  // Estilo reutilizável para os inputs e textareas
  const estiloInput = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-main)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    marginBottom: '6px',
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
              {/* Botão Excluir (não exibido para novos projetos) */}
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

      {/* Formulário com as informações do projeto */}
      <div className="card">
        <h2 className="card-title">{modoNovo ? 'Novo Projeto' : 'Detalhes do Projeto'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Campo: Nome do Projeto/Site */}
          <div>
            <label style={estiloLabel}>
              <FiGlobe /> Projeto
            </label>
            {editando ? (
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                style={estiloInput}
                placeholder="Nome do projeto ou site"
              />
            ) : (
              <p style={estiloValor}>{form.nome}</p>
            )}
          </div>

          {/* Campo: Localização (País) */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiMapPin /> Localização
            </label>
            {editando ? (
              <input
                type="text"
                value={form.localizacao}
                onChange={(e) => atualizarCampo('localizacao', e.target.value)}
                style={estiloInput}
                placeholder="Ex: Brasil, Suécia, Noruega..."
              />
            ) : (
              <p style={estiloValor}>{form.localizacao}</p>
            )}
          </div>

          {/* Campo: Cliente */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiUser /> Cliente
            </label>
            {editando ? (
              <input
                type="text"
                value={form.cliente}
                onChange={(e) => atualizarCampo('cliente', e.target.value)}
                style={estiloInput}
                placeholder="Nome do cliente"
              />
            ) : (
              <p style={estiloValor}>{form.cliente}</p>
            )}
          </div>

          {/* Campo: Escopo */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiFileText /> Escopo
            </label>
            {editando ? (
              <input
                type="text"
                value={form.escopo}
                onChange={(e) => atualizarCampo('escopo', e.target.value)}
                style={estiloInput}
                placeholder="Ex: Desenvolvimento Web, Design, Consultoria..."
              />
            ) : (
              <p style={estiloValor}>{form.escopo}</p>
            )}
          </div>

          {/* Campo: Descrição */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              <FiFileText /> Descrição
            </label>
            {editando ? (
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo('descricao', e.target.value)}
                rows={4}
                style={{ ...estiloInput, resize: 'vertical' }}
                placeholder="Descreva os detalhes do projeto..."
              />
            ) : (
              <p style={{ ...estiloValor, whiteSpace: 'pre-wrap' }}>{form.descricao}</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Seção: Técnicos do Projeto ═══ */}
      <div className="card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title" style={{ margin: 0 }}>Técnicos</h2>
          {/* Botão para adicionar técnico (apenas em modo de edição) */}
          {editando && !mostrarFormTecnico && (
            <button
              onClick={() => setMostrarFormTecnico(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '0.7rem', color: 'var(--text-primary)',
                padding: '4px 8px', borderRadius: '4px',
                border: '1px solid var(--border-color)', cursor: 'pointer',
              }}
            >
              <FiPlus /> Adicionar
            </button>
          )}
        </div>

        {/* Lista de técnicos cadastrados no projeto */}
        <div style={{ marginTop: '12px' }}>
          {(form.tecnicos || []).length === 0 && !mostrarFormTecnico ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
              Nenhum técnico cadastrado.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(form.tecnicos || []).map((tec, index) => (
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
                  {/* Ações do técnico (apenas em modo de edição) */}
                  {editando && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => iniciarEdicaoTecnico(tec)}
                        style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        title="Editar técnico"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => removerTecnico(tec.id)}
                        style={{ fontSize: '0.7rem', color: '#ef4444', cursor: 'pointer' }}
                        title="Remover técnico"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulário inline para adicionar/editar técnico */}
        {mostrarFormTecnico && editando && (
          <div style={{
            marginTop: '12px', padding: '10px', borderRadius: '6px',
            border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
          }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {editandoTecnicoId ? 'Editar Técnico' : 'Novo Técnico'}
            </p>

            {/* Campo: Nome do Técnico */}
            <div>
              <label style={estiloLabel}>Nome</label>
              <input
                type="text"
                value={novoTecnico.nome}
                onChange={(e) => setNovoTecnico((prev) => ({ ...prev, nome: e.target.value }))}
                style={estiloInput}
                placeholder="Nome completo do técnico"
              />
            </div>

            {/* IRATA Level e WindaID lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <div>
                <label style={estiloLabel}>IRATA Level</label>
                <select
                  value={novoTecnico.irataLevel}
                  onChange={(e) => setNovoTecnico((prev) => ({ ...prev, irataLevel: e.target.value }))}
                  style={{ ...estiloInput, cursor: 'pointer' }}
                >
                  <option value="">Selecionar...</option>
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                </select>
              </div>
              <div>
                <label style={estiloLabel}>Winda ID</label>
                <input
                  type="text"
                  value={novoTecnico.windaId}
                  onChange={(e) => setNovoTecnico((prev) => ({ ...prev, windaId: e.target.value }))}
                  style={estiloInput}
                  placeholder="Ex: RR055273BR"
                />
              </div>
            </div>

            {/* Botões de ação do técnico */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                onClick={editandoTecnicoId ? salvarEdicaoTecnico : adicionarTecnico}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.7rem', color: '#22c55e',
                  padding: '4px 10px', borderRadius: '4px',
                  border: '1px solid #22c55e', cursor: 'pointer',
                }}
              >
                <FiCheck /> {editandoTecnicoId ? 'Salvar' : 'Adicionar'}
              </button>
              <button
                onClick={cancelarFormTecnico}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '0.7rem', color: 'var(--text-secondary)',
                  padding: '4px 10px', borderRadius: '4px',
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                }}
              >
                <FiX /> Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
