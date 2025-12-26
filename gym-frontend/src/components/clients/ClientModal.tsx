import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { z } from 'zod';
import Button from '../ui/Button';
import { ClientSchema } from '../../types/schema.type';

// 1. Inferimos el TIPO a partir del ESQUEMA (valor)
type ClientFormData = z.infer<typeof ClientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
  initialData?: ClientFormData | null; // Usamos el tipo inferido
  onSave?: (data: ClientFormData) => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  isEditing = false,
  isLoading = false,
  initialData,
  onSave,
}) => {
  // Estado local del formulario
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    lastName: '',
    email: '',
    dni: '',
    phone: ''
  } as ClientFormData); 

  // Efecto: Cuando se abre el modal o cambia initialData, actualizamos el formulario
  useEffect(() => {
    if (isOpen && initialData) {
      // Modo Edición: Rellenamos con los datos del cliente
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      // Modo Creación: Limpiamos el formulario
      setFormData({
        name: '',
        lastName: '',
        email: '',
        dni: '',
        phone: ''
      } as ClientFormData);
    }
  }, [isOpen, initialData]);

  // Manejador de cambios en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejador de guardado
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  // Lógica de cierre con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseAttempt();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Manejador para confirmar antes de cerrar
  const handleCloseAttempt = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los datos no guardados.')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    // Overlay: Fondo negro semitransparente
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleCloseAttempt} // Clic fuera pregunta si cerrar
      aria-modal="true"
      role="dialog"
    >
      {/* Contenedor: Card Flotante */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro cierre el modal
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h3>
          <button
            onClick={handleCloseAttempt}
            className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            aria-label="Cerrar"
          >
            {/* Icono X */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body (Formulario) */}
        <div className="p-6 space-y-5">
          {/* Grid de 2 columnas para Nombre/Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                placeholder="Ej. Juan"
              />
              {/* Ejemplo de mensaje de error */}
              {/* <p className="text-xs text-red-500 mt-1">El nombre es requerido</p> */}
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                placeholder="Ej. Pérez"
              />
            </div>
          </div>
          
          {/* Grid para DNI y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">DNI</label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                placeholder="DNI"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                placeholder="Teléfono"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 border-t border-gray-100">
          <Button onClick={handleCloseAttempt} variant="ghost" className="text-gray-600 hover:text-gray-800">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm">
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ClientModal;
