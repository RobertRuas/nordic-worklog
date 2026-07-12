import React, { useState, useMemo } from 'react';
import { FiPlus, FiChevronDown, FiClock, FiNavigation } from 'react-icons/fi';
import RegistroItem from './components/RegistroItem';
import RegistroForm from './components/RegistroForm';
import { mockRegistros } from '../../data/mockData';

/**
 * Mapeia o número do mês para o nome abreviado em português.
 * 
 * @param {number} mesNum - Número do mês (1-12).
 * @returns {string} Nome abreviado do mês.
 */
const nomeMes = (mesNum) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return meses[mesNum - 1] || '';
};

/**
 * Página de Registros — Nordic Worklog
 * Exibe os registros organizados em acordeão: Mês > Semana > Registros.
 * A semana mais recente fica expandida por padrão.
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 * @param {Array} projetos - Lista de projetos compartilhada do App (para o select de projeto).
 */
export default function Registros({ onTitleChange, projetos, registerGoBack }) {
  // Lista de registros (dados fictícios do arquivo centralizado)
  const [registros, setRegistros] = useState(mockRegistros);

  // Controla a visualização atual: 'lista' ou 'detalhe'
  const [view, setView] = useState('lista');
  // Registro atualmente selecionado para visualização/edição
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  // Controla se o formulário está em modo de criação
  const [modoNovo, setModoNovo] = useState(false);

  // Ref para a função voltarLista (usado pelo gesto de swipe)
  const voltarListaRef = React.useRef(null);

  // Registra a função de voltar para o gesto de swipe
  React.useEffect(() => {
    if (registerGoBack) {
      registerGoBack(view === 'detalhe' ? () => voltarListaRef.current?.() : null);
    }
    return () => { if (registerGoBack) registerGoBack(null); };
  }, [view]);

  // ═══ Agrupamento dos registros em Mês > Semana ═══
  const { grupos, semanaRecente } = useMemo(() => {
    // Agrupa registros por mês e depois por semana
    const porMes = {};
    registros.forEach((reg) => {
      const data = new Date(reg.dia + 'T00:00:00');
      const ano = data.getFullYear();
      const mes = data.getMonth() + 1;
      const chaveMes = `${ano}-${String(mes).padStart(2, '0')}`;

      if (!porMes[chaveMes]) porMes[chaveMes] = {};
      if (!porMes[chaveMes][reg.semana]) porMes[chaveMes][reg.semana] = [];
      porMes[chaveMes][reg.semana].push(reg);
    });

    // Ordena os meses do mais recente para o mais antigo
    const mesesOrdenados = Object.keys(porMes).sort((a, b) => b.localeCompare(a));

    // Monta a estrutura final ordenada
    const resultado = mesesOrdenados.map((chaveMes) => {
      const [ano, mes] = chaveMes.split('-');
      const semanas = Object.keys(porMes[chaveMes])
        .map((sem) => ({
          semana: parseInt(sem),
          // Registros ordenados do mais recente para o mais antigo
          registros: porMes[chaveMes][sem].sort((a, b) => b.dia.localeCompare(a.dia)),
        }))
        .sort((a, b) => b.semana - a.semana);
      return { chaveMes, ano, mes: parseInt(mes), semanas };
    });

    // Encontra a semana mais recente (maior número da semana do mês mais recente)
    let recente = null;
    if (resultado.length > 0 && resultado[0].semanas.length > 0) {
      recente = `${resultado[0].chaveMes}-${resultado[0].semanas[0].semana}`;
    }

    return { grupos: resultado, semanaRecente: recente };
  }, [registros]);

  // Controla quais semanas estão expandidas (a mais recente por padrão)
  const [semanasAbertas, setSemanasAbertas] = useState(() => {
    return semanaRecente ? new Set([semanaRecente]) : new Set();
  });

  // Alterna a expansão de uma semana
  const toggleSemana = (chave) => {
    setSemanasAbertas((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) {
        novo.delete(chave);
      } else {
        novo.add(chave);
      }
      return novo;
    });
  };

  // Navega para a tela de detalhes de um registro
  const abrirDetalhe = (registro) => {
    setRegistroSelecionado(registro);
    setModoNovo(false);
    setView('detalhe');
    if (onTitleChange) onTitleChange(`Sem. ${registro.semana} — ${registro.dia}`);
  };

  // Calcula o número da semana ISO para uma data fornecida
  const obterSemanaISO = (data) => {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  };

  // Formata a data atual no padrão YYYY-MM-DD
  const obterDataHoje = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  // Abre o formulário para criar um novo registro
  const abrirNovo = () => {
    const dataHoje = obterDataHoje();
    const semanaHoje = obterSemanaISO(dataHoje);

    setRegistroSelecionado({
      id: Date.now(),
      semana: semanaHoje, dia: dataHoje, projeto: '',
      timeNo: '', nomeTecnico: '', funcao: '', teamLeader: 'Não',
      localTurbinaNo: '', turbinaIdNo: '', maxBoglTowerNo: '', bladeNo: '',
      wtgDowntimeHours: 0, standbyReason: '',
      workingHours: 0, standbyHours: 0, travelHours: 0,
      dailyProgress: '',
      time: [],
    });
    setModoNovo(true);
    setView('detalhe');
    if (onTitleChange) onTitleChange('Novo Registro');
  };

  // Volta para a lista de registros
  const voltarLista = () => {
    setRegistroSelecionado(null);
    setModoNovo(false);
    setView('lista');
    if (onTitleChange) onTitleChange('Registros');
  };
  // Atualiza a ref para o gesto de swipe
  voltarListaRef.current = voltarLista;

  // Salva um registro (novo ou atualizado)
  const salvarRegistro = (formAtualizado) => {
    if (modoNovo) {
      setRegistros((prev) => [...prev, formAtualizado]);
    } else {
      setRegistros((prev) => prev.map((r) => r.id === formAtualizado.id ? formAtualizado : r));
      setRegistroSelecionado(formAtualizado);
    }
  };

  // Exclui um registro da lista
  const excluirRegistro = (id) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
    voltarLista();
  };

  // Renderiza a tela de detalhes ou formulário de novo registro
  if (view === 'detalhe' && registroSelecionado) {
    return (
      <RegistroForm
        registro={registroSelecionado}
        onVoltar={voltarLista}
        onSalvar={salvarRegistro}
        onExcluir={excluirRegistro}
        modoNovo={modoNovo}
        projetos={projetos}
      />
    );
  }

  // ═══ Renderização da lista em acordeão ═══
  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">Registros</h2>

        {/* Acordeão: Mês > Semana > Registros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {grupos.map((mesGrupo) => (
            <div key={mesGrupo.chaveMes}>
              {/* Cabeçalho do Mês */}
              <h3 style={{
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                marginBottom: '4px', paddingBottom: '4px',
                borderBottom: '1px solid var(--border-color)',
              }}>
                {nomeMes(mesGrupo.mes)} {mesGrupo.ano}
              </h3>

              {/* Semanas do mês */}
              {mesGrupo.semanas.map((sem) => {
                const chaveSemana = `${mesGrupo.chaveMes}-${sem.semana}`;
                const aberta = semanasAbertas.has(chaveSemana);

                // Calcula os totais de horas da semana
                const totalW = sem.registros.reduce((s, r) => s + (r.workingHours || 0), 0);
                const totalS = sem.registros.reduce((s, r) => s + (r.standbyHours || 0), 0);
                const totalT = sem.registros.reduce((s, r) => s + (r.travelHours || 0), 0);

                // Estilo para badges de horas no cabeçalho (colorido só se > 0)
                const badgeHora = (cor, valor, label, icone) => (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '2px',
                    fontSize: '0.6rem', fontWeight: valor > 0 ? 500 : 400,
                    color: valor > 0 ? cor : 'var(--text-secondary)',
                    opacity: valor > 0 ? 1 : 0.4,
                  }}>
                    {icone}
                    {valor}h
                  </span>
                );

                return (
                  <div key={chaveSemana} style={{ marginLeft: '8px', marginBottom: '6px' }}>
                    {/* Cabeçalho da Semana (clicável para expandir/recolher) */}
                    <button
                      onClick={() => toggleSemana(chaveSemana)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        width: '100%', padding: '7px 10px', borderRadius: '6px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)',
                        textTransform: 'uppercase', letterSpacing: '0.03em',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {/* Seta indicadora com rotação */}
                      <FiChevronDown style={{
                        fontSize: '0.8rem',
                        transition: 'transform 0.2s ease',
                        transform: aberta ? 'rotate(0deg)' : 'rotate(-90deg)',
                        color: 'var(--text-secondary)',
                      }} />
                      Sem. {sem.semana}
                      {/* Totais de horas da semana */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        {badgeHora('#22c55e', totalW, 'W', <FiClock style={{ fontSize: '0.55rem' }} />)}
                        {badgeHora('#eab308', totalS, 'S', <span style={{ fontSize: '0.55rem' }}>⏸</span>)}
                        {badgeHora('#3b82f6', totalT, 'T', <FiNavigation style={{ fontSize: '0.5rem' }} />)}
                      </span>
                    </button>

                    {/* Lista de registros da semana (visível quando expandida) */}
                    {aberta && (
                      <div style={{ marginLeft: '14px', marginTop: '4px', borderLeft: '2px solid var(--border-color)', paddingLeft: '10px' }}>
                        {sem.registros.map((registro) => (
                          <div key={registro.id} onClick={() => abrirDetalhe(registro)}>
                            <RegistroItem registro={registro} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Botão flutuante para criar um novo registro */}
      <button
        onClick={abrirNovo}
        style={{
          position: 'fixed', bottom: '80px', right: '20px',
          width: '48px', height: '48px', borderRadius: '50%',
          border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: '1.2rem', zIndex: 100,
        }}
        title="Novo Registro"
      >
        <FiPlus />
      </button>
    </div>
  );
}
