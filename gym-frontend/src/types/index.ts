export interface Person {
    id: number;
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    email?: string;
}

export interface Client extends Person {
    active: boolean;
    routineActive?: Routine | null; // El JSON muestra que puede ser null
    // routines?: Routine[]; // El DTO 'ClientResponseDTO' NO devuelve la lista de rutinas, así que lo quitamos o dejamos opcional
}

export interface Routine {
    id: number;
    name: string;
    goal: string;
    active: boolean;
}

export interface MonthlyType {
    id: number;
    type: string;
    price: number;
    durationDays: number;
}

export interface Payment {
    id: number;
    date: string;
    amount: number;
    paymentType: string;
    monthlyType?: MonthlyType;
    expirationDate?: string; // Campo calculado en el backend
}