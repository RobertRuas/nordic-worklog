import React, { createContext, useContext, useState, useEffect } from 'react';

// Criação do Contexto do Tema
const ThemeContext = createContext();

// Provedor do Contexto do Tema que encapsulará a aplicação
export function ThemeProvider({ children }) {
  // Inicializa o tema verificando o localStorage ou a preferência do sistema
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // Verifica preferência de sistema do usuário
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Atualiza a classe no documento HTML e salva no localStorage sempre que o tema mudar
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função simples para alternar entre temas
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personalizado didático para utilizar o tema em qualquer componente de forma simples
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
