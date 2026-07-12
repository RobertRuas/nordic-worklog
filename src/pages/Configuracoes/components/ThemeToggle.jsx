import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Componente ThemeToggle didático
 * Permite selecionar entre o tema Light e Dark com visual minimalista.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {theme === 'dark' ? <FiMoon style={{ color: 'var(--text-secondary)' }} /> : <FiSun style={{ color: 'var(--text-secondary)' }} />}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Modo Escuro</span>
      </div>
      
      {/* Botão de Toggle minimalista */}
      <button 
        onClick={toggleTheme}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          backgroundColor: theme === 'dark' ? 'var(--accent-color)' : '#d4d4d8',
          position: 'relative',
          padding: '2px',
          transition: 'background-color 0.2s ease',
        }}
        aria-label="Alternar tema"
      >
        <div 
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
            transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(0px)',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>
    </div>
  );
}
