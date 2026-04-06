import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { getProfessors } from '../services/professorService';
import { getClasses, createClass, deleteClass } from '../services/classService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'react-toastify';
import type { GroupClass, Professor } from '../types';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TRANSLATIONS: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles", 
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado"
};

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    className: '',
    professorId: '',
    dayOfWeek: 'MONDAY',
    startTime: '10:00',
    endTime: '11:00',
    capacity: '20'
  });

  const { data: classes = [] } = useQuery({
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
    onError: (error: any) => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Clases</h1>
          <p className="text-gray-500">Horarios y cupos de clases grupales</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 rounded-2xl">
          <Plus size={20} /> Nueva Clase
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DAYS.map(day => (
          <div key={day} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
               <h3 className="text-white font-bold text-lg">{TRANSLATIONS[day]}</h3>
            </div>
            <div className="p-4 space-y-3">
               {classes.filter((c: GroupClass) => c.dayOfWeek === day).length === 0 ? (
                 <p className="text-center py-8 text-gray-300 text-sm italic">Sin clases programadas</p>
               ) : (
                 classes.filter((c: GroupClass) => c.dayOfWeek === day).map((c: GroupClass) => (
                   <div key={c.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group relative">
                      <div className="flex justify-between items-start mb-2">
                         <p className="font-bold text-gray-900">{c.className}</p>
                         <button 
                           onClick={() => { if(confirm("¿Eliminar clase?")) deleteMutation.mutate(c.id) }} 
                           className="text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} className="text-blue-500" /> {c.startTime} - {c.endTime}
                         </p>
                         <p className="text-xs text-gray-500 flex items-center gap-1">
                            <UserIcon size={12} className="text-blue-500" /> {c.professor?.name} {c.professor?.lastName}
                         </p>
                         <p className="text-[10px] uppercase font-bold text-blue-600 mt-2">Cupo: {c.capacity} alumnos</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        ))}
      </div>

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
