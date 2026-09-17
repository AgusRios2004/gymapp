import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Trash2, Edit, User as UserIcon, Users, UserMinus, UserPlus, CalendarDays, UserCheck } from 'lucide-react';
import { getProfessors } from '../services/professorService';
import { getClasses, createClass, deleteClass, updateClass, getStudentsByClass, unassignClass, assignClass } from '../services/classService';
import { getRoutines } from '../services/routineService';
import { createClient, getAllClientsList } from '../services/clientService';
import { registerAssistance, getAssistanceByDate } from '../services/assistanceService';
import { toast } from 'react-toastify';
import type { GroupClass, Professor, Client, Assistance, Routine } from '../types';
import { AxiosError } from 'axios';
import type { ApiResponse } from '../types/api.types';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { SearchableSelect } from '../components/ui/SearchableSelect';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TRANSLATIONS: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado"
};

// Color fijo por día (no semántico, solo para escanear el calendario de un vistazo).
const DAY_STYLES: Record<string, { header: string; pill: string }> = {
  MONDAY: { header: 'bg-blue-600', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
  TUESDAY: { header: 'bg-violet-600', pill: 'bg-violet-50 text-violet-700 border-violet-200' },
  WEDNESDAY: { header: 'bg-orange-600', pill: 'bg-orange-50 text-orange-700 border-orange-200' },
  THURSDAY: { header: 'bg-teal-600', pill: 'bg-teal-50 text-teal-700 border-teal-200' },
  FRIDAY: { header: 'bg-rose-600', pill: 'bg-rose-50 text-rose-700 border-rose-200' },
  SATURDAY: { header: 'bg-indigo-600', pill: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<number | null>(null);
  const [selectedClientToAssign, setSelectedClientToAssign] = useState<string>('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<number | null>(null);
  const [form, setForm] = useState({
    className: '',
    professorId: '',
    routineId: '',
    daysOfWeek: [] as string[],
    startTime: '10:00',
    endTime: '11:00',
    capacity: '20'
  });

  const toggleFormDay = (day: string) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day) ? f.daysOfWeek.filter(d => d !== day) : [...f.daysOfWeek, day]
    }));
  };

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

  const { data: routines = [] } = useQuery({
    queryKey: ['routines'],
    queryFn: getRoutines
  });

  const { data: professors = [] } = useQuery({
    queryKey: ['professors', 'active'],
    queryFn: () => getProfessors(true)
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients', 'active'],
    queryFn: () => getAllClientsList(true)
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
         routineId: '',
         daysOfWeek: [],
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

  const updateMutation = useMutation({
    mutationFn: (data: { id: number, form: Parameters<typeof updateClass>[1] }) => updateClass(data.id, data.form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success("📝 Clase actualizada");
      setIsEditModalOpen(false);
      setEditingClassId(null);
      setForm({
         className: '',
         professorId: '',
         routineId: '',
         daysOfWeek: [],
         startTime: '10:00',
         endTime: '11:00',
         capacity: '20'
      });
    },
    onError: () => toast.error("❌ Error al actualizar la clase")
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
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const message = error.response?.data?.message || "Error al crear alumno";
      toast.error(`❌ ${message}`);
    }
  });

  const assistanceMutation = useMutation({
    mutationFn: (clientId: number) => {
        const now = new Date();
        const inputHour = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return registerAssistance({
            idClient: clientId,
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
    <div className="space-y-8 animate-in fade-in duration-500">
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
            <div className={`${DAY_STYLES[day].header} px-6 py-4`}>
               <h3 className="text-white font-black text-xl uppercase tracking-wider">{TRANSLATIONS[day]}</h3>
            </div>

            <div className="space-y-3 flex-1 p-4">
               {classes.filter((c: GroupClass) => c.daysOfWeek.includes(day)).length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 opacity-30">
                    <CalendarDays size={48} className="text-gray-400 mb-2" />
                    <p className="text-sm italic">Sin clases programadas</p>
                 </div>
               ) : (
                 classes.filter((c: GroupClass) => c.daysOfWeek.includes(day)).map((c: GroupClass) => {
                    const assignedStudentsCount = clients.filter((client: Client) => client.activeClassId === c.id).length;
                    const isFull = assignedStudentsCount >= c.capacity;
                    return (
                    <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 group">
                       <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-base font-black text-slate-900 leading-tight">{c.className}</h4>
                          </div>
                          <div className="flex gap-1 shrink-0">
                             <button
                               onClick={() => {
                                  setForm({
                                      className: c.className,
                                      professorId: String(c.professor?.id || ''),
                                      routineId: String(c.routine?.id || ''),
                                      daysOfWeek: c.daysOfWeek,
                                      startTime: c.startTime,
                                      endTime: c.endTime,
                                      capacity: String(c.capacity)
                                  });
                                  setEditingClassId(c.id);
                                  setIsEditModalOpen(true);
                               }}
                               className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                             >
                               <Edit size={15} />
                             </button>
                             <button
                               onClick={() => { if(confirm("¿Eliminar clase?")) deleteMutation.mutate(c.id) }}
                               className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                             >
                               <Trash2 size={15} />
                             </button>
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${DAY_STYLES[day].pill}`}>
                             <Clock size={11} /> {c.startTime} - {c.endTime}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${isFull ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                             <Users size={11} /> {assignedStudentsCount} / {c.capacity}
                          </span>
                       </div>

                       <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                          <UserIcon size={13} className="text-slate-400" />
                          {c.professor?.name} {c.professor?.lastName}
                       </p>

                       {c.routine && (
                         <div className="mt-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold w-fit">
                            🏋️ {c.routine.name}
                         </div>
                       )}

                       <div className="grid grid-cols-2 gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedClassForStudents(c.id)}
                            className="w-full rounded-lg py-2 text-xs gap-1.5"
                          >
                            <Users size={14} /> Alumnos
                          </Button>
                          <Button
                            variant={isFull ? 'secondary' : 'primary'}
                            size="sm"
                            disabled={isFull}
                            onClick={() => setSelectedClassForAssign(c.id)}
                            className={`w-full rounded-lg py-2 text-xs gap-1.5 ${isFull ? '' : 'bg-emerald-600 hover:bg-emerald-700 text-white border-none'}`}
                          >
                            <UserPlus size={14} /> {isFull ? 'Completo' : 'Inscribir'}
                          </Button>
                       </div>
                    </div>
                  );
                 })
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
              
              <SearchableSelect<GroupClass>
                label="Inscribir en Clase"
                placeholder="No inscribir a ninguna clase..."
                options={classes}
                value={classes.find((c: GroupClass) => String(c.id) === clientForm.activeClassId) ?? null}
                onChange={(c) => setClientForm({...clientForm, activeClassId: c ? String(c.id) : ''})}
                getKey={(c) => c.id}
                getLabel={(c) => `${c.className} (${c.daysOfWeek.map(d => TRANSLATIONS[d]).join(', ')} ${c.startTime})`}
              />

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
           if (form.daysOfWeek.length === 0) {
             toast.warning("Elegí al menos un día para la clase");
             return;
           }
           if (!form.professorId) {
             toast.warning("Seleccioná un profesor");
             return;
           }
           createMutation.mutate({
             ...form,
             capacity: Number(form.capacity)
           });
         }} className="space-y-4">
            <Input label="Nombre de la Clase" required value={form.className} onChange={e => setForm({...form, className: e.target.value})} />

            <div>
               <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Días</label>
               <div className="flex flex-wrap gap-2">
                 {DAYS.map(day => (
                   <label key={day} className="flex items-center gap-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer">
                     <input type="checkbox" checked={form.daysOfWeek.includes(day)} onChange={() => toggleFormDay(day)} />
                     {TRANSLATIONS[day]}
                   </label>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <Input label="Capacidad" type="number" required value={form.capacity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, capacity: e.target.value})} />
               <Input label="Hora Inicio" type="time" required value={form.startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, startTime: e.target.value})} />
               <Input label="Hora Fin" type="time" required value={form.endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, endTime: e.target.value})} />
            </div>

            <SearchableSelect<Professor>
              label="Profesor"
              placeholder="Buscar profesor..."
              options={professors}
              value={professors.find((p: Professor) => String(p.id) === form.professorId) ?? null}
              onChange={(p) => setForm({...form, professorId: p ? String(p.id) : ''})}
              getKey={(p) => p.id}
              getLabel={(p) => `${p.name} ${p.lastName}`}
            />

            <SearchableSelect<Routine>
              label="Rutina (Opcional)"
              placeholder="Sin rutina asignada"
              options={routines.filter((r) => r.active)}
              value={routines.find((r) => String(r.id) === form.routineId) ?? null}
              onChange={(r) => setForm({...form, routineId: r ? String(r.id) : ''})}
              getKey={(r) => r.id}
              getLabel={(r) => r.name}
            />

            <div className="flex gap-3 pt-6">
               <Button variant="outline" type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
               <Button type="submit" className="flex-1" isLoading={createMutation.isPending}>Crear Clase</Button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingClassId(null); }} title="Editar Clase">
         <form onSubmit={(e) => {
           e.preventDefault();
           if (form.daysOfWeek.length === 0) {
             toast.warning("Elegí al menos un día para la clase");
             return;
           }
           if (!form.professorId) {
             toast.warning("Seleccioná un profesor");
             return;
           }
           if(editingClassId) {
             updateMutation.mutate({
               id: editingClassId,
               form: {
                 ...form,
                 capacity: Number(form.capacity)
               }
             });
           }
         }} className="space-y-4">
            <Input label="Nombre de la Clase" required value={form.className} onChange={e => setForm({...form, className: e.target.value})} />

            <div>
               <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Días</label>
               <div className="flex flex-wrap gap-2">
                 {DAYS.map(day => (
                   <label key={day} className="flex items-center gap-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer">
                     <input type="checkbox" checked={form.daysOfWeek.includes(day)} onChange={() => toggleFormDay(day)} />
                     {TRANSLATIONS[day]}
                   </label>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <Input label="Capacidad" type="number" required value={form.capacity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, capacity: e.target.value})} />
               <Input label="Hora Inicio" type="time" required value={form.startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, startTime: e.target.value})} />
               <Input label="Hora Fin" type="time" required value={form.endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, endTime: e.target.value})} />
            </div>

            <SearchableSelect<Professor>
              label="Profesor"
              placeholder="Buscar profesor..."
              options={professors}
              value={professors.find((p: Professor) => String(p.id) === form.professorId) ?? null}
              onChange={(p) => setForm({...form, professorId: p ? String(p.id) : ''})}
              getKey={(p) => p.id}
              getLabel={(p) => `${p.name} ${p.lastName}`}
            />

            <SearchableSelect<Routine>
              label="Rutina (Opcional)"
              placeholder="Sin rutina asignada"
              options={routines.filter((r) => r.active)}
              value={routines.find((r) => String(r.id) === form.routineId) ?? null}
              onChange={(r) => setForm({...form, routineId: r ? String(r.id) : ''})}
              getKey={(r) => r.id}
              getLabel={(r) => r.name}
            />

            <div className="flex gap-3 pt-6">
               <Button variant="outline" type="button" className="flex-1" onClick={() => { setIsEditModalOpen(false); setEditingClassId(null); }}>Cancelar</Button>
               <Button type="submit" className="flex-1" isLoading={updateMutation.isPending}>Guardar Cambios</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
}
