'use client';
import { useState, useEffect, useRef } from 'react';
import { nunito } from './font.jsx';

export default function ConfirmarAccion({ isOpen, onClose, onConfirm, titulo, mensaje, tipo = 'danger' }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setShouldRender(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!shouldRender) return null;

  const styles = {
    danger: { btn: 'bg-red-600 hover:bg-red-700 shadow-red-600/20', icon: 'text-red-600', border: 'border-red-600' },
    warning: { btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20', icon: 'text-amber-500', border: 'border-amber-500' }
  };

  return (
    <div 
      ref={overlayRef}
      onClick={handleOverlayClick}
      onAnimationEnd={handleAnimationEnd}
      // Fondo con animación
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300 ease-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        // Modal con animación de escala y opacidad
        className={`bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border-t-8 ${styles[tipo].border} ${nunito?.className} transition-all duration-300 ease-out transform ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="p-8 text-center">
          <div className={`text-6xl mb-5 ${styles[tipo].icon} animate-pulse`}>{tipo === 'danger' ? '⚠️' : '👁️'}</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">{titulo}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{mensaje}</p>
        </div>
        
        <div className="flex p-5 gap-3 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={onClose} 
            className="cursor-pointer flex-1 py-2.5 text-gray-700 font-bold hover:bg-gray-200 rounded-lg transition-all duration-200"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className={`cursor-pointer flex-1 py-2.5 text-white font-bold rounded-lg shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 ${styles[tipo].btn}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}