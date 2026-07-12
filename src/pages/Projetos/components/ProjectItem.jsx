import React from 'react';
import { FiMapPin } from 'react-icons/fi';

/**
 * Componente ProjectItem didático
 * Representa um único projeto na lista com visual limpo e minimalista.
 * Exibe o nome do projeto e a localização (país) de forma resumida.
 * 
 * @param {Object} projeto - Os dados do projeto.
 * @param {string} projeto.nome - Nome do projeto/site.
 * @param {string} projeto.localizacao - Localização (país) do projeto.
 * @param {function} onClick - Função callback ao clicar no item.
 */
export default function ProjectItem({ projeto, onClick }) {
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
      {/* Nome do Projeto */}
      <div>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          {projeto.nome}
        </h3>
        {/* Localização com ícone de mapa */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
          <FiMapPin style={{ fontSize: '0.7rem' }} />
          {projeto.localizacao}
        </p>
      </div>
    </div>
  );
}
