import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiPause, FiMapPin, FiSave } from 'react-icons/fi';
import useConfiguracoes from '../../../hooks/useConfiguracoes';

/**
 * Componente ParametrosBox — Nordic Worklog
 * Exibe os parâmetros de trabalho editáveis:
 * valor/hora (€), taxa stand-by (%), jornada padrão (h) e per diem (€).
 * Salva automaticamente no Firestore.
 * Mostra botão Salvar apenas quando algum valor é alterado.
 */
export default function ParametrosBox() {
  const { config, loading, salvarConfig } = useConfiguracoes();

  // Valores em edição (inicializados com os valores do Firestore)
  const [valorHora, setValorHora] = useState(config.valorHora);
  const [standPercent, setStandPercent] = useState(config.standPercent);
  const [jornada, setJornada] = useState(config.jornada);
  const [perDiem, setPerDiem] = useState(config.perDiem);

  // Atualiza valores locais quando o config do Firestore carrega
  useEffect(() => {
    if (!loading) {
      setValorHora(config.valorHora);
      setStandPercent(config.standPercent);
      setJornada(config.jornada);
      setPerDiem(config.perDiem);
    }
  }, [config, loading]);

  // Verifica se algum valor foi alterado
  const alterado = valorHora !== config.valorHora || standPercent !== config.standPercent || jornada !== config.jornada || perDiem !== config.perDiem;

  // Salva os valores no Firestore
  const salvar = () => {
    salvarConfig({ valorHora, standPercent, jornada, perDiem });
  };

  // Estilo reutilizável para input numérico (largura fixa e alinhada)
  const inputStyle = {
    width: '64px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)', borderRadius: '4px',
    padding: '2px 6px', fontSize: '0.8rem', fontWeight: 500,
    color: 'var(--text-primary)', textAlign: 'right', outline: 'none',
  };

  // Estilo fixo para sufixo (largura constante para alinhar inputs)
  const sufixoStyle = { fontSize: '0.68rem', color: 'var(--text-secondary)', opacity: 0.6, width: '28px', textAlign: 'left' };

  // Linha de parâmetro: ícone + label à esquerda, input + sufixo à direita
  const linhaParam = (icone, label, valor, setter, sufixo, passo) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: '1px solid var(--border-color)',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-primary)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{icone}</span>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="number"
          value={valor}
          step={passo || 1}
          onChange={(e) => setter(parseFloat(e.target.value) || 0)}
          style={inputStyle}
        />
        <span style={sufixoStyle}>{sufixo}</span>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '6px', padding: '10px 12px', marginTop: '10px',
    }}>
      {/* Título da seção */}
      <span style={{
        fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        Parâmetros de Trabalho
      </span>

      {/* Parâmetros editáveis */}
      {linhaParam(<FiDollarSign />, 'Valor por hora', valorHora, setValorHora, '€/h')}
      {linhaParam(<FiPause />, 'Taxa stand-by', standPercent, setStandPercent, '%')}
      {linhaParam(<FiClock />, 'Jornada padrão', jornada, setJornada, 'h', 0.5)}
      {linhaParam(<FiMapPin />, 'Per diem', perDiem, setPerDiem, '€')}

      {/* Botão Salvar — visível apenas quando há alterações */}
      {alterado && (
        <button
          onClick={salvar}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', marginTop: '10px', padding: '7px 0',
            background: 'var(--accent-color)', color: 'var(--bg-primary)',
            border: 'none', borderRadius: '6px',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
            transition: 'opacity 0.2s ease',
          }}
        >
          <FiSave style={{ fontSize: '0.75rem' }} />
          Salvar alterações
        </button>
      )}
    </div>
  );
}
