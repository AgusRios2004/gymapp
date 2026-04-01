import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Settings2, 
  Trash2, 
  Clock, 
  Tag, 
  Edit3
} from 'lucide-react';
import { 
  getMonthlyTypes, 
  createMonthlyType, 
  updateMonthlyType, 
  deleteMonthlyType 
} from '../services/monthlyTypeService';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { toast } from 'react-toastify';
import type { MonthlyType } from '../types';

export default function MonthlyTypesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MonthlyType | null>(null);
  
  // Form state
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('30');

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['monthlyTypes'],
    queryFn: getMonthlyTypes
  });

  const createMutation = useMutation({
    mutationFn: createMonthlyType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyTypes'] });
      toast.success("✅ Plan creado correctamente");
      handleCloseModal();
    },
    onError: () => toast.error("❌ Error al crear el plan")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<MonthlyType> }) => updateMonthlyType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyTypes'] });
      toast.success("✅ Plan actualizado");
      handleCloseModal();
    },
    onError: () => toast.error("❌ Error al actualizar el plan")
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMonthlyType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyTypes'] });
      toast.success("🗑️ Plan eliminado");
    },
    onError: () => toast.error("❌ Error al eliminar el plan")
  });

  const handleOpenModal = (plan?: MonthlyType) => {
    if (plan) {
      setEditingPlan(plan);
      setType(plan.type);
      setPrice(plan.price.toString());
      setDurationDays(plan.durationDays.toString());
    } else {
      setEditingPlan(null);
      setType('');
      setPrice('');
      setDurationDays('30');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type,
      price: Number(price),
      durationDays: Number(durationDays)
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este plan?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes y Membresías</h1>
          <p className="text-gray-500">Configura las cuotas y suscripciones disponibles</p>
        </div>
        
        <Button onClick={() => handleOpenModal()} className="gap-2 rounded-2xl shadow-lg shadow-blue-600/30">
          <Plus size={20} />
          Nuevo Plan
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center py-12 text-gray-400">Cargando planes...</p>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
           <Tag className="mx-auto text-gray-300 mb-4" size={48} />
           <p className="text-gray-500 font-medium">No hay planes configurados</p>
           <Button variant="ghost" onClick={() => handleOpenModal()} className="mt-4 text-blue-600">Crear el primer plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden">
              {/* Badge decorativa */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:bg-blue-600 transition-colors duration-500 opacity-20 group-hover:opacity-10"></div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">{plan.type}</h3>
                  <div className="flex gap-1">
                     <button onClick={() => handleOpenModal(plan)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                     </button>
                     <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                   <span className="text-3xl font-black text-gray-900">${plan.price.toLocaleString()}</span>
                   <span className="text-gray-400 text-sm font-medium">/ cada {plan.durationDays} días</span>
                </div>

                <div className="pt-4 space-y-3">
                   <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                      <Clock size={16} className="text-blue-500" />
                      <span>{plan.durationDays} días de acceso</span>
                   </div>
                   <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-2xl">
                      <Settings2 size={16} className="text-amber-500" />
                      <span>Configuración personalizable</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal logic */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nombre del Plan (ej: Pase Libre)"
            placeholder="Introduce el nombre..."
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Precio ($)"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input 
              label="Duración (días)"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              required
            />
          </div>

          <div className="pt-6 flex gap-3">
             <Button variant="outline" type="button" className="flex-1" onClick={handleCloseModal}>Cancelar</Button>
             <Button type="submit" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>
               {editingPlan ? "Guardar Cambios" : "Crear Plan"}
             </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
