import React, { useMemo } from 'react';
import { FiClock, FiNavigation, FiBriefcase, FiMail, FiActivity } from 'react-icons/fi';
import WeatherCard from '../../components/WeatherCard/WeatherCard';

/**
 * Página Inicial (Home) — Nordic Worklog
 * Painel resumido com visão geral dos dados: horas da semana atual,
 * projetos ativos, e-mails não lidos e últimos registros.
 * 
 * @param {Array} projetos - Lista de projetos cadastrados.
 * @param {Array} registros - Lista de registros de trabalho.
 * @param {Array} emails - Lista de e-mails da caixa de entrada.
 */
export default function Home({ projetos = [], registros = [], emails = [] }) {
  // ═══ Cálculos resumidos ═══

  const resumo = useMemo(() => {
    // Semana mais recente nos registros
    const semanaAtual = registros.length > 0 ? Math.max(...registros.map((r) => r.semana)) : 0;
    const registrosSemana = registros.filter((r) => r.semana === semanaAtual);

    // Totais da semana atual
    const workSemana = registrosSemana.reduce((s, r) => s + (r.workingHours || 0), 0);
    const standSemana = registrosSemana.reduce((s, r) => s + (r.standbyHours || 0), 0);
    const travelSemana = registrosSemana.reduce((s, r) => s + (r.travelHours || 0), 0);

    // Totais gerais
    const workTotal = registros.reduce((s, r) => s + (r.workingHours || 0), 0);
    const standTotal = registros.reduce((s, r) => s + (r.standbyHours || 0), 0);
    const travelTotal = registros.reduce((s, r) => s + (r.travelHours || 0), 0);

    // E-mails não lidos
    const naoLidos = emails.filter((e) => !e.lido).length;

    // Técnicos únicos (somando todos os projetos)
    const totalTecnicos = new Set(projetos.flatMap((p) => (p.tecnicos || []).map((t) => t.id))).size;

    // Últimos 3 registros (mais recentes)
    const ultimosRegistros = [...registros]
      .sort((a, b) => b.dia.localeCompare(a.dia))
      .slice(0, 3);

    return { semanaAtual, workSemana, standSemana, travelSemana, workTotal, standTotal, travelTotal, naoLidos, totalTecnicos, ultimosRegistros };
  }, [registros, emails, projetos]);

  // ═══ Estilos reutilizáveis ═══

  // Cartão métrico compacto
  const cardMetrica = (icone, label, valor, unidade, cor) => (
    <div style={{
      flex: 1, minWidth: '80px', padding: '10px 12px',
      background: 'var(--bg-secondary)', borderRadius: '8px',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.7rem', color: cor || 'var(--text-secondary)', opacity: 0.8 }}>{icone}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.6 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
        {valor}
        {unidade && <span style={{ fontSize: '0.6rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '2px' }}>{unidade}</span>}
      </div>
    </div>
  );

  // Formata data para DD/MM
  const formatarDataCurta = (data) => {
    const d = new Date(data + 'T00:00:00');
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* ═══ Seção: Previsão do Tempo ═══ */}
      <WeatherCard />

      {/* ═══ Seção: Semana Atual ═══ */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <FiActivity style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Semana {resumo.semanaAtual}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cardMetrica(<FiClock />, 'Work', resumo.workSemana, 'h', '#22c55e')}
          {cardMetrica(<span style={{ fontSize: '0.65rem' }}>⏸</span>, 'Stand', resumo.standSemana, 'h', '#eab308')}
          {cardMetrica(<FiNavigation />, 'Travel', resumo.travelSemana, 'h', '#3b82f6')}
        </div>
      </div>

      {/* ═══ Seção: Visão Geral ═══ */}
      <div className="card">
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Visão Geral
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cardMetrica(<FiBriefcase />, 'Projetos', projetos.length, '', 'var(--text-secondary)')}
          {cardMetrica(<FiClock />, 'Total', resumo.workTotal, 'h', '#22c55e')}
          {cardMetrica(<FiMail />, 'Não lidos', resumo.naoLidos, '', 'var(--accent-color)')}
        </div>
      </div>

      {/* ═══ Seção: Últimos Registros ═══ */}
      <div className="card">
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
          Recentes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {resumo.ultimosRegistros.map((reg) => (
            <div key={reg.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 0', borderBottom: '1px solid var(--border-color)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, minWidth: '32px' }}>
                  {formatarDataCurta(reg.dia)}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                  {reg.projeto}
                </span>
              </div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                {reg.workingHours}h work
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
