import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Registros from './pages/Registros/Registros';
import Email from './pages/Email/Email';
import Projetos from './pages/Projetos/Projetos';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import { mockProjetos, mockRegistros, mockEmails } from './data/mockData';

/**
 * Componente Raiz da Aplicação (App)
 * Gerencia a navegação por meio do estado local "activeTab" e renderiza a página correspondente.
 * Também controla o título dinâmico do header (ex: nome do projeto em detalhe)
 * e compartilha a lista de projetos entre as páginas.
 */
function App() {
  const [activeTab, setActiveTab] = useState('home');
  // Título personalizado do header (usado quando um projeto está em detalhe)
  const [headerTitle, setHeaderTitle] = useState(null);

  // Lista de projetos compartilhada entre as páginas (Projetos e Registros)
  // Dados fictícios importados do arquivo centralizado de mocks
  const [projetos, setProjetos] = useState(mockProjetos);

  // Função para trocar de aba e resetar o título dinâmico
  const trocarAba = (tab) => {
    setActiveTab(tab);
    setHeaderTitle(null);
  };

  // Função didática para renderizar dinamicamente a página ativa
  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home projetos={projetos} registros={mockRegistros} emails={mockEmails} />;
      case 'registros':
        return <Registros onTitleChange={setHeaderTitle} projetos={projetos} />;
      case 'email':
        return <Email onTitleChange={setHeaderTitle} />;
      case 'projetos':
        return <Projetos onTitleChange={setHeaderTitle} projetos={projetos} setProjetos={setProjetos} />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={trocarAba} headerTitle={headerTitle}>
      {renderPage()}
    </Layout>
  );
}

export default App;
