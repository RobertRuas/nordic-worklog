import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import ProjectItem from './components/ProjectItem';
import ProjectForm from './components/ProjectForm';

/**
 * Página de Projetos - Nordic Worklog
 * Exibe a lista resumida dos projetos (nome + país) e permite
 * navegar para a tela de detalhes com formulário completo.
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 * @param {Array} projetos - Lista de projetos compartilhada do App.
 * @param {function} setProjetos - Função para atualizar a lista de projetos no App.
 */
export default function Projetos({ onTitleChange, projetos, setProjetos, registerGoBack }) {

  // Controla a visualização atual: 'lista' ou 'detalhe'
  const [view, setView] = useState('lista');
  // Projeto atualmente selecionado para visualização/edição
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  // Controla se o formulário está em modo de criação
  const [modoNovo, setModoNovo] = useState(false);

  // Ref para a função voltarLista (usado pelo gesto de swipe)
  const voltarListaRef = React.useRef(null);

  // Registra a função de voltar para o gesto de swipe
  React.useEffect(() => {
    if (registerGoBack) {
      registerGoBack(view === 'detalhe' ? () => voltarListaRef.current?.() : null);
    }
    return () => { if (registerGoBack) registerGoBack(null); };
  }, [view]);

  // Navega para a tela de detalhes de um projeto
  const abrirDetalhe = (projeto) => {
    setProjetoSelecionado(projeto);
    setModoNovo(false);
    setView('detalhe');
    if (onTitleChange) onTitleChange(projeto.nome);
  };

  // Abre o formulário para criar um novo projeto
  const abrirNovo = () => {
    setProjetoSelecionado({
      id: Date.now(), // ID temporário baseado em timestamp
      nome: '',
      localizacao: '',
      cliente: '',
      escopo: '',
      descricao: '',
      tecnicos: [],
    });
    setModoNovo(true);
    setView('detalhe');
    if (onTitleChange) onTitleChange('Novo Projeto');
  };

  // Volta para a lista de projetos
  const voltarLista = () => {
    setProjetoSelecionado(null);
    setModoNovo(false);
    setView('lista');
    if (onTitleChange) onTitleChange('Meus Projetos');
  };
  // Atualiza a ref para o gesto de swipe
  voltarListaRef.current = voltarLista;

  // Salva um projeto (novo ou atualizado)
  const salvarProjeto = (formAtualizado) => {
    if (modoNovo) {
      // Adiciona o novo projeto à lista
      setProjetos((prev) => [...prev, formAtualizado]);
    } else {
      // Atualiza o projeto existente
      setProjetos((prev) => prev.map((p) => p.id === formAtualizado.id ? formAtualizado : p));
      setProjetoSelecionado(formAtualizado);
    }
  };

  // Exclui um projeto da lista
  const excluirProjeto = (id) => {
    setProjetos((prev) => prev.filter((p) => p.id !== id));
    voltarLista();
  };

  // Renderiza a tela de detalhes ou formulário de novo projeto
  if (view === 'detalhe' && projetoSelecionado) {
    return (
      <ProjectForm
        projeto={projetoSelecionado}
        onVoltar={voltarLista}
        onSalvar={salvarProjeto}
        onExcluir={excluirProjeto}
        modoNovo={modoNovo}
      />
    );
  }

  // Renderiza a lista resumida de projetos
  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">Projetos</h2>
        
        {/* Renderização da lista de projetos utilizando o subcomponente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {projetos.map((projeto) => (
            <ProjectItem
              key={projeto.id}
              projeto={projeto}
              onClick={() => abrirDetalhe(projeto)}
            />
          ))}
        </div>
      </div>

      {/* Botão flutuante para criar um novo projeto */}
      <button
        onClick={abrirNovo}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: 'none',
          background: 'var(--text-primary)',
          color: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.2rem',
          zIndex: 100,
        }}
        title="Novo Projeto"
      >
        <FiPlus />
      </button>
    </div>
  );
}
