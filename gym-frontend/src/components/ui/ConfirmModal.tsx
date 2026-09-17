import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  variant?: 'danger' | 'warning';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  danger: {
    iconBg: 'bg-rose-50 text-rose-600',
    Icon: Trash2,
    confirmVariant: 'danger' as const,
  },
  warning: {
    iconBg: 'bg-amber-50 text-amber-600',
    Icon: AlertTriangle,
    confirmVariant: 'warning' as const,
  },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
}) => {
  const { iconBg, Icon, confirmVariant } = VARIANT_STYLES[variant];

  // Mientras hay una mutación en curso, el modal no se cierra por backdrop/X/Escape — solo
  // el botón Cancelar (deshabilitado) o que la mutación termine.
  const handleClose = isLoading ? () => {} : onClose;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl shrink-0 ${iconBg}`}>
          <Icon size={24} />
        </div>
        {description && (
          <p className="text-sm text-slate-600 pt-1.5">{description}</p>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
