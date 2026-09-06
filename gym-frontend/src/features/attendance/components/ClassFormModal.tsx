import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GroupClassSchema } from '../../../types/schema.type.ts';
import type { GroupClass, Professor, Routine } from '../../../types';
import Button from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import type { z } from 'zod';

type GroupClassFormData = z.infer<typeof GroupClassSchema>;

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: GroupClass | null;
  professors: Professor[];
  routines: Routine[];
  onSave: (data: any) => Promise<any>;
  days: string[];
  translations: Record<string, string>;
}

export const ClassFormModal: React.FC<ClassFormModalProps> = ({
  isOpen,
  onClose,
  classData,
  professors,
  routines,
  onSave,
  days,
  translations,
}) => {
  const isEdit = !!classData;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GroupClassFormData>({
    resolver: zodResolver(GroupClassSchema) as Resolver<GroupClassFormData>,
    defaultValues: {
      className: '',
      dayOfWeek: 'MONDAY',
      capacity: 20,
      startTime: '10:00',
      endTime: '11:00',
      professorId: '',
      routineId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (classData) {
        reset({
          className: classData.className,
          dayOfWeek: classData.dayOfWeek,
          capacity: classData.capacity,
          startTime: classData.startTime,
          endTime: classData.endTime,
          professorId: String(classData.professor?.id || ''),
          routineId: classData.routine ? String(classData.routine.id) : '',
        });
      } else {
        reset({
          className: '',
          dayOfWeek: 'MONDAY',
          capacity: 20,
          startTime: '10:00',
          endTime: '11:00',
          professorId: '',
          routineId: '',
        });
      }
    }
  }, [isOpen, classData, reset]);

  const onSubmit = async (data: GroupClassFormData) => {
    try {
      const payload = {
        ...data,
        capacity: Number(data.capacity),
        routineId: data.routineId || null,
      };
      await onSave(payload);
      onClose();
    } catch (e) {
      // Errors handled by hook toasts
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? "Editar Clase" : "Programar Nueva Clase"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input 
          label="Nombre de la Clase" 
          {...register('className')} 
          error={errors.className?.message} 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Día</label>
            <select 
              className="w-full p-2 border rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              {...register('dayOfWeek')}
            >
              {days.map(day => (
                <option key={day} value={day}>{translations[day]}</option>
              ))}
            </select>
            {errors.dayOfWeek && (
              <p className="text-red-500 text-xs mt-1">{errors.dayOfWeek.message}</p>
            )}
          </div>
          <Input 
            label="Capacidad" 
            type="number" 
            {...register('capacity')} 
            error={errors.capacity?.message} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Hora Inicio" 
            type="time" 
            {...register('startTime')} 
            error={errors.startTime?.message} 
          />
          <Input 
            label="Hora Fin" 
            type="time" 
            {...register('endTime')} 
            error={errors.endTime?.message} 
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Profesor</label>
          <select 
            className="w-full p-2 border rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            {...register('professorId')}
          >
            <option value="">Seleccionar profesor...</option>
            {professors.map((p: Professor) => (
              <option key={p.id} value={p.id}>{p.name} {p.lastName}</option>
            ))}
          </select>
          {errors.professorId && (
            <p className="text-red-500 text-xs mt-1">{errors.professorId.message}</p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Rutina (Opcional)</label>
          <select 
            className="w-full p-2 border rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            {...register('routineId')}
          >
            <option value="">Sin rutina asignada</option>
            {routines.filter((r: any) => r.active).map((r: any) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {errors.routineId && (
            <p className="text-red-500 text-xs mt-1">{errors.routineId.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <Button variant="outline" type="button" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {isEdit ? "Guardar Cambios" : "Crear Clase"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
