/**
 * Configuração do Firebase — Nordic Worklog
 * 
 * Inicializa o Firebase com as credenciais do projeto.
 * Exporta as instâncias de Auth, Firestore e Storage para uso em toda a aplicação.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ═══ Configuração do Projeto Firebase (fornecida pelo usuário) ═══
const firebaseConfig = {
  apiKey: "AIzaSyBh_CWckW8LLKd8jMEue5SApFLsMyDQSOo",
  authDomain: "worklog-f1824.firebaseapp.com",
  projectId: "worklog-f1824",
  storageBucket: "worklog-f1824.firebasestorage.app",
  messagingSenderId: "157905562695",
  appId: "1:157905562695:web:c64fdc5787b391ca78d562",
  measurementId: "G-T23R3PRFH4"
};

// ═══ Inicialização do Firebase ═══
const app = initializeApp(firebaseConfig);

// ═══ Instâncias exportáveis ═══
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ═══ Persistência da sessão (LOCAL = sobrevive ao refresh do navegador) ═══
setPersistence(auth, browserLocalPersistence);

export default app;
