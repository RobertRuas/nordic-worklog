import React from 'react';
import { FiCalendar, FiBriefcase } from 'react-icons/fi';

/**
 * Componente RegistroItem didático
 * Representa um único registro na lista de forma resumida.
 * Exibe semana, dia e nome do projeto.
 * 
 * @param {Object} registro - Os dados do registro.
 * @param {number} registro.semana - Número da semana.
 * @param {string} registro.dia - Dia do registro.
 * @param {string} registro.projeto - Nome do projeto vinculado.
 * @param {function} onClick - Função callback ao clicar no item.
 */
export default function RegistroItem({ registro, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)',
        cursor: 'pointer',
      }}
    >
      {/* Informações resumidas: dia e projeto */}
      <div>
        {/* Dia com ícone de calendário */}
        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {registro.dia}
        </h3>
        {/* Projeto vinculado */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <FiBriefcase style={{ fontSize: '0.7rem' }} />
          {registro.projeto}
        </p>
      </div>

      {/* Número da semana como badge discreto */}
      <span 
        style={{
          fontSize: '0.65rem',
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <FiCalendar style={{ fontSize: '0.6rem' }} />
        S{registro.semana}
      </span>
    </div>
  );
}
