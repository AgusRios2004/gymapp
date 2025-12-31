import { useState } from 'react';
import { Plus, Search, Dumbbell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import CreateExerciseModal from '../components/exercises/CreateExerciseModal';
import { getExercises, createExercise, type ExerciseFormData, type Exercise } from '../services/exerciseService';
import { toast } from 'react-toastify';

export default function ExercisesPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: exercises = [], isLoading, isError } = useQuery({
        queryKey: ['exercises'],
        queryFn: getExercises
    });

    const createMutation = useMutation({
        mutationFn: createExercise,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
            toast.success("✅ Ejercicio creado correctamente");
            setIsModalOpen(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error("Error al crear el ejercicio");
        }
    });

    const handleSave = (data: ExerciseFormData) => {
        createMutation.mutate(data);
    };

    const filteredExercises = exercises.filter((ex: Exercise) => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Inventario de Ejercicios</h1>
                    <p className="text-gray-500 text-sm">Gestiona los ejercicios disponibles para las rutinas</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    size="lg"
                    className="w-full sm:w-auto rounded-2xl shadow-lg shadow-blue-600/30 active:scale-95 gap-2"
                >
                    <Plus size={20} />
                    <span className="font-medium">Nuevo Ejercicio</span>
                </Button>
            </div>

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre o grupo muscular..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                />
            </div>

            {/* Lista de Ejercicios */}
            {isLoading && <p className="text-center text-gray-500 py-8">Cargando ejercicios...</p>}
            {isError && <p className="text-center text-red-500 py-8">Error al cargar los ejercicios.</p>}
            
            {!isLoading && !isError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredExercises.map((exercise: Exercise) => (
                        <div key={exercise.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Dumbbell size={20} />
                                </div>
                                <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                                    {exercise.muscleGroup}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">{exercise.name}</h3>
                            {exercise.description && (
                                <p className="text-sm text-gray-500 line-clamp-2">{exercise.description}</p>
                            )}
                        </div>
                    ))}
                    {filteredExercises.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            No se encontraron ejercicios.
                        </div>
                    )}
                </div>
            )}

            <CreateExerciseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isLoading={createMutation.isPending}
            />
        </div>
    );
}