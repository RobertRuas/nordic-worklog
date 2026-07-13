import React, { useState, useRef, useEffect } from 'react';
import { FiArrowLeft, FiEdit2, FiTrash2, FiSave, FiX, FiCalendar, FiUser, FiMapPin, FiClock, FiFileText, FiPlus, FiUsers, FiCamera, FiUpload, FiAlertTriangle } from 'react-icons/fi';
import useImageResize from '../../../hooks/useImageResize';

/**
 * Componente RegistroForm didático
 * Exibe o formulário com todas as informações do registro, separadas por categorias.
 * Permite visualizar, editar, excluir e criar novos registros.
 * Inclui anexo de fotos com redimensionamento automático (1024px).
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
  const [form, setForm] = useState({ fotos: [], ...registro });

  // ═══ Estado para mensagens de erro de validação ═══
  const [erros, setErros] = useState({});

  // ═══ Jornada padrão (padrão 10h, pode vir de configuração futura) ═══
  const JORNADA_PADRAO = 10;

  // ═══ Estados de fotos (com redimensionamento automático) ═══
  const { redimensionar } = useImageResize();
  const inputFotoRef = useRef(null);

  // Função para atualizar um campo específico do formulário
  const atualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpa o erro do campo ao editar
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: '' }));
  };

  // ═══ Cálculo automático da semana ISO ao alterar a data ═══
  useEffect(() => {
    if (!form.dia) return;
    const d = new Date(form.dia + 'T00:00:00');
    if (isNaN(d.getTime())) return;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const semana = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    if (form.semana !== semana) {
      setForm((prev) => ({ ...prev, semana }));
    }
  }, [form.dia]);

  // ═══ Auto-preenchimento do Stand-by para completar a jornada ═══
  // Quando work ou travel mudam, o stand-by é ajustado automaticamente
  // Regra: standby = jornada - work - travel (se o total for < jornada)
  const ajusteStandbyRef = useRef(false);

  useEffect(() => {
    // Evita ajuste recursivo
    if (ajusteStandbyRef.current) return;
    ajusteStandbyRef.current = true;

    const work = form.workingHours || 0;
    const travel = form.travelHours || 0;
    const standby = form.standbyHours || 0;
    const total = work + travel + standby;

    // Se o total é menor que a jornada, preenche o stand-by com o restante
    if (total < JORNADA_PADRAO && (work > 0 || travel > 0)) {
      const novoStandby = JORNADA_PADRAO - work - travel;
      if (novoStandby >= 0 && novoStandby !== standby) {
        setForm((prev) => ({ ...prev, standbyHours: novoStandby }));
      }
    }

    ajusteStandbyRef.current = false;
  }, [form.workingHours, form.travelHours]);

  // ═══ Validação dos campos obrigatórios antes de salvar ═══
  const validar = () => {
    const novosErros = {};
    const hoje = new Date().toISOString().split('T')[0];

    // Data obrigatória e não pode ser futura
    if (!form.dia) {
      novosErros.dia = 'Data é obrigatória';
    } else if (form.dia > hoje) {
      novosErros.dia = 'Data não pode ser futura';
    }

    // Projeto obrigatório
    if (!form.projeto) {
      novosErros.projeto = 'Projeto é obrigatório';
    }

    // Time: pelo menos 1 membro
    if (!form.time || form.time.length === 0) {
      novosErros.time = 'Pelo menos 1 membro no time';
    }

    // Pelo menos um dos campos work/standby/travel > 0
    const work = form.workingHours || 0;
    const standby = form.standbyHours || 0;
    const travel = form.travelHours || 0;
    if (work + standby + travel === 0) {
      novosErros.horas = 'Work, Stand-by ou Travel deve ser > 0';
    }

    // Descrição do dia obrigatória
    if (!form.dailyProgress || !form.dailyProgress.trim()) {
      novosErros.dailyProgress = 'Descrição do dia é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Função para salvar as alterações feitas no registro
  const handleSalvar = () => {
    // Valida antes de salvar
    if (!validar()) return;
    onSalvar(form);
    setEditando(false);
    setErros({});
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

  // ═══ Funções de Fotos (com redimensionamento automático) ═══

  // Processa fotos selecionadas — redimensiona automaticamente se forem grandes
  const handleFotos = async (e) => {
    const arquivos = Array.from(e.target.files);
    if (!arquivos.length) return;

    const novasFotos = [];
    for (const arquivo of arquivos) {
      // Só aceita imagens
      if (!arquivo.type.startsWith('image/')) continue;

      // Redimensiona automaticamente para 1024px se necessário
      const arquivoFinal = await redimensionar(arquivo);
      const preview = URL.createObjectURL(arquivoFinal);

      novasFotos.push({
        id: Date.now() + Math.random(),
        nome: arquivoFinal.name,
        tamanho: arquivoFinal.size,
        preview,
        arquivo: arquivoFinal,
      });
    }

    if (novasFotos.length) {
      setForm((prev) => ({ ...prev, fotos: [...(prev.fotos || []), ...novasFotos] }));
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (inputFotoRef.current) inputFotoRef.current.value = '';
  };

  // Remove uma foto da lista
  const removerFoto = (id) => {
    setForm((prev) => {
      const foto = (prev.fotos || []).find((f) => f.id === id);
      if (foto?.preview) URL.revokeObjectURL(foto.preview);
      return { ...prev, fotos: (prev.fotos || []).filter((f) => f.id !== id) };
    });
  };

  // Formata tamanho em bytes para exibição
  const formatarTamanho = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      // Para campos de data, limita a data máxima como hoje
      const propsExtra = tipo === 'date' ? { max: new Date().toISOString().split('T')[0] } : {};
      return (
        <input
          type={tipo}
          value={valor}
          onChange={(e) => atualizarCampo(campo, e.target.value)}
          style={{
            ...estiloInput,
            borderColor: erros[campo] ? '#ef4444' : 'var(--border-color)',
          }}
          placeholder={placeholder}
          {...propsExtra}
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
        {/* Hint de validação — aparece quando há erros de campos obrigatórios */}
        {Object.keys(erros).length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 10px', marginBottom: '10px', borderRadius: '6px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.7rem', color: '#ef4444',
          }}>
            <FiAlertTriangle size={12} style={{ flexShrink: 0 }} />
            <span>Verifique os campos obrigatórios destacados abaixo.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ═══ Seção: Informações Gerais ═══ */}
          <div style={estiloSecao}>
            <FiCalendar /> Informações Gerais
          </div>

          {/* Semana (informativa, calculada automaticamente pela data) e Dia */}
          <div style={estiloGrid}>
            <div>
              <label style={estiloLabel}>Semana</label>
              {/* Semana é apenas informativa — calculada automaticamente pela data */}
              <p style={{
                ...estiloValor,
                background: 'var(--bg-primary)',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.85rem',
                opacity: 0.7,
              }}>
                Sem. {form.semana || '—'}
              </p>
            </div>
            <div>
              <label style={estiloLabel}>Dia {erros.dia && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.dia})</span>}</label>
              {renderCampo('dia', form.dia, 'Ex: 2025-07-12', 'date')}
            </div>
          </div>

          {/* Projeto vinculado — Select com projetos cadastrados */}
          <div style={{ marginTop: '10px' }}>
            <label style={estiloLabel}>
              Projeto {erros.projeto && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.projeto})</span>}
            </label>
            {editando ? (
              <select
                value={form.projeto}
                onChange={(e) => {
                  atualizarCampo('projeto', e.target.value);
                  // Limpa erro ao selecionar
                  if (erros.projeto) setErros((prev) => ({ ...prev, projeto: '' }));
                }}
                style={{ ...estiloInput, cursor: 'pointer', borderColor: erros.projeto ? '#ef4444' : 'var(--border-color)' }}
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
            <FiUsers /> Time {erros.time && <span style={{ color: '#ef4444', fontSize: '0.6rem', fontWeight: 400 }}>({erros.time})</span>}
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
          {/* Dica de preenchimento automático do stand-by */}
          {erros.horas && (
            <p style={{ fontSize: '0.65rem', color: '#ef4444', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FiAlertTriangle size={10} /> {erros.horas}
            </p>
          )}
          <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.5, marginBottom: '4px' }}>
            Stand-by preenche automaticamente para completar {JORNADA_PADRAO}h
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
            <label style={estiloLabel}>
              Descrição do Dia {erros.dailyProgress && <span style={{ color: '#ef4444', fontSize: '0.6rem' }}>({erros.dailyProgress})</span>}
            </label>
            {editando ? (
              <textarea
                value={form.dailyProgress}
                onChange={(e) => {
                  atualizarCampo('dailyProgress', e.target.value);
                  if (erros.dailyProgress) setErros((prev) => ({ ...prev, dailyProgress: '' }));
                }}
                rows={4}
                style={{
                  ...estiloInput,
                  resize: 'vertical',
                  borderColor: erros.dailyProgress ? '#ef4444' : 'var(--border-color)',
                }}
                placeholder="Ex: 07:00 Tooling prepare, grinding, chamfering, lamination, coating&finishing. 19:00 demob."
              />
            ) : (
              <p style={{ ...estiloValor, whiteSpace: 'pre-wrap' }}>{form.dailyProgress || '—'}</p>
            )}
          </div>

          {/* ═══ Seção: Fotos do Registro ═══ */}
          <div style={estiloSecao}>
            <FiCamera /> Fotos do Dia
          </div>

          {/* Input oculto para seleção de fotos */}
          <input
            ref={inputFotoRef}
            type="file"
            multiple
            accept="image/png,image/jpeg"
            style={{ display: 'none' }}
            onChange={handleFotos}
          />

          {/* Dica de processamento automático */}
          <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.6, marginBottom: '8px' }}>
            Fotos grandes são redimensionadas automaticamente (máx. 1024px)
          </p>

          {/* Botão adicionar foto (apenas em modo de edição) */}
          {editando && (
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                width: '100%', padding: '10px 0', borderRadius: '6px',
                border: '1px dashed var(--border-color)',
                background: 'var(--bg-primary)', cursor: 'pointer',
                fontSize: '0.75rem', color: 'var(--text-secondary)',
                marginBottom: '10px',
              }}
            >
              <FiUpload /> Adicionar fotos
            </button>
          )}

          {/* Grid de fotos (miniaturas) */}
          {(form.fotos || []).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {(form.fotos || []).map((foto) => (
                <div
                  key={foto.id}
                  style={{
                    position: 'relative', borderRadius: '6px', overflow: 'hidden',
                    border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                    aspectRatio: '1',
                  }}
                >
                  {/* Miniatura da foto */}
                  <img
                    src={foto.preview}
                    alt={foto.nome}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {/* Botão remover (apenas em modo de edição) */}
                  {editando && (
                    <button
                      onClick={() => removerFoto(foto.id)}
                      style={{
                        position: 'absolute', top: '2px', right: '2px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)', border: 'none',
                        color: '#fff', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', padding: 0,
                      }}
                      title="Remover foto"
                    >
                      <FiX size={10} />
                    </button>
                  )}
                  {/* Nome da foto (tooltip visual) */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0,0,0,0.5)', padding: '2px 4px',
                    fontSize: '0.55rem', color: '#fff',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {formatarTamanho(foto.tamanho)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(form.fotos || []).length === 0 && !editando && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
              Nenhuma foto adicionada.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
