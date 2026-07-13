/**
 * Hook useEmails — Nordic Worklog
 * 
 * Hook para escutar e gerenciar os e-mails do usuário.
 * Armazenado em: users/{uid}/emails/{emailId}
 */

import { useCallback } from 'react';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import useFirestore from './useFirestore';

export default function useEmails() {
  const { user } = useAuth();
  const uid = user?.uid;
  const path = uid ? `users/${uid}/emails` : null;
  const { data: emails, loading, error } = useFirestore(path);

  // ═══ Salvar e-mail (criar ou atualizar) ═══
  const salvarEmail = useCallback(async (emailId, dados) => {
    if (!uid) return;
    await setDoc(doc(db, `users/${uid}/emails`, emailId), {
      ...dados,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
  }, [uid]);

  // ═══ Marcar como lido ═══
  const marcarLido = useCallback(async (emailId) => {
    if (!uid) return;
    await setDoc(doc(db, `users/${uid}/emails`, emailId), {
      lido: true,
    }, { merge: true });
  }, [uid]);

  // ═══ Excluir e-mail ═══
  const excluirEmail = useCallback(async (emailId) => {
    if (!uid) return;
    await deleteDoc(doc(db, `users/${uid}/emails`, emailId));
  }, [uid]);

  return { emails, loading, error, salvarEmail, marcarLido, excluirEmail };
}
