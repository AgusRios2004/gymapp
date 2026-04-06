import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Trash2, User as UserIcon, Users, UserMinus, UserPlus, CalendarDays, UserCheck } from 'lucide-react';
import { getProfessors } from '../services/professorService';
import { getClasses, createClass, deleteClass, getStudentsByClass, unassignClass, assignClass } from '../services/classService';
import { createClient, getClients } from '../services/clientService';
import { registerAssistance, getAssistanceByDate } from '../services/assistanceService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import type { GroupClass, Professor, Client, Assistance } from '../types';
import { AxiosError } from 'axios';
import type { ApiResponse } from '../types/api.types';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TRANSLATIONS: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles", 
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado"
};

export default function ClassesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<number | null>(null);
  const [selectedClientToAssign, setSelectedClientToAssign] = useState<string>('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<number | null>(null);
  const [form, setForm] = useState({
    className: '',
    professorId: '',
    dayOfWeek: 'MONDAY',
    startTime: '10:00',
    endTime: '11:00',
    capacity: '20'
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    activeClassId: ''
  });

  const { data: classes = [] } = useQuery<GroupClass[]>({
    queryKey: ['classes'],
    queryFn: async () => {
       const data = await getClasses();
       return Array.isArray(data) ? data : [];
    }
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['professors', 'active'],
    queryFn: () => getProfessors(true)
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients', 'active'],
    queryFn: () => getClients(true)
  });

  const { data: studentsInClass = [], isLoading: isLoadingStudents } = useQuery<Client[]>({
    queryKey: ['class-students', selectedClassForStudents],
    queryFn: () => selectedClassForStudents ? getStudentsByClass(selectedClassForStudents) : Promise.resolve([]),
    enabled: !!selectedClassForStudents
  });

  const { data: assistanceToday = [] } = useQuery<Assistance[]>({
    queryKey: ['assistance', today],
    queryFn: () => getAssistanceByDate(today)
  });

  const createMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success("📅 Clase creada");
      setIsModalOpen(false);
      setForm({
         className: '',
         professorId: '',
         dayOfWeek: 'MONDAY',
         startTime: '10:00',
         endTime: '11:00',
         capacity: '20'
      });
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const message = error.response?.data?.message || "No se pudo crear la clase";
      toast.error(`❌ ${message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success("🗑️ Clase eliminada");
    }
  });

  const assignMutation = useMutation({
    mutationFn: (data: { clientId: number, classId: number }) => assignClass(data.clientId, data.classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class-students'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success("✅ Alumno inscrito correctamente");
      setSelectedClassForAssign(null);
      setSelectedClientToAssign('');
    },
    onError: () => toast.error("❌ Error al inscribir alumno")
  });

  const unassignMutation = useMutation({
    mutationFn: unassignClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', selectedClassForStudents] });
      toast.success("👤 Alumno quitado de la clase");
    },
    onError: () => toast.error("❌ Error al quitar alumno")
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: typeof clientForm) => {
        const { activeClassId, ...clientData } = data;
        const newClient = await createClient({...clientData, active: true});
        if (activeClassId) {
            await assignClass(newClient.id, Number(activeClassId));
        }
        return newClient;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['classes'] });
        queryClient.invalidateQueries({ queryKey: ['clients'] });
        toast.success("👤 Alumno creado e inscrito");
        setIsClientModalOpen(false);
        setClientForm({ name: '', lastName: '', dni: '', phone: '', email: '', activeClassId: '' });
    },
    onError: () => toast.error("❌ Error al crear alumno")
  });

  const assistanceMutation = useMutation({
    mutationFn: (clientId: number) => {
        const now = new Date();
        const inputHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return registerAssistance({
            idClient: clientId,
            idProfessor: user?.id || 0,
            date: today,
            inputHour: inputHour
        });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['assistance', today] });
        toast.success("✅ Asistencia registrada");
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const message = (error.response?.data?.message as string) || "Error al registrar asistencia";
      toast.error(message);
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Clases</h1>
          <p className="text-gray-500">Horarios y cupos de clases grupales</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsClientModalOpen(true)} className="flex-1 sm:flex-none gap-2 rounded-2xl">
            <UserPlus size={20} /> Nuevo Alumno
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none gap-2 rounded-2xl">
            <Plus size={20} /> Nueva Clase
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DAYS.map(day => (
          <div key={day} className="flex flex-col h-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4 border-b border-blue-700">
               <h3 className="text-white font-black text-xl uppercase tracking-wider">{TRANSLATIONS[day]}</h3>
            </div>
            
            <div className="space-y-6 flex-1 p-5">
               {classes.filter((c: GroupClass) => c.dayOfWeek === day).length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <CalendarDays size={48} className="text-gray-400 mb-2" />
                    <p className="text-sm italic">Sin clases programadas</p>
                 </div>
               ) : (
                 classes.filter((c: GroupClass) => c.dayOfWeek === day).map((c: GroupClass) => (
                    <div key={c.id} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                       <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h4 className="text-xl font-black text-gray-900 leading-tight">{c.className}</h4>
                            <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full w-fit">
                               <Clock size={16} />
                               <span className="text-sm">{c.startTime} - {c.endTime}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => { if(confirm("¿Eliminar clase?")) deleteMutation.mutate(c.id) }} 
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>

                       <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-gray-600">
                             <div className="bg-white p-2 rounded-xl shadow-sm">
                                <UserIcon size={18} className="text-gray-500" />
                             </div>
                             <div>
                                <p className="text-[10px] uppercase font-bold text-gray-400">Profesor</p>
                                <p className="text-sm font-bold text-gray-700">{c.professor?.name} {c.professor?.lastName}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                             <div className="flex items-center gap-2 text-emerald-700">
                                <Users size={18} />
                                <span className="text-sm font-black uppercase">Capacidad</span>
                             </div>
                             <span className="text-lg font-black text-emerald-600">{c.capacity}</span>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => setSelectedClassForStudents(c.id)}
                            className="rounded-xl py-3 font-bold flex gap-2"
                          >
                            <Users size={16} /> Alumnos
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => setSelectedClassForAssign(c.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-bold flex gap-2 border-none"
                          >
                            <UserPlus size={16} /> Inscribir
                          </Button>
                       </div>
                    </div>
                  ))
                )}
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={!!selectedClassForStudents} 
        onClose={() => setSelectedClassForStudents(null)} 
        title={`Alumnos Inscritos`}
      >
        <div className="space-y-4">
          {isLoadingStudents ? (
            <p className="text-center py-4">Cargando...</p>
          ) : studentsInClass.length === 0 ? (
            <p className="text-center py-4 text-gray-500 italic">No hay alumnos inscritos</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {studentsInClass.map((student: Client) => (
                <div key={student.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className={`font-medium ${student.isDebtor ? 'text-red-500' : 'text-gray-900'}`}>
                      {student.name} {student.lastName}
                      {student.isDebtor && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Deuda</span>}
                    </p>
                    <p className="text-xs text-gray-500">{student.dni}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => assistanceMutation.mutate(student.id)}
                      disabled={assistanceToday.some(a => a.idClient === student.id)}
                      className={`p-2 transition-colors ${assistanceToday.some(a => a.idClient === student.id) 
                        ? 'text-green-600 bg-green-100 rounded-full' 
                        : 'text-green-500 hover:scale-110'}`}
                      title={assistanceToday.some(a => a.idClient === student.id) ? "Asistencia tomada" : "Marcar asistencia"}
                    >
                      <UserCheck size={22} strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={() => { if(confirm("¿Quitar alumno de la clase?")) unassignMutation.mutate(student.id) }}
                      className="p-2 text-red-500 hover:text-red-700 hover:scale-110 transition-all font-bold"
                      title="Quitar de la clase"
                    >
                      <UserMinus size={22} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedClassForStudents(null)}>Cerrar</Button>
        </div>
      </Modal>

      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Registro Rápido de Alumno">
          <form onSubmit={(e) => {
              e.preventDefault();
              createClientMutation.mutate(clientForm);
          }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <Input label="Nombre" required value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
                  <Input label="Apellido" required value={clientForm.lastName} onChange={e => setClientForm({...clientForm, lastName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <Input label="DNI" required value={clientForm.dni} onChange={e => setClientForm({...clientForm, dni: e.target.value})} />
                  <Input label="Teléfono" required value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} />
              </div>
              <Input label="Email" type="email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email: e.target.value})} />
              
              <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Inscribir en Clase</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    value={clientForm.activeClassId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClientForm({...clientForm, activeClassId: e.target.value})}
                  >
                    <option value="">No inscribir a ninguna clase...</option>
                    {classes.map((c: GroupClass) => <option key={c.id} value={c.id}>{c.className} ({TRANSLATIONS[c.dayOfWeek]} {c.startTime})</option>)}
                  </select>
              </div>

              <div className="flex gap-3 pt-6">
                  <Button variant="outline" type="button" className="flex-1" onClick={() => setIsClientModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="flex-1" isLoading={createClientMutation.isPending}>Registrar Alumno</Button>
              </div>
          </form>
      </Modal>

      <Modal 
        isOpen={!!selectedClassForAssign} 
        onClose={() => { setSelectedClassForAssign(null); setSelectedClientToAssign(''); }} 
        title="Inscribir Alumno Existente"
      >
        <div className="space-y-4">
          <Input 
            label="Buscar por Nombre o DNI" 
            placeholder="Ej: Juan Perez..." 
            value={clientSearchTerm} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientSearchTerm(e.target.value)} 
          />
          
          <div className="max-h-60 overflow-y-auto border rounded-xl divide-y">
            {clients
              .filter((c: Client) => 
                c.activeClassId !== selectedClassForAssign && 
                `${c.name} ${c.lastName} ${c.dni}`.toLowerCase().includes(clientSearchTerm.toLowerCase())
              )
              .slice(0, 10) // Limit to 10 for performance
              .map((c: Client) => (
                <div 
                  key={c.id} 
                  className={`p-3 cursor-pointer transition-colors flex justify-between items-center ${selectedClientToAssign === String(c.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                  onClick={() => setSelectedClientToAssign(String(c.id))}
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">{c.name} {c.lastName}</p>
                    <p className="text-xs text-gray-500">{c.dni}</p>
                  </div>
                  {selectedClientToAssign === String(c.id) && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                </div>
              ))}
          </div>

          <div className="flex gap-3 pt-4">
             <Button variant="outline" className="flex-1" onClick={() => setSelectedClassForAssign(null)}>Cancelar</Button>
             <Button 
               className="flex-1" 
               disabled={!selectedClientToAssign} 
               onClick={() => assignMutation.mutate({ clientId: Number(selectedClientToAssign), classId: selectedClassForAssign! })}
               isLoading={assignMutation.isPending}
             >
               Confirmar Inscripción
             </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Programar Nueva Clase">
         <form onSubmit={(e) => { 
           e.preventDefault(); 
           createMutation.mutate({
             ...form,
             capacity: Number(form.capacity)
           }); 
         }} className="space-y-4">
            <Input label="Nombre de la Clase" required value={form.className} onChange={e => setForm({...form, className: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Día</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    value={form.dayOfWeek}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, dayOfWeek: e.target.value})}
                  >
                    {DAYS.map(day => <option key={day} value={day}>{TRANSLATIONS[day]}</option>)}
                  </select>
               </div>
               <Input label="Capacidad" type="number" required value={form.capacity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, capacity: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Input label="Hora Inicio" type="time" required value={form.startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, startTime: e.target.value})} />
               <Input label="Hora Fin" type="time" required value={form.endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, endTime: e.target.value})} />
            </div>

            <div>
               <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Profesor</label>
               <select 
                 className="w-full p-2 border rounded-lg bg-gray-50"
                 required
                 value={form.professorId}
                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, professorId: e.target.value})}
               >
                 <option value="">Seleccionar profesor...</option>
                 {professors.map((p: Professor) => <option key={p.id} value={p.id}>{p.name} {p.lastName}</option>)}
               </select>
            </div>

            <div className="flex gap-3 pt-6">
               <Button variant="outline" type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
               <Button type="submit" className="flex-1" isLoading={createMutation.isPending}>Crear Clase</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}
