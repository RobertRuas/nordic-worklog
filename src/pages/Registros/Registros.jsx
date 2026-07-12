import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import RegistroItem from './components/RegistroItem';
import RegistroForm from './components/RegistroForm';

/**
 * Página de Registros - Nordic Worklog
 * Exibe a lista resumida dos registros (dia + projeto + semana) e permite
 * navegar para a tela de detalhes com formulário completo categorizado.
 * 
 * @param {function} onTitleChange - Função para alterar o título do header.
 * @param {Array} projetos - Lista de projetos compartilhada do App (para o select de projeto).
 */
export default function Registros({ onTitleChange, projetos }) {
  // Lista fictícia de registros com os campos obrigatórios
  const [registros, setRegistros] = useState([
    {
      id: 1, semana: 28, dia: '2025-07-07', projeto: 'Nordic Design System',
      timeNo: 'T-04', nomeTecnico: 'Erik Lindberg', funcao: 'L2', teamLeader: 'Não',
      localTurbinaNo: 'WEA1', turbinaIdNo: '552201234', maxBoglTowerNo: 'G20_001234_DE', bladeNo: 'B-01',
      wtgDowntimeHours: 2, standbyReason: 'Aguardando peça',
      workingHours: 8, standbyHours: 2, travelHours: 0,
      dailyProgress: '07:00 Tooling prepare, grinding, chamfering. 15:00 Lamination started. 19:00 Demob.',
      time: [{ id: 101, nome: 'Erik Lindberg', irataLevel: 'L2', windaId: 'RR055273BR' }],
    },
    {
      id: 2, semana: 28, dia: '2025-07-08', projeto: 'Time Tracking WebApp',
      timeNo: 'T-02', nomeTecnico: 'Anders Johansson', funcao: 'L3', teamLeader: 'Sim',
      localTurbinaNo: 'WEA3', turbinaIdNo: '552201567', maxBoglTowerNo: 'G20_001567_DE', bladeNo: 'B-03',
      wtgDowntimeHours: 0, standbyReason: '',
      workingHours: 10, standbyHours: 0, travelHours: 1,
      dailyProgress: '06:30 Arrival and setup. Coating & finishing throughout the day. 18:00 Cleanup and demob.',
      time: [{ id: 102, nome: 'Anders Johansson', irataLevel: 'L3', windaId: 'RR066384NO' }],
    },
    {
      id: 3, semana: 29, dia: '2025-07-14', projeto: 'E-commerce Platform',
      timeNo: 'T-01', nomeTecnico: 'Lars Petersen', funcao: 'L1', teamLeader: 'Não',
      localTurbinaNo: 'WEA2', turbinaIdNo: '552201890', maxBoglTowerNo: 'G20_001890_DK', bladeNo: 'B-02',
      wtgDowntimeHours: 4, standbyReason: 'Condições climáticas',
      workingHours: 5, standbyHours: 3, travelHours: 2,
      dailyProgress: '08:00 Waiting for weather window. 11:00 Started grinding. 14:00 Stand-by due to wind. 17:00 Demob.',
      time: [{ id: 201, nome: 'Lars Petersen', irataLevel: 'L1', windaId: 'RR077495DK' }],
    },
  ]);

  // Controla a visualização atual: 'lista' ou 'detalhe'
  const [view, setView] = useState('lista');
  // Registro atualmente selecionado para visualização/edição
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  // Controla se o formulário está em modo de criação
  const [modoNovo, setModoNovo] = useState(false);

  // Navega para a tela de detalhes de um registro
  const abrirDetalhe = (registro) => {
    setRegistroSelecionado(registro);
    setModoNovo(false);
    setView('detalhe');
    if (onTitleChange) onTitleChange(`Sem. ${registro.semana} — ${registro.dia}`);
  };

  // Calcula o número da semana ISO para uma data fornecida
  const obterSemanaISO = (data) => {
    const d = new Date(data);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  };

  // Formata a data atual no padrão YYYY-MM-DD
  const obterDataHoje = () => {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  };

  // Abre o formulário para criar um novo registro
  const abrirNovo = () => {
    // Define a data de hoje e calcula o número da semana automaticamente
    const dataHoje = obterDataHoje();
    const semanaHoje = obterSemanaISO(dataHoje);

    setRegistroSelecionado({
      id: Date.now(), // ID temporário baseado em timestamp
      semana: semanaHoje, dia: dataHoje, projeto: '',
      timeNo: '', nomeTecnico: '', funcao: '', teamLeader: 'Não',
      localTurbinaNo: '', turbinaIdNo: '', maxBoglTowerNo: '', bladeNo: '',
      wtgDowntimeHours: 0, standbyReason: '',
      workingHours: 0, standbyHours: 0, travelHours: 0,
      dailyProgress: '',
      time: [], // Lista de técnicos do time para este registro
    });
    setModoNovo(true);
    setView('detalhe');
    if (onTitleChange) onTitleChange('Novo Registro');
  };

  // Volta para a lista de registros
  const voltarLista = () => {
    setRegistroSelecionado(null);
    setModoNovo(false);
    setView('lista');
    if (onTitleChange) onTitleChange('Registros');
  };

  // Salva um registro (novo ou atualizado)
  const salvarRegistro = (formAtualizado) => {
    if (modoNovo) {
      // Adiciona o novo registro à lista
      setRegistros((prev) => [...prev, formAtualizado]);
    } else {
      // Atualiza o registro existente
      setRegistros((prev) => prev.map((r) => r.id === formAtualizado.id ? formAtualizado : r));
      setRegistroSelecionado(formAtualizado);
    }
  };

  // Exclui um registro da lista
  const excluirRegistro = (id) => {
    setRegistros((prev) => prev.filter((r) => r.id !== id));
    voltarLista();
  };

  // Renderiza a tela de detalhes ou formulário de novo registro
  if (view === 'detalhe' && registroSelecionado) {
    return (
      <RegistroForm
        registro={registroSelecionado}
        onVoltar={voltarLista}
        onSalvar={salvarRegistro}
        onExcluir={excluirRegistro}
        modoNovo={modoNovo}
        projetos={projetos}
      />
    );
  }

  // Renderiza a lista resumida de registros
  return (
    <div className="fade-in">
      <div className="card">
        <h2 className="card-title">Registros</h2>

        {/* Renderização da lista de registros utilizando o subcomponente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {registros.map((registro) => (
            <RegistroItem
              key={registro.id}
              registro={registro}
              onClick={() => abrirDetalhe(registro)}
            />
          ))}
        </div>
      </div>

      {/* Botão flutuante para criar um novo registro */}
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
        title="Novo Registro"
      >
        <FiPlus />
      </button>
    </div>
  );
}
