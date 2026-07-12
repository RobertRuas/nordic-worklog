import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { ThemeProvider } from './context/ThemeContext.jsx'

/**
 * Componente raiz que remove o loader inline do index.html
 * após o React montar a aplicação.
 */
function Root() {
  useEffect(() => {
    // Remove o loader inline assim que o React estiver pronto
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
  }, []);

  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
