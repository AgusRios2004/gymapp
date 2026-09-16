import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';
import { X } from 'lucide-react';
import { useEscapeKey } from '../../hooks/useEscapeKey';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}) => {
  useEscapeKey(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-display text-xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block"></span>
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
            )}
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="!p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto text-slate-900">{children}</div>

        {/* Optional Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;