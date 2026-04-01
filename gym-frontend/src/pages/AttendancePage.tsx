import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserCheck, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Users,
  CalendarDays
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
  const today = new Date().toISOString().split('T')[0];

  // Queries
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true)
  });


  const { data: todayAssistance = [] } = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  // Mutation
  const mutation = useMutation({
    mutationFn: registerAssistance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistance', today] });
      toast.success("✅ Asistencia registrada");
      setSearchTerm('');
    },
    onError: () => toast.error("❌ Error al registrar asistencia")
  });

  const handleCheckIn = (clientId: number) => {
    if (!user) return;

    // Hora actual en formato HH:mm
    const now = new Date();
    const inputHour = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    mutation.mutate({
      idClient: clientId,
      idProfessor: user.id,
      date: today,
      inputHour
    });
  };

  const filteredClients = clients.filter((c: Client) => 
    `${c.name} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dni.includes(searchTerm)
  ).slice(0, 5); // Limit suggestions

  const isAlreadyCheckedIn = (clientId: number) => {
    return todayAssistance.some((a: Assistance) => a.idClient === clientId);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Accesos</h1>
          <p className="text-gray-500">Registra el ingreso de los alumnos al centro deportivo</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <CalendarDays className="text-blue-500" size={20} />
           <span className="font-bold text-gray-700">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Check-in */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="text-blue-500" size={24} />
              Registrar Entrada
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Usuario Activo</p>
                <p className="text-gray-900 font-bold">{user?.name} {user?.lastName}</p>
                <p className="text-[10px] text-blue-500 font-medium uppercase">{user?.role === 'ADMIN' ? 'Administrador' : 'Profesor'}</p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Alumno (DNI o Nombre)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Escribe para buscar..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 shadow-inner"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {searchTerm && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                    {filteredClients.map((c: Client) => {
                      const checked = isAlreadyCheckedIn(c.id);
                      return (
                        <button
                          key={c.id}
                          disabled={checked}
                          onClick={() => handleCheckIn(c.id)}
                          className={`w-full flex items-center justify-between p-4 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0 ${checked ? 'opacity-50 grayscale' : ''}`}
                        >
                          <div>
                            <p className="font-bold text-gray-900">{c.name} {c.lastName}</p>
                            <p className="text-xs text-gray-500">DNI: {c.dni}</p>
                          </div>
                          {checked ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                              <MapPin size={18} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
             <h4 className="text-lg font-bold mb-2">Estatisticas Hoy</h4>
             <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                   <span className="text-white/80">Total Ingresos</span>
                   <span className="text-2xl font-bold">{todayAssistance.length}</span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                   <span className="text-white/80">Ocupación Reciente</span>
                   <span className="text-sm">{(todayAssistance.length > 0) ? "Alta" : "Baja"}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Lista de Registrados */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-amber-500" size={24} />
              Alumnos en el gimnasio hoy
            </h3>
            <span className="text-sm font-medium text-gray-400">{todayAssistance.length} registros</span>
          </div>

          <div className="space-y-4">
            {todayAssistance.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                 <Clock className="mx-auto text-gray-300 mb-4" size={48} />
                 <p className="text-gray-500 font-medium">Aún no hay ingresos registrados hoy</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayAssistance.map((a: Assistance, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                       {a.clientName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{a.clientName}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {a.inputHour} hs • {a.professorName || 'Admin'}
                      </p>
                    </div>
                    <CheckCircle2 className="text-green-500" size={20} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
