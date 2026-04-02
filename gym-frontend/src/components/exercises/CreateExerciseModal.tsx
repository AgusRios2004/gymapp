import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ExerciseSchema, MUSCLE_GROUPS } from '../../types/schema.type';

type ExerciseFormData = z.infer<typeof ExerciseSchema>;

interface CreateExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ExerciseFormData) => void;
    isLoading?: boolean;
}

const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({ isOpen, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState<ExerciseFormData>({
        name: '',
        muscleGroup: 'Pecho', // Valor por defecto seguro
        description: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', muscleGroup: 'Pecho', description: '' });
            setErrors({});
            // UX: Focus automático al abrir
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = () => {
        const result = ExerciseSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            return;
        }
        onSave(result.data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Ejercicio">
            <div className="space-y-4">
                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                        ref={nameInputRef}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Ej: Sentadilla Búlgara"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Grupo Muscular */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grupo Muscular</label>
                    <select
                        name="muscleGroup"
                        value={formData.muscleGroup}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        {MUSCLE_GROUPS.map(group => (
                            <option key={group} value={group}>{group}</option>
                        ))}
                    </select>
                    {errors.muscleGroup && <p className="text-xs text-red-500 mt-1">{errors.muscleGroup}</p>}
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(Opcional)</span></label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        placeholder="Breve explicación técnica..."
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Ejercicio'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateExerciseModal;