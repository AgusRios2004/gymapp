import { z } from 'zod';

export const RoutineExerciseSchema = z.object({
    id: z.number().optional(),
    sets: z.number().min(1, 'Las series deben ser al menos 1').max(10, 'Las series no deben exceder 10'),
    repetitions: z.number().min(1, 'Las repeticiones deben ser al menos 1').max(50, 'Las repeticiones no deben exceder 50'),
    weight: z.float64().min(0, 'El peso no puede ser negativo').max(500, 'El peso no debe exceder 500'),
});

export const RoutineDaySchema = z.object({
    id: z.number().optional(),
    dayOfWeek: z.string().min(3, 'El día de la semana debe tener al menos 3 caracteres').max(10, 'El día de la semana no debe exceder los 10 caracteres'),
    routineExercises: z.array(RoutineExerciseSchema).optional(),
});

export const RoutineSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(7, 'El nombre debe tener al menos 7 caracteres').max(30, 'El nombre no debe exceder los 30 caracteres'),
    goal: z.string().min(10, 'El objetivo debe tener al menos 10 caracteres').max(50, 'El objetivo no debe exceder los 50 caracteres'),
    active: z.boolean().optional().default(true),
    routineDays: z.array(RoutineDaySchema).optional(),
});

export const ClientSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(4, 'El nombre debe tener al menos 4 caracteres'),
    lastName: z.string().min(4, 'El apellido debe tener al menos 4 caracteres'),
    phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
    dni: z.string().min(8, 'El DNI debe tener al menos 8 caracteres'),
    routineActiveId: z.number().optional().nullable(),
});