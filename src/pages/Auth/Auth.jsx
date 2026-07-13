/**
 * Página de Autenticação — Nordic Worklog
 * 
 * Tela de login e cadastro com design nórdico minimalista.
 * Dois modos: "Entrar" (login) e "Criar Conta" (cadastro).
 * Suporta login com Google e Email/Senha.
 * 
 * Funcionalidades:
 * - Login com Google (signInWithPopup)
 * - Login com Email/Senha
 * - Cadastro com Nome + Email + Senha + Confirmação
 * - Validação de campos e mensagens de erro em português
 * - Toggle entre modos Entrar/Criar Conta
 */

import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiLogIn } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const { loginGoogle, loginEmail, registerEmail } = useAuth();

  // ═══ Estado da UI ═══
  const [modo, setModo] = useState('login'); // 'login' ou 'registro'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // ═══ Traduz erros do Firebase para português ═══
  const traduzirErro = (codigo) => {
    const erros = {
      'auth/invalid-email': 'E-mail inválido',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Este e-mail já está em uso',
      'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
      'auth/popup-closed-by-user': 'Login cancelado',
      'auth/cancelled-popup-request': 'Login cancelado',
      'auth/invalid-credential': 'Credenciais inválidas',
      'auth/popup-blocked': 'Popup bloqueado pelo navegador',
      'auth/operation-not-allowed': 'Login com Google não está habilitado no Firebase Console',
      'auth/auth-domain-config-required': 'Domínio não configurado no Firebase',
      'auth/redirect-operation-pending': 'Outra operação de login está em andamento',
      'auth/unauthorized-domain': 'Domínio não autorizado no Firebase Console',
    };
    // Mostra o código real do erro para facilitar diagnóstico
    const mensagem = erros[codigo];
    if (mensagem) return mensagem;
    return `Erro: ${codigo || 'desconhecido'}. Verifique o Firebase Console.`;
  };

  // ═══ Validação básica dos campos ═══
  const validar = () => {
    if (!email.trim()) return 'E-mail é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail inválido';
    if (!senha) return 'Senha é obrigatória';
    if (senha.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (modo === 'registro') {
      if (!nome.trim()) return 'Nome é obrigatório';
      if (senha !== confirmarSenha) return 'As senhas não conferem';
    }
    return '';
  };

  // ═══ Handler: Login com Email/Senha ═══
  const handleLoginEmail = async (e) => {
    e.preventDefault();
    const erroValidacao = validar();
    if (erroValidacao) { setErro(erroValidacao); return; }
    
    setCarregando(true);
    setErro('');
    try {
      await loginEmail(email, senha);
    } catch (err) {
      setErro(traduzirErro(err.code));
    }
    setCarregando(false);
  };

  // ═══ Handler: Cadastro com Email/Senha ═══
  const handleRegistro = async (e) => {
    e.preventDefault();
    const erroValidacao = validar();
    if (erroValidacao) { setErro(erroValidacao); return; }
    
    setCarregando(true);
    setErro('');
    try {
      await registerEmail(nome, email, senha);
    } catch (err) {
      setErro(traduzirErro(err.code));
    }
    setCarregando(false);
  };

  // ═══ Handler: Login com Google ═══
  const handleGoogle = async () => {
    setErro('');
    setCarregando(true);
    try {
      await loginGoogle();
    } catch (err) {
      setErro(traduzirErro(err.code));
    }
    setCarregando(false);
  };

  // ═══ Alternar entre modos ═══
  const trocarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login');
    setErro('');
    setNome('');
    setConfirmarSenha('');
  };

  return (
    <div className="auth-container">
      {/* ═══ Cartão de Autenticação ═══ */}
      <div className="auth-card fade-in">
        {/* Logo/Título */}
        <div className="auth-header">
          <h1 className="auth-title">Nordic Worklog</h1>
          <p className="auth-subtitle">
            {modo === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* ═══ Botão Google ═══ */}
        <button
          onClick={handleGoogle}
          disabled={carregando}
          className="auth-google-btn"
        >
          <FcGoogle style={{ fontSize: '1.1rem' }} />
          <span>Continuar com Google</span>
        </button>

        {/* ═══ Divisor ═══ */}
        <div className="auth-divider">
          <span>ou</span>
        </div>

        {/* ═══ Formulário Email/Senha ═══ */}
        <form onSubmit={modo === 'login' ? handleLoginEmail : handleRegistro}>
          {/* Campo Nome (apenas no modo registro) */}
          {modo === 'registro' && (
            <div className="auth-field">
              <label className="auth-label">
                <FiUser /> Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="auth-input"
                disabled={carregando}
              />
            </div>
          )}

          {/* Campo E-mail */}
          <div className="auth-field">
            <label className="auth-label">
              <FiMail /> E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="auth-input"
              disabled={carregando}
            />
          </div>

          {/* Campo Senha */}
          <div className="auth-field">
            <label className="auth-label">
              <FiLock /> Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="auth-input"
              disabled={carregando}
            />
          </div>

          {/* Campo Confirmar Senha (apenas no modo registro) */}
          {modo === 'registro' && (
            <div className="auth-field">
              <label className="auth-label">
                <FiLock /> Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a senha"
                className="auth-input"
                disabled={carregando}
              />
            </div>
          )}

          {/* ═══ Mensagem de Erro ═══ */}
          {erro && (
            <p className="auth-error">{erro}</p>
          )}

          {/* ═══ Botão Principal ═══ */}
          <button
            type="submit"
            disabled={carregando}
            className="auth-submit-btn"
          >
            <FiLogIn />
            {carregando
              ? 'Carregando...'
              : modo === 'login' ? 'Entrar' : 'Criar Conta'
            }
          </button>
        </form>

        {/* ═══ Toggle Entrar/Criar Conta ═══ */}
        <p className="auth-toggle">
          {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}
          <button onClick={trocarModo} className="auth-toggle-btn">
            {modo === 'login' ? ' Criar conta' : ' Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}
