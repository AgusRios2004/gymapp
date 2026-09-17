import { useMemo, useState } from 'react';
import { Plus, Search, Dumbbell } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import CreateExerciseModal from '../components/exercises/CreateExerciseModal';
import { getExercises, createExercise, type ExerciseFormData, type Exercise } from '../services/exerciseService';
import { MUSCLE_GROUPS } from '../types/schema.type';
import { toast } from 'react-toastify';

const groupByMuscleGroup = (exercises: Exercise[]): [string, Exercise[]][] => {
    const byGroup = new Map<string, Exercise[]>();
    exercises.forEach((exercise) => {
        const group = byGroup.get(exercise.muscleGroup) ?? [];
        group.push(exercise);
        byGroup.set(exercise.muscleGroup, group);
    });

    // Orden fijo según MUSCLE_GROUPS; grupos legacy que no estén en la lista van al final.
    const orderedGroups = [...MUSCLE_GROUPS, ...[...byGroup.keys()].filter((g) => !(MUSCLE_GROUPS as readonly string[]).includes(g))];

    return orderedGroups
        .filter((group) => byGroup.has(group))
        .map((group) => [group, byGroup.get(group)!]);
};

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

    const filteredExercises = useMemo(() => exercises.filter((ex: Exercise) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase())
    ), [exercises, searchTerm]);

    const groupedExercises = useMemo(() => groupByMuscleGroup(filteredExercises), [filteredExercises]);

    return (
        <div className="space-y-6 pb-20">
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
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-28 w-full" shape="card" />
                    ))}
                </div>
            )}
            {isError && (
                <EmptyState
                    variant="error"
                    title="No pudimos cargar los ejercicios"
                    description="Volvé a intentarlo en unos segundos."
                />
            )}

            {!isLoading && !isError && (
                filteredExercises.length === 0 ? (
                    <EmptyState
                        icon={<Dumbbell size={24} />}
                        title="No se encontraron ejercicios"
                        description={searchTerm ? 'Probá con otro nombre o grupo muscular.' : 'Creá el primero para empezar a armar rutinas.'}
                    />
                ) : (
                    <div className="space-y-8">
                        {groupedExercises.map(([muscleGroup, groupExercises]) => (
                            <div key={muscleGroup} className="space-y-4">
                                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 border-l-4 border-emerald-600 pl-3 flex items-center gap-2">
                                    {muscleGroup}
                                    <span className="text-xs font-semibold text-slate-400 normal-case tracking-normal">
                                        {groupExercises.length} {groupExercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {groupExercises.map((exercise) => (
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
                                </div>
                            </div>
                        ))}
                    </div>
                )
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