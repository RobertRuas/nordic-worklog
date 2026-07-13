import { useCallback } from 'react';

/**
 * Hook useImageResize — Nordic Worklog
 * 
 * Redimensiona fotos automaticamente no navegador usando Canvas API.
 * Se a imagem exceder a resolução máxima (1024px), ela é reduzida
 * proporcionalmente mantendo a aspect ratio. Também comprime em JPEG 80%.
 * 
 * Isso evita rejeitar fotos grandes — em vez disso, adapta automaticamente.
 * 
 * @returns {Function} redimensionar — recebe um File e retorna Promise<File>
 */
export default function useImageResize() {
  /**
   * Redimensiona uma imagem se for maior que a resolução máxima.
   * 
   * @param {File} arquivo - Arquivo de imagem selecionado
   * @param {number} resolucaoMax - Largura/altura máxima em px (padrão: 1024)
   * @param {number} qualidade - Qualidade JPEG de 0 a 1 (padrão: 0.8)
   * @returns {Promise<File>} — Arquivo processado (ou original se já estava OK)
   */
  const redimensionar = useCallback((arquivo, resolucaoMax = 1024, qualidade = 0.8) => {
    return new Promise((resolve) => {
      // ═══ Se não for imagem, retorna o arquivo original ═══
      if (!arquivo.type.startsWith('image/')) {
        resolve(arquivo);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;

          // ═══ Se já está dentro do limite, retorna o original ═══
          if (width <= resolucaoMax && height <= resolucaoMax) {
            resolve(arquivo);
            return;
          }

          // ═══ Calcula novas dimensões proporcionais ═══
          if (width > height) {
            // Paisagem: ajusta pela largura
            height = Math.round((height / width) * resolucaoMax);
            width = resolucaoMax;
          } else {
            // Retrato: ajusta pela altura
            width = Math.round((width / height) * resolucaoMax);
            height = resolucaoMax;
          }

          // ═══ Desenha no canvas e exporta como JPEG comprimido ═══
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback: retorna original se falhar
                resolve(arquivo);
                return;
              }
              const arquivoRedimensionado = new File(
                [blob],
                arquivo.name.replace(/\.[^.]+$/, '.jpg'),
                { type: 'image/jpeg' }
              );
              resolve(arquivoRedimensionado);
            },
            'image/jpeg',
            qualidade
          );
        };
        img.onerror = () => resolve(arquivo);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(arquivo);
      reader.readAsDataURL(arquivo);
    });
  }, []);

  return { redimensionar };
}
