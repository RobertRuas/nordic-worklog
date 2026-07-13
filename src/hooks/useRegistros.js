/**
 * Hook useRegistros — Nordic Worklog
 * 
 * Hook específico para escutar a collection de registros do usuário.
 * Retorna dados em tempo real + funções CRUD.
 */

import { useCallback } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import useFirestore from './useFirestore';

export default function useRegistros() {
  const { user } = useAuth();
  const uid = user?.uid;
  const path = uid ? `users/${uid}/registros` : null;
  const { data: registros, loading, error } = useFirestore(path);

  // ═══ Salvar registro (criar ou atualizar) ═══
  const salvarRegistro = useCallback(async (registroId, dados) => {
    if (!uid) return;
    const registroRef = doc(db, `users/${uid}/registros`, registroId);
    await setDoc(registroRef, {
      ...dados,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
  }, [uid]);

  // ═══ Excluir registro ═══
  const excluirRegistro = useCallback(async (registroId) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/registros`, registroId));
  }, [uid]);

  return { registros, loading, error, salvarRegistro, excluirRegistro };
}
