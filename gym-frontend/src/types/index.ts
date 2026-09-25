export interface Person {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    email?: string;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

export interface Professor extends Person {
    active: boolean;
}

export type ExerciseType = 'FUERZA_PESAS' | 'CARDIO_LISS' | 'CARDIO_HIIT' | 'ABDOMINALES' | 'FLEXIBILIDAD';

export interface Exercise {
    id: number;
    name: string;
    description?: string;
    muscleGroup?: string;
    type?: ExerciseType;
}

export interface RoutineExercise {
    id?: number;
    exerciseId?: number;
    sets: number;
    repetitions: number;
    weight?: number;
    exerciseName?: string;
    durationMinutes?: number;
    cardioIntensity?: string;
    isLissCardio?: boolean;
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
    isDebtor?: boolean;
    activeRoutineId?: number | null;
    routineActive?: { id: number; name: string; goal: string } | null;
    activeClassId?: number | null;
    activeClassName?: string | null;
    height?: number | null;
    targetWeight?: number | null;
    targetFatPercentage?: number | null;
    targetMuscleMass?: number | null;
    primaryGoal?: string | null;
    bmi?: number | null;
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

export interface MonthlyType {
    id: number;
    type: string;
    price: number;
    durationDays: number;
}

export interface Product {
    id: number;
    productName: string;
    price: number;
    stock: number;
    administratorId?: number;
}

export interface Payment {
    id: number;
    amount: number;
    date: string;
    paymentType: 'MONTHLY' | 'PRODUCTS';
    clientName?: string;
    professorName?: string;
    monthlyTypeName?: string;
    paymentProducts?: {
        productName: string;
        quantity: number;
    }[];
}

export interface MonthlyPaymentRequest {
    idClient: number;
    idProfessor?: number;
    idMonthlyType: number;
    date: string;
}

export interface ProductDetailRequest {
    idProduct: number;
    quantity: number;
}

export interface ProductPaymentRequest {
    idClient: number;
    idProfessor?: number;
    products: ProductDetailRequest[];
    date: string;
}

export interface DashboardStats {
    totalClients: number;
    activeClients: number;
    totalProfessors: number;
    totalRoutines: number;
    monthlyRevenue: number;
    lowStockCount: number;
    debtorsCount: number;
}

export interface Assistance {
    idClient: number;
    clientName: string;
    idProfessor: number;
    professorName: string;
    date: string;
    inputHour: string;
}

export interface ProductPurchased {
    nameProduct: string;
    date: string;
    price: number;
    quantity: number;
}

export interface PhysicalRecord {
    id: number;
    clientId: number;
    date: string;
    weight: number;
    height?: number;
    bmi?: number;
    muscleMass: number;
    fatPercentage: number;
    notes?: string;
}

export interface User {
    id: number;
    name: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'PROFESSOR';
    token: string;
}

export interface GroupClass {
    id: number;
    className: string;
    professor: Professor;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    capacity: number;
    routine?: Routine;
}

export interface ExerciseLog {
    id?: number;
    client?: Client;
    clientId?: number;
    exercise?: { id: number; name: string };
    exerciseId?: number;
    date?: string;
    weight?: number;
    repsAchieved?: number;
    setsAchieved?: number;
    timeInSeconds?: number;
    isLissCardio?: boolean;
    notes?: string;
}

export interface NutritionPlan {
    id?: number;
    clientId?: number;
    name: string;
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    guidelines?: string;
    active?: boolean;
}

export interface MealLog {
    id?: number;
    clientId?: number;
    date?: string;
    mealType: 'DESAYUNO' | 'ALMUERZO' | 'MERIENDA' | 'CENA' | 'SNACK';
    description: string;
    calories?: number;
    proteinGrams?: number;
    healthySnackReplaced?: boolean;
}

export interface SupplementLog {
    id?: number;
    clientId?: number;
    date: string;
    creatineTaken: boolean;
    proteinTaken: boolean;
    notes?: string;
}

export interface WaterLog {
    id?: number;
    clientId?: number;
    date: string;
    milliliters: number;
    targetMilliliters: number;
    notes?: string;
}