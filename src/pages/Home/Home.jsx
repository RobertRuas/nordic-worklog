import React from 'react';

/**
 * Página Inicial (Home) - Nordic Worklog
 * Atualmente em branco conforme requisitos do projeto.
 */
export default function Home() {
  return (
    <div className="fade-in">
      {/* Container principal minimalista em branco */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Área de Trabalho Inicial
        </p>
      </div>
    </div>
  );
}
