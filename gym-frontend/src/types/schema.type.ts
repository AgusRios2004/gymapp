import { z } from 'zod';

export const MUSCLE_GROUPS = ["Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", "Glúteos", "Otros"] as const;

export const ExerciseSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    muscleGroup: z.enum(MUSCLE_GROUPS),
    description: z.string().optional(),
});

export const RoutineExerciseSchema = z.object({
    id: z.number().optional(),
    sets: z.number().min(1, 'Mínimo 1 serie').max(20),
    repetitions: z.number().min(1, 'Mínimo 1 repetición').max(100),
    weight: z.coerce.number().min(0).optional(),
});

export const RoutineDaySchema = z.object({
    id: z.number().optional(),
    dayOrder: z.number().int().min(1, 'El orden del día es requerido'), 
    routineExercises: z.array(RoutineExerciseSchema).optional(),
});

export const RoutineSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(3, 'Nombre muy corto').max(50),
    goal: z.string().min(5, 'Objetivo muy corto').max(100),
    active: z.boolean().optional().default(true),
    routineDays: z.array(RoutineDaySchema).optional(),
});

export const ClientSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    dni: z.string().min(1, "El DNI es requerido"),
    phone: z.string().min(1, "El teléfono es requerido"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    active: z.boolean().default(true),
});

export const AssignRoutineSchema = z.object({
    clientId: z.number(),
    routineTemplateId: z.number({ error: "Debes seleccionar una rutina" }),
    schedule: z.array(z.object({
        dayOrder: z.number(),
        assignedDay: z.string().min(1, "Debes asignar un día de la semana"),
    })).min(1, "La rutina debe tener días asignados")
});