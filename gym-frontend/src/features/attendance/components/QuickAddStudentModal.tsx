import React, { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientQuickRegistrationSchema } from '../../../types/schema.type.ts';
import type { GroupClass } from '../../../types';
import Button from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import type { z } from 'zod';

type ClientQuickRegistrationFormData = z.infer<typeof ClientQuickRegistrationSchema>;

interface QuickAddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: GroupClass[];
  onSave: (data: ClientQuickRegistrationFormData) => Promise<any>;
  translations: Record<string, string>;
}

export const QuickAddStudentModal: React.FC<QuickAddStudentModalProps> = ({
  isOpen,
  onClose,
  classes,
  onSave,
  translations,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientQuickRegistrationFormData>({
    resolver: zodResolver(ClientQuickRegistrationSchema) as Resolver<ClientQuickRegistrationFormData>,
    defaultValues: {
      name: '',
      lastName: '',
      dni: '',
      phone: '',
      email: '',
      activeClassId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        lastName: '',
        dni: '',
        phone: '',
        email: '',
        activeClassId: '',
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ClientQuickRegistrationFormData) => {
    try {
      await onSave(data);
      onClose();
    } catch (e) {
      // toast is already handled by hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registro Rápido de Alumno">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Nombre" 
            {...register('name')} 
            error={errors.name?.message} 
          />
          <Input 
            label="Apellido" 
            {...register('lastName')} 
            error={errors.lastName?.message} 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="DNI" 
            {...register('dni')} 
            error={errors.dni?.message} 
          />
          <Input 
            label="Teléfono" 
            {...register('phone')} 
            error={errors.phone?.message} 
          />
        </div>
        <Input 
          label="Email" 
          type="email" 
          {...register('email')} 
          error={errors.email?.message} 
        />
        
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Inscribir en Clase</label>
          <select 
            className="w-full p-2 border rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            {...register('activeClassId')}
          >
            <option value="">No inscribir a ninguna clase...</option>
            {classes.map((c: GroupClass) => (
              <option key={c.id} value={c.id}>
                {c.className} ({translations[c.dayOfWeek]} {c.startTime})
              </option>
            ))}
          </select>
          {errors.activeClassId && (
            <p className="text-red-500 text-xs mt-1">{errors.activeClassId.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-6">
          <Button variant="outline" type="button" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            Registrar Alumno
          </Button>
        </div>
      </form>
    </Modal>
  );
};
