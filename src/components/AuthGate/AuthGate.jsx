/**
 * AuthGate — Nordic Worklog
 * 
 * Portão de autenticação: protege toda a aplicação.
 * - Enquanto carrega: mostra o Loader global.
 * - Se não autenticado: mostra a tela de Login/Cadastro.
 * - Se autenticado: renderiza o <App /> normalmente.
 */

import { useAuth } from '../../context/AuthContext';
import Loader from '../Loader/Loader';
import Auth from '../../pages/Auth/Auth';
import './AuthGate.css';

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();

  // ═══ Estado de carregamento inicial do Firebase ═══
  if (loading) {
    return <Loader />;
  }

  // ═══ Usuário não autenticado — mostra tela de login ═══
  if (!user) {
    return <Auth />;
  }

  // ═══ Usuário autenticado — renderiza a aplicação ═══
  return children;
}
