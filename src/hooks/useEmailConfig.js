/**
 * Hook useEmailConfig — Nordic Worklog
 * 
 * Hook para escutar e salvar a configuração do servidor de e-mail do usuário.
 * Armazenado como documento único: users/{uid}/emailConfig/config
 * Protocolo de entrada: IMAP (imap.one.com)
 * Protocolo de saída: SMTP (send.one.com)
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

// Valores padrão — servidor one.com
const PADRAO = {
  email: '',
  senha: '',
  imap: { servidor: 'imap.one.com', porta: 993, encriptacao: 'SSL/TLS' },
  smtp: { servidor: 'send.one.com', porta: 465, encriptacao: 'SSL/TLS' },
};

export default function useEmailConfig() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [emailConfig, setEmailConfig] = useState(PADRAO);
  const [loading, setLoading] = useState(true);

  // ═══ Carregar configuração do Firestore ═══
  useEffect(() => {
    if (!uid) { setLoading(false); return; }

    const configRef = doc(db, `users/${uid}/emailConfig/config`);
    getDoc(configRef).then((snap) => {
      if (snap.exists()) {
        // Migração: se o documento antigo tem POP, converter para IMAP
        const dados = snap.data();
        if (dados.pop && !dados.imap) {
          dados.imap = {
            servidor: dados.pop.servidor || 'imap.one.com',
            porta: dados.pop.porta || 993,
            encriptacao: dados.pop.encriptacao || 'SSL/TLS',
          };
          delete dados.pop;
        }
        setEmailConfig({ ...PADRAO, ...dados });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  // ═══ Salvar configuração no Firestore ═══
  const salvarEmailConfig = useCallback(async (novosValores) => {
    if (!uid) return;
    await setDoc(doc(db, `users/${uid}/emailConfig/config`), {
      ...novosValores,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
    setEmailConfig(novosValores);
  }, [uid]);

  // ═══ Verificar se a configuração está completa ═══
  const configValida = useCallback(() => {
    const c = emailConfig;
    return !!(
      c.email?.trim() &&
      c.senha?.trim() &&
      c.imap?.servidor?.trim() &&
      c.smtp?.servidor?.trim()
    );
  }, [emailConfig]);

  return { emailConfig, loading, salvarEmailConfig, configValida };
}
