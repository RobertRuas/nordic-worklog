import React from 'react';
import BottomNav from '../BottomNav/BottomNav';
import './Layout.css';

/**
 * Componente Layout estrutural da aplicação
 * @param {ReactNode} children - O conteúdo da página ativa.
 * @param {string} activeTab - A aba atualmente ativa.
 * @param {function} setActiveTab - Função para alterar a aba ativa.
 * @param {string|null} headerTitle - Título personalizado do header (sobrescreve o padrão).
 */
export default function Layout({ children, activeTab, setActiveTab, headerTitle }) {
  // Tradução do ID da aba para um título na barra de navegação superior (Header)
  // Se houver um título personalizado, usa ele em vez do padrão
  const getHeaderTitle = () => {
    // Se houver um título dinâmico (ex: nome do projeto), prioriza ele
    if (headerTitle) return headerTitle;

    switch (activeTab) {
      case 'home':
        return 'Nordic Worklog';
      case 'registros':
        return 'Registros';
      case 'email':
        return 'E-Mail';
      case 'projetos':
        return 'Meus Projetos';
      case 'configuracoes':
        return 'Configurações';
      default:
        return 'Nordic Worklog';
    }
  };

  return (
    <div className="app-layout">
      {/* Cabeçalho Fixo Minimalista */}
      <header className="app-header">
        <div className="header-container">
          <h1 className="header-title">{getHeaderTitle()}</h1>
        </div>
      </header>

      {/* Área Principal de Conteúdo */}
      <main className="app-content-area">
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Barra de Navegação Inferior Fixa */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
