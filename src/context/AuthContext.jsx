/**
 * Contexto de Autenticação — Nordic Worklog
 * 
 * Gerencia o estado de autenticação do usuário (login/cadastro/logout).
 * Usa Firebase Auth com Google Sign-In e Email/Senha.
 * A sessão persiste até logout explícito (browserLocalPersistence).
 * 
 * Expõe via hook useAuth():
 *   - user: objeto do usuário autenticado (ou null)
 *   - loading: boolean — aguardando resolução do auth state
 *   - loginGoogle(): login com conta Google
 *   - loginEmail(email, senha): login com email/senha
 *   - registerEmail(nome, email, senha): cadastro com email/senha
 *   - logout(): encerra a sessão
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// ═══ Criação do Contexto ═══
const AuthContext = createContext();

// ═══ Provedor de Autenticação ═══
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ═══ Listener de estado de autenticação ═══
  // Disparado sempre que o estado de auth muda (login, logout, refresh)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // Cleanup: remove o listener ao desmontar
    return () => unsubscribe();
  }, []);

  // ═══ Login com Google ═══
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    // Se for o primeiro login, cria o perfil no Firestore
    await criarPerfilSeNecessario(result.user);
    return result;
  };

  // ═══ Login com Email e Senha ═══
  const loginEmail = async (email, senha) => {
    const result = await signInWithEmailAndPassword(auth, email, senha);
    return result;
  };

  // ═══ Cadastro com Email e Senha ═══
  const registerEmail = async (nome, email, senha) => {
    const result = await createUserWithEmailAndPassword(auth, email, senha);
    // Atualiza o nome de exibição do usuário
    await updateProfile(result.user, { displayName: nome });
    // Cria o perfil no Firestore
    await criarPerfil(result.user, nome);
    return result;
  };

  // ═══ Logout ═══
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ═══ Funções auxiliares ═══

  // Cria o perfil do usuário no Firestore (se ainda não existir)
  const criarPerfilSeNecessario = async (firebaseUser) => {
    const perfilRef = doc(db, 'users', firebaseUser.uid);
    // setDoc com merge: cria se não existir, não sobrescreve se já existir
    await setDoc(perfilRef, {
      nome: firebaseUser.displayName || '',
      email: firebaseUser.email,
      criadoEm: serverTimestamp(),
    }, { merge: true });
  };

  // Cria o perfil do usuário no Firestore (para cadastro novo)
  const criarPerfil = async (firebaseUser, nome) => {
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      nome,
      email: firebaseUser.email,
      criadoEm: serverTimestamp(),
    });
  };

  // ═══ Valor do contexto ═══
  const valor = {
    user,
    loading,
    loginGoogle,
    loginEmail,
    registerEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══ Hook para usar o contexto de autenticação ═══
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
