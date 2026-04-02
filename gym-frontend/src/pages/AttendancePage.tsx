import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserCheck, 
  Search, 
  Clock, 
  CheckCircle2, 
  Users,
  CalendarDays,
  AlertCircle
} from 'lucide-react';
import { getClients } from '../services/clientService';
import { registerAssistance, getAssistanceByDate } from '../services/assistanceService';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import type { Client, Assistance } from '../types';

export default function AttendancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Queries
  const { data: clients = [], isLoading: loadingClients } = useQuery<Client[]>({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true)
  });

  const { data: todayAssistance = [], isLoading: loadingAssistance } = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: registerAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistance', today] });
      toast.success("¡Ingreso registrado con éxito!", {
        position: "top-center"
      });
      setSearchTerm('');
    },
    onError: (error: Error | any) => {
        const message = error.response?.data?.message || "Error al registrar asistencia";
        toast.error(message);
    }
  });

  const handleCheckIn = (clientId: number) => {
    if (!user) return;

    const now = new Date();
    const inputHour = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    mutation.mutate({
      idClient: clientId,
      idProfessor: user.id,
      date: today,
      inputHour
    });
  };

  const filteredClients = searchTerm.trim().length > 0 
    ? clients.filter((c: Client) => 
        `${c.name} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dni.includes(searchTerm)
      ).slice(0, 6)
    : [];

  const isAlreadyCheckedIn = (clientId: number) => {
    return todayAssistance.some((a: Assistance) => a.idClient === clientId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in transition-all duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <UserCheck size={16} />
            <span>Gestión de Accesos</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Registro de Asistencia</h1>
          <p className="text-gray-500 max-w-md">Controla y valida el ingreso de alumnos al gimnasio en tiempo real.</p>
        </div>

        {/* Stats Grid Header */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex-1 lg:min-w-[160px] bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hoy es</span>
                <span className="font-bold text-gray-900 capitalize">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
            </div>
            <div className="flex-1 lg:min-w-[160px] bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200 flex flex-col items-center justify-center text-center text-white">
                <span className="text-[10px] font-bold text-blue-100 uppercase mb-1">Ingresos Hoy</span>
                <span className="text-2xl font-black">{todayAssistance.length}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Search & Interaction (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`bg-white p-8 rounded-[2rem] border transition-all duration-300 shadow-xl ${isFocused ? 'border-blue-400 ring-4 ring-blue-50' : 'border-gray-100 shadow-gray-200/50'}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Search size={22} />
              </span>
              Validar Acceso
            </h3>

            <div className="space-y-6 relative">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="DNI o Nombre del alumno..." 
                  value={searchTerm}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-lg font-bold text-gray-950 placeholder:text-gray-400 shadow-inner"
                />
                
                {/* Search Indicator */}
                {!searchTerm && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                         <span className="text-xs font-bold border-2 border-gray-200 rounded-lg px-2 py-1 text-gray-400">Ctrl + K</span>
                    </div>
                )}
              </div>

              {/* Instant Suggestions */}
              <div className="space-y-2 mt-4 min-h-[300px]">
                {searchTerm.trim().length > 0 ? (
                    filteredClients.length > 0 ? (
                        filteredClients.map((c: Client) => {
                            const checked = isAlreadyCheckedIn(c.id);
                            return (
                                <button
                                    key={c.id}
                                    disabled={checked || mutation.isPending}
                                    onClick={() => handleCheckIn(c.id)}
                                    className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all border-2 ${
                                        checked 
                                        ? 'bg-gray-50 border-gray-100 cursor-default grayscale opacity-60' 
                                        : 'bg-white border-transparent hover:border-blue-100 hover:bg-blue-50/50 active:scale-95'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${checked ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'}`}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-900">{c.name} {c.lastName}</p>
                                            <p className="text-xs text-gray-500 font-medium">DNI: {c.dni}</p>
                                        </div>
                                    </div>

                                    {checked ? (
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                            <CheckCircle2 size={16} />
                                            Adentro
                                        </div>
                                    ) : (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200">
                                            REGISTRAR
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400">
                            <AlertCircle size={40} className="mb-2 opacity-20" />
                            <p className="text-sm font-medium">No se encontró ningún alumno</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-50">Prueba con otro DNI o nombre</p>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center opacity-60 grayscale">
                        <Users size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-400 text-sm italic">Comienza a escribir para ver resultados</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Context Info Card */}
          <div className="bg-gray-900 p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 flex justify-between items-center">
                <div>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Registrado por</h4>
                    <p className="text-xl font-bold">{user?.name} {user?.lastName}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-white/60 uppercase">Sistema en línea</span>
                    </div>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle2 size={32} />
                </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-30"></div>
          </div>
        </div>

        {/* Right: Activity Log (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                    <Clock size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Actividad Reciente</h3>
                    <p className="text-sm text-gray-500">Últimos ingresos del día</p>
                 </div>
              </div>
              
              {(loadingAssistance || loadingClients) && (
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full animate-pulse capitalize">
                      Cargando actualizaciones...
                  </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {todayAssistance.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                   <div className="relative">
                      <div className="absolute -inset-4 bg-gray-50 rounded-full blur-xl border-2 border-dashed border-gray-100"></div>
                      <CalendarDays className="relative mx-auto text-gray-300" size={64} />
                   </div>
                   <div>
                      <p className="text-gray-500 font-bold text-lg uppercase tracking-wider">Sin movimientos hoy</p>
                      <p className="text-sm text-gray-400">Los ingresos registrados aparecerán aquí automáticamente.</p>
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...todayAssistance].reverse().map((a: Assistance, idx: number) => (
                    <div 
                      key={idx} 
                      className="group p-5 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 hover:shadow-md transition-all duration-300 flex items-center gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-green-100 rounded-full p-1">
                            <CheckCircle2 size={12} className="text-green-600" />
                         </div>
                      </div>

                      <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-900 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100 group-hover:border-transparent">
                         {a.clientName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">{a.clientName}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                <Clock size={10} />
                                {a.inputHour}
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                {a.professorName || 'Sistema'}
                            </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {todayAssistance.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-center">
                    <button className="text-[10px] font-bold text-gray-300 hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-2">
                        Ver registro histórico completo <Search size={10} />
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
