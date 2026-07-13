/**
 * Hook useStorage — Nordic Worklog
 * 
 * Hook para upload e gerenciamento de arquivos no Firebase Storage.
 * Inclui validação de tipo e tamanho, e progresso de upload.
 * 
 * Limites de tamanho:
 *   - Fotos (jpg/png): 5 MB
 *   - Documentos (pdf/xls/doc): 10 MB
 */

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '../firebase/config';

// ═══ Constantes de validação ═══
const MAX_TAMANHO_FOTO = 5 * 1024 * 1024;     // 5 MB
const MAX_TAMANHO_DOC = 10 * 1024 * 1024;     // 10 MB
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/png', 'image/jpeg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function useStorage() {
  const [progresso, setProgresso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // ═══ Valida o arquivo antes do upload ═══
  const validarArquivo = (arquivo) => {
    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      return `Tipo não permitido: ${arquivo.name}`;
    }
    const maxTipo = arquivo.type.startsWith('image/') ? MAX_TAMANHO_FOTO : MAX_TAMANHO_DOC;
    if (arquivo.size > maxTipo) {
      const maxMB = (maxTipo / (1024 * 1024)).toFixed(0);
      return `${arquivo.name} excede o limite de ${maxMB}MB`;
    }
    return '';
  };

  // ═══ Upload de arquivo para o Storage ═══
  // @param {string} path - Caminho no Storage (ex: `uploads/${uid}/projetos/${id}/arquivo.pdf`)
  // @param {File} arquivo - Arquivo a ser enviado
  // @returns {string} URL de download do arquivo enviado
  const uploadFile = async (path, arquivo) => {
    // Validação
    const erroValidacao = validarArquivo(arquivo);
    if (erroValidacao) {
      setErro(erroValidacao);
      throw new Error(erroValidacao);
    }

    setEnviando(true);
    setProgresso(0);
    setErro('');

    try {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, arquivo);

      // Aguarda o upload completo com progresso
      return new Promise((resolve, reject) => {
        task.on(
          'state_changed',
          (snapshot) => {
            // Atualiza o progresso (0-100)
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgresso(pct);
          },
          (err) => {
            setErro(err.message);
            setEnviando(false);
            reject(err);
          },
          async () => {
            // Upload concluído — obtém a URL de download
            const url = await getDownloadURL(task.snapshot.ref);
            setEnviando(false);
            setProgresso(100);
            resolve(url);
          }
        );
      });
    } catch (err) {
      setEnviando(false);
      throw err;
    }
  };

  // ═══ Remover arquivo do Storage ═══
  const deleteFile = async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (err) {
      // Se o arquivo não existir, não é erro
      if (err.code !== 'storage/object-not-found') {
        throw err;
      }
    }
  };

  // ═══ Obter URL de download ═══
  const getDownloadUrl = async (path) => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  };

  return {
    uploadFile,
    deleteFile,
    getDownloadUrl,
    validarArquivo,
    progresso,
    enviando,
    erro,
  };
}
