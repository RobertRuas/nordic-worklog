import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import ProjectItem from './components/ProjectItem';
import ProjectForm from './components/ProjectForm';

/**
 * Página de Projetos - Nordic Worklog
 * Exibe a lista resumida dos projetos (nome + país) e permite
 * navegar para a tela de detalhes com formulário completo.
 * Dados reais do Firestore (tempo real).
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 * @param {Array} projetos - Lista de projetos do Firestore.
 * @param {function} salvarProjeto - Função para salvar projeto no Firestore.
 * @param {function} excluirProjeto - Função para excluir projeto no Firestore.
 */
export default function Projetos({ onTitleChange, projetos, salvarProjeto, excluirProjeto, registerGoBack }) {

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
      id: `proj_${Date.now()}`, // ID único para o Firestore
      nome: '',
      localizacao: '',
      cliente: '',
      escopo: '',
      descricao: '',
      tecnicos: [],
      anexos: [],
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

  // Salva um projeto no Firestore (novo ou atualizado)
  const handleSalvar = async (formAtualizado) => {
    await salvarProjeto(formAtualizado, formAtualizado);
    if (modoNovo) voltarLista();
  };

  // Exclui um projeto do Firestore
  const handleExcluir = async (id) => {
    await excluirProjeto(id);
    voltarLista();
  };

  // Renderiza a tela de detalhes ou formulário de novo projeto
  if (view === 'detalhe' && projetoSelecionado) {
    return (
      <ProjectForm
        projeto={projetoSelecionado}
        onVoltar={voltarLista}
        onSalvar={handleSalvar}
        onExcluir={handleExcluir}
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
          {projetos.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.6, textAlign: 'center', padding: '20px 0' }}>
              Nenhum projeto cadastrado.
            </p>
          ) : (
            projetos.map((projeto) => (
              <ProjectItem
                key={projeto.id}
                projeto={projeto}
                onClick={() => abrirDetalhe(projeto)}
              />
            ))
          )}
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
