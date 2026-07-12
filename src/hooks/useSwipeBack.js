import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook useSwipeBack — Nordic Worklog
 * Detecta gestos de toque em dispositivos móveis para navegação intuitiva.
 * 
 * Gestos suportados:
 * - Arrastar da esquerda para direita → voltar (voltar à tela anterior)
 * - Limite mínimo de deslocamento: 80px horizontal com tolerância vertical
 * 
 * @param {function} onBack - Função chamada quando o gesto de voltar é detectado.
 * @param {boolean} enabled - Se o gesto está ativo (padrão: true).
 */
export default function useSwipeBack(onBack, enabled = true) {
  // Referência para armazenar dados do toque inicial
  const touchStart = useRef(null);
  // Referência para o elemento que receberá o listener
  const containerRef = useRef(null);

  // Início do toque — registra posição X, Y e timestamp
  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, [enabled]);

  // Fim do toque — calcula deslocamento e decide se é um gesto de voltar
  const handleTouchEnd = useCallback((e) => {
    if (!enabled || !touchStart.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = Math.abs(touch.clientY - touchStart.current.y);
    const deltaTime = Date.now() - touchStart.current.time;

    // Critérios para considerar como gesto de voltar:
    // 1. Deslocamento horizontal > 80px (direção esquerda→direita)
    // 2. Deslocamento vertical < 100px (não é um scroll vertical)
    // 3. Tempo < 500ms (gesto rápido, não um toque prolongado)
    const isSwipeRight = deltaX > 80;
    const isHorizontal = deltaY < 100;
    const isQuick = deltaTime < 500;

    if (isSwipeRight && isHorizontal && isQuick) {
      onBack();
    }

    // Limpa o registro do toque
    touchStart.current = null;
  }, [enabled, onBack]);

  // Registra os event listeners no elemento do container
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd, enabled]);

  return containerRef;
}
