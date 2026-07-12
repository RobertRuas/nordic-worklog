import React from 'react';
import { FiHome, FiClock, FiBriefcase, FiMail, FiSettings } from 'react-icons/fi';
import './BottomNav.css';

/**
 * Componente BottomNav (Barra de Navegação Inferior)
 * @param {string} activeTab - A aba atualmente selecionada pelo usuário.
 * @param {function} setActiveTab - Função callback para alterar a aba ativa.
 */
export default function BottomNav({ activeTab, setActiveTab }) {
  // Lista de abas com seus respectivos rótulos, IDs e ícones didáticos
  const navItems = [
    { id: 'home', label: 'Início', icon: <FiHome /> },
    { id: 'registros', label: 'Registros', icon: <FiClock /> },
    { id: 'email', label: 'E-Mail', icon: <FiMail /> },
    { id: 'projetos', label: 'Projetos', icon: <FiBriefcase /> },
    { id: 'configuracoes', label: 'Ajustes', icon: <FiSettings /> },
  ];

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-label={`Ir para ${item.label}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
