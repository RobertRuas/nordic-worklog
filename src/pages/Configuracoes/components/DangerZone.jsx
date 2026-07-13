/**
 * Componente DangerZone — Nordic Worklog
 * 
 * Zona de perigo nas configurações de conta.
 * Permite excluir TODOS os dados do usuário (Firestore + Storage).
 * Requer confirmação digitando "EXCLUIR" para evitar acidentes.
 * Após exclusão, faz logout automático.
 */

import React, { useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX } from 'react-icons/fi';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, listAll, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../firebase/config';
import { useAuth } from '../../../context/AuthContext';

export default function DangerZone() {
  const { user, logout } = useAuth();
  const uid = user?.uid;

  // ═══ Estado do modal de confirmação ═══
  const [modalAberto, setModalAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');
  const [excluindo, setExcluindo] = useState(false);
  const [progresso, setProgresso] = useState('');

  // ═══ Excluir TODOS os dados do usuário ═══
  const excluirTudo = async () => {
    if (confirmacao !== 'EXCLUIR' || !uid) return;
    setExcluindo(true);

    try {
      // ═══ 1. Excluir documentos do Firestore ═══
      setProgresso('Excluindo projetos...');
      const subcollections = ['projetos', 'registros', 'emails'];
      
      for (const subCol of subcollections) {
        const colRef = collection(db, `users/${uid}/${subCol}`);
        const snapshot = await getDocs(colRef);
        
        // Para cada documento, exclui subcollections e o documento em si
        for (const docSnap of snapshot.docs) {
          // Excluir sub-subcollections (tecnicos, anexos, fotos)
          const subSubCols = ['tecnicos', 'anexos', 'fotos'];
          for (const subSub of subSubCols) {
            const subRef = collection(db, `users/${uid}/${subCol}/${docSnap.id}/${subSub}`);
            const subSnapshot = await getDocs(subRef);
            for (const subDoc of subSnapshot.docs) {
              await deleteDoc(subDoc.ref);
            }
          }
          await deleteDoc(docSnap.ref);
        }
      }

      // ═══ 2. Excluir configurações ═══
      setProgresso('Excluindo configurações...');
      const configCols = ['config', 'emailConfig'];
      for (const col of configCols) {
        const colRef = collection(db, `users/${uid}/${col}`);
        const snapshot = await getDocs(colRef);
        for (const d of snapshot.docs) {
          await deleteDoc(d.ref);
        }
      }

      // ═══ 3. Excluir arquivos do Storage ═══
      setProgresso('Excluindo arquivos...');
      const storageRef = ref(storage, `uploads/${uid}`);
      try {
        const { items } = await listAll(storageRef);
        for (const item of items) {
          await deleteObject(item);
        }
        // Também percorre subpastas
        const { prefixes } = await listAll(storageRef);
        for (const prefix of prefixes) {
          const subItems = await listAll(prefix);
          for (const item of subItems.items) {
            await deleteObject(item);
          }
        }
      } catch {
        // Se não houver arquivos, não é erro
      }

      // ═══ 4. Excluir perfil do usuário ═══
      setProgresso('Excluindo perfil...');
      await deleteDoc(doc(db, 'users', uid));

      // ═══ 5. Logout ═══
      setProgresso('Concluído!');
      await logout();
    } catch (err) {
      console.error('Erro ao excluir dados:', err);
      setExcluindo(false);
      setProgresso('');
      alert('Erro ao excluir dados. Tente novamente.');
    }
  };

  // ═══ Estilo da zona de perigo ═══
  const zonaStyle = {
    marginTop: '16px',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    background: 'rgba(239, 68, 68, 0.04)',
  };

  return (
    <>
      {/* ═══ Card da Zona de Perigo ═══ */}
      <div style={zonaStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FiAlertTriangle style={{ color: '#ef4444', fontSize: '0.85rem' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Zona de Perigo
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
          Esta ação é irreversível. Todos os seus projetos, registros, fotos, anexos e configurações serão permanentemente excluídos.
        </p>
        <button
          onClick={() => setModalAberto(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '6px',
            border: '1px solid #ef4444', background: 'transparent',
            color: '#ef4444', fontSize: '0.75rem', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-main)',
          }}
        >
          <FiTrash2 size={13} />
          Excluir todos os dados
        </button>
      </div>

      {/* ═══ Modal de Confirmação ═══ */}
      {modalAberto && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '20px',
          }}
          onClick={() => !excluindo && setModalAberto(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)', borderRadius: '12px',
              border: '1px solid var(--border-color)',
              width: '100%', maxWidth: '320px', padding: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiAlertTriangle /> Confirmar Exclusão
              </span>
              {!excluindo && (
                <button
                  onClick={() => setModalAberto(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Instrução */}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Digite <strong style={{ color: '#ef4444' }}>EXCLUIR</strong> para confirmar. Esta ação não pode ser desfeita.
            </p>

            {/* Input de confirmação */}
            <input
              type="text"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Digite EXCLUIR"
              disabled={excluindo}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: '6px',
                border: `1px solid ${confirmacao === 'EXCLUIR' ? '#ef4444' : 'var(--border-color)'}`,
                background: 'var(--bg-primary)', color: 'var(--text-primary)',
                fontSize: '0.8rem', fontFamily: 'var(--font-main)', outline: 'none',
                marginBottom: '12px', boxSizing: 'border-box',
              }}
            />

            {/* Progresso */}
            {excluindo && progresso && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '0 0 10px', textAlign: 'center' }}>
                {progresso}
              </p>
            )}

            {/* Botão confirmar exclusão */}
            <button
              onClick={excluirTudo}
              disabled={confirmacao !== 'EXCLUIR' || excluindo}
              style={{
                width: '100%', padding: '10px 0', borderRadius: '6px',
                border: 'none', background: confirmacao === 'EXCLUIR' ? '#ef4444' : 'var(--border-color)',
                color: confirmacao === 'EXCLUIR' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.78rem', fontWeight: 600, cursor: confirmacao === 'EXCLUIR' ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <FiTrash2 size={13} />
              {excluindo ? 'Excluindo...' : 'Excluir permanentemente'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
