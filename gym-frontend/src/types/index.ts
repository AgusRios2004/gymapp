export interface Person {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    email?: string;
}

export interface Professor extends Person {
    active: boolean;
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
    isDebtor?: boolean;
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
    idProfessor: number;
    idMonthlyType: number;
    date: string;
}

export interface ProductDetailRequest {
    idProduct: number;
    quantity: number;
}

export interface ProductPaymentRequest {
    idClient: number;
    idProfessor: number;
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
}

export interface GroupClass {
    id: number;
    className: string;
    professor: Professor;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    capacity: number;
}