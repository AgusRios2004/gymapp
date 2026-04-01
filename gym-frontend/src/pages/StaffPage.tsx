import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UserPlus, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  ShieldCheck,
  Search,
  Fingerprint
} from 'lucide-react';
import { getProfessors, deleteProfessor, createProfessor } from '../services/professorService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'react-toastify';
import type { Professor } from '../types';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    password: ''
  });

  const { data: professors = [], isLoading } = useQuery({
    queryKey: ['professors'],
    queryFn: () => getProfessors()
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Professor>) => createProfessor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] });
      toast.success("✅ Profesor creado correctamente");
      setIsModalOpen(false);
      setFormData({ name: '', lastName: '', dni: '', phone: '', email: '', password: '' });
    },
    onError: () => toast.error("❌ Error al crear profesor")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProfessor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professors'] });
      toast.success("✅ Estado del profesor actualizado");
    },
    onError: () => toast.error("❌ Error al modificar profesor")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredStaff = professors.filter((p: Professor) => 
    `${p.name} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dni.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Staff</h1>
          <p className="text-gray-500">Administra los profesores y el personal del gimnasio</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1 md:flex-none">
             <Search size={20} className="text-gray-400" />
             <input 
               type="text" 
               placeholder="Buscar profesor..." 
               className="bg-transparent border-0 focus:ring-0 text-sm font-medium w-full"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 rounded-2xl whitespace-nowrap">
            <UserPlus size={20} />
            Nuevo Profesor
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-gray-400 font-medium">Cargando personal...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((p: Professor) => (
            <div key={p.id} className={`bg-white p-6 rounded-3xl border transition-all ${!p.active ? 'opacity-60 grayscale bg-gray-50' : 'border-gray-100 shadow-sm hover:shadow-lg'}`}>
              {/* ... (existing professor card UI) */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${p.active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {p.name.charAt(0)}
                </div>
                <div className="flex gap-1">
                   <button 
                     onClick={() => {
                        if(confirm(`¿Deseas ${p.active ? 'dar de baja' : 'reactivar'} a ${p.name}?`)) {
                           deleteMutation.mutate(p.id);
                        }
                     }} 
                     className={`p-2 rounded-xl transition-colors ${p.active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                   >
                     {p.active ? <UserX size={18} /> : <UserCheck size={18} />}
                   </button>
                </div>
              </div>

              <div className="space-y-1 mb-6">
                 <h3 className="text-lg font-bold text-gray-900">{p.name} {p.lastName}</h3>
                 <p className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck size={12} /> Profesor
                 </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{p.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" />
                    <span>{p.phone}</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Fingerprint size={16} className="text-gray-400" />
                    <span>DNI: {p.dni}</span>
                 </div>
              </div>
              
              {!p.active && (
                <div className="mt-4 px-3 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-full inline-block">
                  Inactivo
                </div>
              )}
            </div>
          ))}

          {/* New manual entry button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all hover:bg-blue-50/30"
          >
             <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
                <UserPlus size={24} />
             </div>
             <p className="font-bold text-sm">Añadir otro perfil manualmente</p>
          </button>
        </div>
      )}

      {/* Modal para Crear Profesor */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nuevo Profesor">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nombre" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <Input 
              label="Apellido" 
              required 
              value={formData.lastName} 
              onChange={e => setFormData({...formData, lastName: e.target.value})} 
            />
          </div>
          <Input 
            label="DNI" 
            required 
            value={formData.dni} 
            onChange={e => setFormData({...formData, dni: e.target.value})} 
          />
          <Input 
            label="Email" 
            type="email" 
            required 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <Input 
            label="Teléfono" 
            value={formData.phone} 
            onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
          <Input 
            label="Contraseña" 
            type="password" 
            required 
            value={formData.password} 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          <div className="flex gap-3 pt-6">
            <Button variant="outline" type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" isLoading={createMutation.isPending}>Guardar Profesor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
