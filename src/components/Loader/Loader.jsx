import React from 'react';
import './Loader.css';

/**
 * Componente Loader — Nordic Worklog
 * Exibe um indicador de carregamento minimalista enquanto a aplicação é inicializada.
 * Evita a tela branca durante o carregamento dos recursos.
 */
export default function Loader() {
  return (
    <div className="loader-overlay">
      {/* Animação de carregamento nórdica minimalista */}
      <div className="loader-spinner" />
      <p className="loader-text">Nordic Worklog</p>
    </div>
  );
}
