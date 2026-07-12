import React, { useState } from 'react';
import { FiDollarSign, FiClock } from 'react-icons/fi';

/**
 * Componente ParametrosBox didático
 * Uma caixa contendo parâmetros editáveis da aplicação, como valor da hora de trabalho.
 */
export default function ParametrosBox() {
  const [valorHora, setValorHora] = useState(50.00);
  const [moeda, setMoeda] = useState('BRL');
  const [jornadaDiaria, setJornadaDiaria] = useState(8);

  return (
    <div 
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        padding: '12px',
        marginTop: '12px',
      }}
    >
      <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '10px' }}>
        Parâmetros de Trabalho
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Parâmetro: Valor/Hora */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiDollarSign style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} />
            Valor por Hora
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>R$</span>
            <input 
              type="number" 
              value={valorHora} 
              onChange={(e) => setValorHora(parseFloat(e.target.value) || 0)}
              style={{
                width: '60px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                textAlign: 'right',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Parâmetro: Jornada Diária Padrão */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiClock style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }} />
            Jornada Diária
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input 
              type="number" 
              value={jornadaDiaria} 
              onChange={(e) => setJornadaDiaria(parseInt(e.target.value) || 0)}
              style={{
                width: '60px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                textAlign: 'right',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
