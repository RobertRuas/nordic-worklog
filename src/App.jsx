import React, { useState, useRef, useCallback } from 'react';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Registros from './pages/Registros/Registros';
import Email from './pages/Email/Email';
import Projetos from './pages/Projetos/Projetos';
import Configuracoes from './pages/Configuracoes/Configuracoes';
import useProjetos from './hooks/useProjetos';
import useRegistros from './hooks/useRegistros';
import useEmails from './hooks/useEmails';

/**
 * Componente Raiz da Aplicação (App)
 * Gerencia a navegação por meio do estado local "activeTab" e renderiza a página correspondente.
 * Também controla o título dinâmico do header (ex: nome do projeto em detalhe).
 * Dados reais vindos do Firestore via hooks (tempo real).
 */
function App() {
  const [activeTab, setActiveTab] = useState('home');
  // Título personalizado do header (usado quando um projeto está em detalhe)
  const [headerTitle, setHeaderTitle] = useState(null);

  // ═══ Dados reais do Firestore (tempo real) ═══
  const { projetos, salvarProjeto, excluirProjeto } = useProjetos();
  const { registros, salvarRegistro, excluirRegistro } = useRegistros();
  const { emails, salvarEmail, marcarLido, excluirEmail } = useEmails();

  // Ref para a função de voltar da página atual (usada pelo gesto de swipe)
  const goBackRef = useRef(null);

  // Função que as páginas chamam para registrar seu handler de voltar
  const registerGoBack = useCallback((handler) => {
    goBackRef.current = handler;
  }, []);

  // Função de voltar do gesto: prioriza o handler da página, senão volta para home
  const handleSwipeBack = useCallback(() => {
    if (goBackRef.current) {
      goBackRef.current();
    } else if (activeTab !== 'home') {
      setActiveTab('home');
      setHeaderTitle(null);
    }
  }, [activeTab]);

  // Função para trocar de aba e resetar o título dinâmico
  const trocarAba = (tab) => {
    setActiveTab(tab);
    setHeaderTitle(null);
  };

  // Função didática para renderizar dinamicamente a página ativa
  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home projetos={projetos} registros={registros} emails={emails} />;
      case 'registros':
        return (
          <Registros
            onTitleChange={setHeaderTitle}
            projetos={projetos}
            registros={registros}
            salvarRegistro={salvarRegistro}
            excluirRegistro={excluirRegistro}
            registerGoBack={registerGoBack}
          />
        );
      case 'email':
        return (
          <Email
            onTitleChange={setHeaderTitle}
            emails={emails}
            salvarEmail={salvarEmail}
            marcarLido={marcarLido}
            excluirEmail={excluirEmail}
            registerGoBack={registerGoBack}
          />
        );
      case 'projetos':
        return (
          <Projetos
            onTitleChange={setHeaderTitle}
            projetos={projetos}
            salvarProjeto={salvarProjeto}
            excluirProjeto={excluirProjeto}
            registerGoBack={registerGoBack}
          />
        );
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={trocarAba} headerTitle={headerTitle} onSwipeBack={handleSwipeBack}>
      {renderPage()}
    </Layout>
  );
}

export default App;
