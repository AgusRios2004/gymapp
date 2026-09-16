import { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { ClientSchema } from '../../types/schema.type';
import { useEscapeKey } from '../../hooks/useEscapeKey';

// 1. Inferimos el TIPO a partir del ESQUEMA (valor)
type ClientFormData = z.infer<typeof ClientSchema>;

const EMPTY_CLIENT: ClientFormData = {
  name: '',
  lastName: '',
  email: '',
  dni: '',
  phone: '',
  active: true,
} as ClientFormData;

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
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientSchema) as Resolver<ClientFormData>,
    defaultValues: EMPTY_CLIENT,
  });

  const isActive = watch('active');

  // Cuando se abre el modal o cambia initialData, resetea el formulario. Arranca en
  // null para aplicar también en el montaje, igual que el sync manual que reemplaza.
  const [prevSync, setPrevSync] = useState<{ isOpen: boolean; initialData: typeof initialData } | null>(null);
  if (prevSync === null || isOpen !== prevSync.isOpen || initialData !== prevSync.initialData) {
    setPrevSync({ isOpen, initialData });
    if (isOpen) {
      reset(initialData ?? EMPTY_CLIENT);
    }
  }

  const onSubmit = (data: ClientFormData) => {
    onSave?.(data);
  };

  // Manejador para confirmar antes de cerrar
  const handleCloseAttempt = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los datos no guardados.')) {
      onClose();
    }
  }, [onClose]);

  // Lógica de cierre con la tecla ESC
  useEscapeKey(isOpen, handleCloseAttempt);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    // Overlay: Fondo negro semitransparente
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm transition-all duration-300"
      onClick={handleCloseAttempt} // Clic fuera pregunta si cerrar
      aria-modal="true"
      role="dialog"
    >
      {/* Contenedor: Card Flotante */}
      <div
        className="bg-white w-full max-w-md mx-4 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro cierre el modal
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}
          </h3>
          <button
            onClick={handleCloseAttempt}
            className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors focus:outline-none"
            aria-label="Cerrar"
          >
            {/* Icono X */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> 
            </svg>
          </button>
        </div>

        {/* Body (Formulario) */}
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6 space-y-5">
          {/* Grid de 2 columnas para Nombre/Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              className="h-12 text-base" // Inputs altos
              placeholder="Ej. Juan"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Apellido"
              className="h-12 text-base"
              placeholder="Ej. Pérez"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          {/* Grid para DNI y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="DNI"
              className="h-12 text-base"
              placeholder="DNI"
              error={errors.dni?.message}
              {...register('dni')}
            />
            <Input
              label="Teléfono"
              className="h-12 text-base"
              placeholder="Teléfono"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          {/* Zona de Estado (Solo en Edición) - Switch tipo iPhone */}
          {isEditing && (
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900">Estado del Alumno</span>
                <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {isActive ? 'Alumno Activo' : 'Alumno Inactivo / De Baja'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setValue('active', !isActive)}
                className={`
                  relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent
                  transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2
                  ${isActive ? 'bg-green-500' : 'bg-gray-300'}
                `}
              >
                <span className="sr-only">Cambiar estado</span>
                <span
                  aria-hidden="true"
                  className={`
                    pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0
                    transition duration-200 ease-in-out
                    ${isActive ? 'translate-x-6' : 'translate-x-0'}
                  `}
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-5 flex justify-end items-center gap-3 border-t border-gray-100">
          <Button type="button" onClick={handleCloseAttempt} variant="ghost" className="text-gray-500 hover:text-gray-900 font-medium">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all rounded-xl px-6 h-12 text-base"
          >
            {isLoading ? 'Guardando...' : 'Guardar Alumno'}
          </Button>
        </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ClientModal;
