import { useState } from 'react';
import { Clock, Plus, Trash2, Edit, User as UserIcon, Users, UserPlus, CalendarDays } from 'lucide-react';
import Button from '../components/ui/Button';
import { useClasses } from '../hooks/useClasses';
import { ClassStudentsModal } from '../components/classes/ClassStudentsModal';
import { QuickAddStudentModal } from '../components/classes/QuickAddStudentModal';
import { AssignStudentModal } from '../components/classes/AssignStudentModal';
import { ClassFormModal } from '../components/classes/ClassFormModal';
import type { GroupClass, Client } from '../types';

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const TRANSLATIONS: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles", 
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado"
};

export default function ClassesPage() {
  const {
    classes,
    routines,
    professors,
    clients,
    assistanceToday,
    createClass,
    deleteClass,
    updateClass,
    assignStudent,
    unassignStudent,
    quickAddStudent,
    registerStudentAssistance,
  } = useClasses();

  // Modal & Selection States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<GroupClass | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<number | null>(null);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<number | null>(null);

  const handleEditClick = (c: GroupClass) => {
    setEditingClass(c);
    setIsFormModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingClass(null);
    setIsFormModalOpen(true);
  };

  const handleSaveClass = async (data: any) => {
    if (editingClass) {
      await updateClass({ id: editingClass.id, form: data });
    } else {
      await createClass(data);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Clases</h1>
          <p className="text-gray-500">Horarios y cupos de clases grupales</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setIsClientModalOpen(true)} className="flex-1 sm:flex-none gap-2 rounded-2xl">
            <UserPlus size={20} /> Nuevo Alumno
          </Button>
          <Button onClick={handleCreateClick} className="flex-1 sm:flex-none gap-2 rounded-2xl">
            <Plus size={20} /> Nueva Clase
          </Button>
        </div>
      </div>

      {/* Grid of Days */}
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
                 classes.filter((c: GroupClass) => c.dayOfWeek === day).map((c: GroupClass) => {
                    const assignedStudentsCount = clients.filter((client: Client) => client.activeClassId === c.id).length;
                    const isFull = assignedStudentsCount >= c.capacity;
                    return (
                    <div key={c.id} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                       <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                             <h4 className="text-xl font-black text-gray-900 leading-tight">{c.className}</h4>
                             <div className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-full w-fit">
                                <Clock size={16} />
                                <span className="text-sm">{c.startTime} - {c.endTime}</span>
                             </div>
                          </div>
                          <div className="flex gap-1">
                             <button 
                               onClick={() => handleEditClick(c)} 
                               className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                             >
                               <Edit size={18} />
                             </button>
                             <button 
                               onClick={() => { if(confirm("¿Eliminar clase?")) deleteClass(c.id); }} 
                               className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                             >
                               <Trash2 size={18} />
                             </button>
                          </div>
                       </div>

                       {c.routine && (
                         <div className="mb-4">
                           <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Rutina Asignada</span>
                           <div className="bg-purple-50 text-purple-700 px-3 py-2 rounded-xl text-sm font-medium inline-block border border-purple-100">
                              🏋️‍♀️ {c.routine.name}
                           </div>
                         </div>
                       )}

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
                          
                          <div className={`flex items-center justify-between p-3 rounded-2xl border ${isFull ? 'bg-red-50/50 border-red-100/50 text-red-700' : 'bg-emerald-50/50 border-emerald-100/50 text-emerald-700'}`}>
                             <div className="flex items-center gap-2">
                                <Users size={18} />
                                <span className="text-sm font-black uppercase">Cupo</span>
                             </div>
                             <span className="text-lg font-black">{assignedStudentsCount} / {c.capacity}</span>
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
                  );
                 })
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ClassStudentsModal
        isOpen={!!selectedClassForStudents}
        onClose={() => setSelectedClassForStudents(null)}
        classId={selectedClassForStudents}
        assistanceToday={assistanceToday}
        onTakeAssistance={registerStudentAssistance}
        onRemoveStudent={unassignStudent}
      />

      <QuickAddStudentModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        classes={classes}
        onSave={quickAddStudent}
        translations={TRANSLATIONS}
      />

      <AssignStudentModal
        isOpen={!!selectedClassForAssign}
        onClose={() => setSelectedClassForAssign(null)}
        classId={selectedClassForAssign}
        clients={clients}
        onAssign={assignStudent}
        isLoading={false}
      />

      <ClassFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingClass(null);
        }}
        classData={editingClass}
        professors={professors}
        routines={routines}
        onSave={handleSaveClass}
        days={DAYS}
        translations={TRANSLATIONS}
      />
    </div>
  );
}
