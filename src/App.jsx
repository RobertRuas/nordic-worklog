import React, { useState } from 'react';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Registros from './pages/Registros/Registros';
import Projetos from './pages/Projetos/Projetos';
import Configuracoes from './pages/Configuracoes/Configuracoes';

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
  const [projetos, setProjetos] = useState([
    { id: 1, nome: 'Nordic Design System', localizacao: 'Noruega', cliente: 'Oslo Studio', escopo: 'Design System', descricao: 'Criação de um design system completo para aplicações internas.', tecnicos: [
      { id: 101, nome: 'Erik Lindberg', irataLevel: 'L2', windaId: 'RR055273BR' },
      { id: 102, nome: 'Anders Johansson', irataLevel: 'L3', windaId: 'RR066384NO' },
    ]},
    { id: 2, nome: 'Time Tracking WebApp', localizacao: 'Suécia', cliente: 'Stockholm Tech', escopo: 'Desenvolvimento Web', descricao: 'Aplicação web para rastreamento de horas trabalhadas.', tecnicos: [
      { id: 201, nome: 'Lars Petersen', irataLevel: 'L1', windaId: 'RR077495DK' },
    ]},
    { id: 3, nome: 'E-commerce Platform', localizacao: 'Dinamarca', cliente: 'Copenhagen Retail', escopo: 'E-commerce', descricao: 'Plataforma de comércio eletrônico para varejo nórdico.', tecnicos: [] },
  ]);

  // Função para trocar de aba e resetar o título dinâmico
  const trocarAba = (tab) => {
    setActiveTab(tab);
    setHeaderTitle(null);
  };

  // Função didática para renderizar dinamicamente a página ativa
  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'registros':
        return <Registros onTitleChange={setHeaderTitle} projetos={projetos} />;
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
