import React from 'react';
import { FiClock, FiNavigation } from 'react-icons/fi';

/**
 * Componente RegistroItem — Nordic Worklog
 * Representa um único registro dentro do acordeão de semanas.
 * Exibe data + dia da semana em destaque, projeto com menor evidência,
 * horas de Work/Stand-by/Travel com cores distintas e descrição do progresso.
 * 
 * @param {Object} registro - Os dados do registro.
 * @param {string} registro.dia - Data do registro (YYYY-MM-DD).
 * @param {string} registro.projeto - Nome do projeto vinculado.
 * @param {number} registro.workingHours - Horas de trabalho.
 * @param {number} registro.standbyHours - Horas de standby.
 * @param {number} registro.travelHours - Horas de viagem.
 * @param {string} registro.dailyProgress - Descrição breve do progresso diário.
 */
export default function RegistroItem({ registro }) {
  // Dias da semana em português
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Formata a data de YYYY-MM-DD para "DD-MM-YY DiaSemana"
  const formatarData = (data) => {
    const d = new Date(data + 'T00:00:00');
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = String(d.getFullYear()).slice(-2);
    const diaNome = diasSemana[d.getDay()];
    return `${dia}-${mes}-${ano} ${diaNome}`;
  };

  // Cores para cada tipo de hora
  const corWork = '#22c55e';     // Verde
  const corStand = '#eab308';    // Amarelo
  const corTravel = '#3b82f6';   // Azul
  const corNeutro = 'var(--text-secondary)'; // Cinza para valores zerados

  // Estilo base para os badges de horas (menor e mais discreto que o cabeçalho da semana)
  const estiloHora = (cor, valor) => ({
    display: 'flex', alignItems: 'center', gap: '2px',
    fontSize: '0.58rem',
    fontWeight: valor > 0 ? 500 : 400,
    color: valor > 0 ? cor : corNeutro,
    opacity: valor > 0 ? 0.85 : 0.35,
  });

  return (
    <div
      style={{
        padding: '8px 0',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
      }}
    >
      {/* Linha 1: Data e dia da semana em destaque */}
      <h3 style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
        {formatarData(registro.dia)}
      </h3>

      {/* Linha 2: Projeto + horas na mesma linha */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '3px' }}>
        {/* Projeto com menor evidência */}
        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.7, flexShrink: 0, maxWidth: '45%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {registro.projeto}
        </span>
        {/* Badges de horas — ícone + valor, menores e discretos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
          <span style={estiloHora(corWork, registro.workingHours)}>
            <FiClock style={{ fontSize: '0.5rem' }} />
            {registro.workingHours}h
          </span>
          <span style={estiloHora(corStand, registro.standbyHours)}>
            <span style={{ fontSize: '0.5rem' }}>⏸</span>
            {registro.standbyHours}h
          </span>
          <span style={estiloHora(corTravel, registro.travelHours)}>
            <FiNavigation style={{ fontSize: '0.45rem' }} />
            {registro.travelHours}h
          </span>
        </div>
      </div>

      {/* Descrição breve do progresso (truncada) */}
      {registro.dailyProgress && (
        <p style={{
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          marginTop: '6px',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          opacity: 0.75,
        }}>
          {registro.dailyProgress}
        </p>
      )}
    </div>
  );
}
