export interface Person {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    email?: string;
}

export interface RoutineExercise {
    id?: number;
    exerciseId?: number;
    sets: number;
    repetitions: number;
    weight?: number;
    exerciseName?: string;
}

export interface RoutineDay {
    id?: number;
    dayOrder: number;
    routineExercises: RoutineExercise[];
}

export interface Routine {
    id: number;
    name: string;
    goal: string;
    active: boolean;
    isTemplate?: boolean;
    days?: RoutineDay[];
}

export interface Client extends Person {
    active: boolean;
    activeRoutineId?: number | null; 
}

export interface ClientScheduleMap {
    dayOrder: number;
    assignedDay: string;
}

export interface AssignRoutineRequest {
    clientId: number;
    routineTemplateId: number;
    schedule: ClientScheduleMap[];
}