import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AuthGate from './components/AuthGate/AuthGate'

/**
 * Componente raiz que remove o loader inline do index.html
 * após o React montar a aplicação.
 * Envolve tudo com ThemeProvider e AuthProvider.
 */
function Root() {
  useEffect(() => {
    // Remove o loader inline assim que o React estiver pronto
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
