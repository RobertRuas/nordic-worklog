import React from 'react';
import ThemeToggle from './components/ThemeToggle';
import ParametrosBox from './components/ParametrosBox';
import DangerZone from './components/DangerZone';
import { FiDownload, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

/**
 * Página de Configurações - Nordic Worklog
 * Contém opções de tema (light/dark), exportação, dados de conta,
 * parâmetros de valor/hora e zona de perigo (excluir dados).
 */
export default function Configuracoes() {
  const { user, logout } = useAuth();

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

          {/* ═══ Informações da Conta (real — do Firebase Auth) ═══ */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Conta</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user?.email || '—'}
            </span>
          </div>

          {/* ═══ Botão de Logout ═══ */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              cursor: 'pointer',
            }}
            onClick={logout}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLogOut style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>Sair da Conta</span>
            </div>
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

      {/* ═══ Zona de Perigo — Excluir todos os dados ═══ */}
      <div className="card">
        <h2 className="card-title">Gerenciamento de Dados</h2>
        <DangerZone />
      </div>
    </div>
  );
}
