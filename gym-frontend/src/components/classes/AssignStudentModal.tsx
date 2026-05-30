import React, { useState, useEffect } from 'react';
import type { Client } from '../../types';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import Modal from '../ui/Modal';

interface AssignStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number | null;
  clients: Client[];
  onAssign: (data: { clientId: number; classId: number }) => Promise<any>;
  isLoading: boolean;
}

export const AssignStudentModal: React.FC<AssignStudentModalProps> = ({
  isOpen,
  onClose,
  classId,
  clients,
  onAssign,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedClientId('');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (selectedClientId && classId) {
      await onAssign({ clientId: Number(selectedClientId), classId });
      onClose();
    }
  };

  const filteredClients = clients
    .filter((c: Client) => 
      c.activeClassId !== classId && 
      `${c.name} ${c.lastName} ${c.dni}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Inscribir Alumno Existente"
    >
      <div className="space-y-4">
        <Input 
          label="Buscar por Nombre o DNI" 
          placeholder="Ej: Juan Perez..." 
          value={searchTerm} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} 
        />
        
        <div className="max-h-60 overflow-y-auto border rounded-xl divide-y">
          {filteredClients.map((c: Client) => (
            <div 
              key={c.id} 
              className={`p-3 cursor-pointer transition-colors flex justify-between items-center ${selectedClientId === String(c.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
              onClick={() => setSelectedClientId(String(c.id))}
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{c.name} {c.lastName}</p>
                <p className="text-xs text-gray-500">{c.dni}</p>
              </div>
              {selectedClientId === String(c.id) && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
            </div>
          ))}
          {filteredClients.length === 0 && (
            <p className="text-center py-4 text-gray-500 italic text-sm">No se encontraron alumnos para inscribir</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
           <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
           <Button 
             className="flex-1" 
             disabled={!selectedClientId || isLoading} 
             onClick={handleConfirm}
             isLoading={isLoading}
           >
             Confirmar Inscripción
           </Button>
        </div>
      </div>
    </Modal>
  );
};
