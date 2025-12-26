import type { ReactNode } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // 1. Lógica de cierre con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    // Limpieza del evento al desmontar o cerrar
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 2. Early Return: Si no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // 3. Renderizado usando Portal (se inyecta en el body directamente)
  return ReactDOM.createPortal(
    // CAPA 1: El Overlay (Fondo oscuro)
    // 'fixed inset-0' ocupa toda la pantalla. 'z-50' asegura que esté encima.
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onClose} // Cierra al hacer clic fuera
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()} // Evita que el clic cierre el modal (Stop Propagation)
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            Cerrar
          </Button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;