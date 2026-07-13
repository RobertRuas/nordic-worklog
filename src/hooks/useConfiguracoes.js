/**
 * Hook useConfiguracoes — Nordic Worklog
 * 
 * Hook para escutar e salvar as configurações de parâmetros do usuário.
 * Armazenado como documento único: users/{uid}/config/config
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// Valores padrão (usados quando o usuário ainda não configurou)
const PADRAO = { valorHora: 36, standPercent: 70, jornada: 10, perDiem: 50 };

export default function useConfiguracoes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [config, setConfig] = useState(PADRAO);
  const [loading, setLoading] = useState(true);

  // ═══ Carregar configurações do Firestore ═══
  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const configRef = doc(db, `users/${uid}/config/config`);
    getDoc(configRef).then((snap) => {
      if (snap.exists()) {
        setConfig({ ...PADRAO, ...snap.data() });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  // ═══ Salvar configurações no Firestore ═══
  const salvarConfig = useCallback(async (novosValores) => {
    if (!uid) return;
    await setDoc(doc(db, `users/${uid}/config/config`), {
      ...novosValores,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
    setConfig(novosValores);
  }, [uid]);

  return { config, loading, salvarConfig };
}
