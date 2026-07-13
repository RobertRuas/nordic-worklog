/**
 * Hook useProjetos — Nordic Worklog
 * 
 * Hook específico para escutar a collection de projetos do usuário.
 * Retorna dados em tempo real + funções CRUD.
 */

import { useCallback } from 'react';
import { doc, setDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import useFirestore from './useFirestore';

export default function useProjetos() {
  const { user } = useAuth();
  const uid = user?.uid;
  const path = uid ? `users/${uid}/projetos` : null;
  const { data: projetos, loading, error } = useFirestore(path);

  // ═══ Salvar projeto (criar ou atualizar) ═══
  const salvarProjeto = useCallback(async (projeto, dados) => {
    if (!uid) return;
    const projetoRef = doc(db, `users/${uid}/projetos`, projeto.id);
    await setDoc(projetoRef, {
      ...dados,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
  }, [uid]);

  // ═══ Excluir projeto ═══
  const excluirProjeto = useCallback(async (projetoId) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/projetos`, projetoId));
  }, [uid]);

  return { projetos, loading, error, salvarProjeto, excluirProjeto };
}
