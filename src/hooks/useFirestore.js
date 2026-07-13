/**
 * Hook useFirestore — Nordic Worklog
 * 
 * Hook genérico para escutar uma collection do Firestore em tempo real.
 * Usa onSnapshot para sincronização automática.
 * 
 * @param {string} collectionPath - Caminho da collection (ex: `users/${uid}/projetos`)
 * @returns {{ data: Array, loading: boolean, error: string|null }}
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function useFirestore(collectionPath) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionPath) {
      setLoading(false);
      return;
    }

    // Cria a query ordenada por data de criação (mais recente primeiro)
    const colRef = collection(db, ...collectionPath.split('/'));
    
    // Tenta ordenar por criadoEm; se não existir, usa ordem natural
    let q;
    try {
      q = query(colRef);
    } catch {
      q = colRef;
    }

    // Listener em tempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const resultados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(resultados);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erro Firestore:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup: remove o listener ao desmontar ou mudar o path
    return () => unsubscribe();
  }, [collectionPath]);

  return { data, loading, error };
}
