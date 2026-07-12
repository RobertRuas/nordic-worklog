import React from 'react';
import ThemeToggle from './components/ThemeToggle';
import ParametrosBox from './components/ParametrosBox';
import { FiDownload, FiUser } from 'react-icons/fi';

/**
 * Página de Configurações - Nordic Worklog
 * Contém opções de tema (light-dark), exportação, dados de conta e parâmetros de valor/hora.
 */
export default function Configuracoes() {
  return (
    <div className="fade-in">
      {/* Bloco Geral de Ajustes */}
      <div className="card">
        <h2 className="card-title">Opções Gerais</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Opção de Troca de Tema */}
          <ThemeToggle />

          {/* Opção de Exportação (Fictício) */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            onClick={() => alert('Exportação iniciada... (Simulação)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiDownload style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Exportar Dados (CSV)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Executar</span>
          </div>

          {/* Opção de Conta (Fictício) */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Gerenciamento de Conta</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>robert@nordic.com</span>
          </div>
        </div>
      </div>

      {/* Bloco de Parâmetros de Configuração */}
      <div className="card">
        <h2 className="card-title">Configurações de Parâmetros</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Defina as taxas e tempos padrão que influenciam no cálculo automático do seu Worklog.
        </p>
        <ParametrosBox />
      </div>
    </div>
  );
}
