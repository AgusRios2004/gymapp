import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, UserMinus } from 'lucide-react';
import { getStudentsByClass } from '../services/classService';
import type { Client, Assistance } from '../../../types';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';

interface ClassStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: number | null;
  assistanceToday: Assistance[];
  onTakeAssistance: (clientId: number) => void;
  onRemoveStudent: (clientId: number) => void;
}

export const ClassStudentsModal: React.FC<ClassStudentsModalProps> = ({
  isOpen,
  onClose,
  classId,
  assistanceToday,
  onTakeAssistance,
  onRemoveStudent,
}) => {
  const { data: studentsInClass = [], isLoading: isLoadingStudents } = useQuery<Client[]>({
    queryKey: ['class-students', classId],
    queryFn: () => classId ? getStudentsByClass(classId) : Promise.resolve([]),
    enabled: isOpen && !!classId,
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Alumnos Inscritos"
    >
      <div className="space-y-4">
        {isLoadingStudents ? (
          <p className="text-center py-4">Cargando...</p>
        ) : studentsInClass.length === 0 ? (
          <p className="text-center py-4 text-gray-500 italic">No hay alumnos inscritos</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {studentsInClass.map((student: Client) => {
              const isPresent = assistanceToday.some(a => a.idClient === student.id);
              return (
                <div key={student.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className={`font-medium ${student.isDebtor ? 'text-red-500' : 'text-gray-900'}`}>
                      {student.name} {student.lastName}
                      {student.isDebtor && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Deuda</span>}
                    </p>
                    <p className="text-xs text-gray-500">{student.dni}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onTakeAssistance(student.id)}
                      disabled={isPresent}
                      className={`p-2 transition-colors ${isPresent 
                        ? 'text-green-600 bg-green-100 rounded-full' 
                        : 'text-green-500 hover:scale-110'}`}
                      title={isPresent ? "Asistencia tomada" : "Marcar asistencia"}
                    >
                      <UserCheck size={22} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => { if(confirm("¿Quitar alumno de la clase?")) onRemoveStudent(student.id); }}
                      className="p-2 text-red-500 hover:text-red-700 hover:scale-110 transition-all font-bold"
                      title="Quitar de la clase"
                    >
                      <UserMinus size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Button variant="outline" className="w-full mt-4" onClick={onClose}>Cerrar</Button>
      </div>
    </Modal>
  );
};
