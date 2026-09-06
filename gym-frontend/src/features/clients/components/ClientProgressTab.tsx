import React, { useState } from 'react';
import { Plus, TrendingUp, Trash2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { PhysicalRecord } from '../../../types';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

interface ClientProgressTabProps {
  clientId: number;
  physicalRecords: PhysicalRecord[];
  onCreateRecord: (data: Partial<PhysicalRecord>, onSuccess: () => void) => void;
  onDeleteRecord: (id: number) => void;
  isPending: boolean;
}

export const ClientProgressTab: React.FC<ClientProgressTabProps> = ({ 
  physicalRecords, 
  onCreateRecord, 
  onDeleteRecord, 
  isPending 
}) => {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordForm, setRecordForm] = useState({
    weight: '',
    muscleMass: '',
    fatPercentage: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRecord({
      weight: Number(recordForm.weight),
      muscleMass: Number(recordForm.muscleMass),
      fatPercentage: Number(recordForm.fatPercentage),
      notes: recordForm.notes,
      date: new Date().toISOString().split('T')[0]
    }, () => {
      setIsRecordModalOpen(false);
      setRecordForm({ weight: '', muscleMass: '', fatPercentage: '', notes: '' });
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Evolución Física</h3>
        <Button onClick={() => setIsRecordModalOpen(true)} className="gap-2">
          <Plus size={18} /> Nuevo Registro
        </Button>
      </div>

      {physicalRecords.length > 1 ? (
        <div className="h-80 w-full bg-gray-50 p-4 rounded-3xl border border-gray-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...physicalRecords].reverse()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                tick={{fontSize: 12, fill: '#999'}}
              />
              <YAxis tick={{fontSize: 12, fill: '#999'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="muscleMass" name="Masa Muscular" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : physicalRecords.length === 1 ? (
        <div className="p-8 bg-blue-50 rounded-3xl text-center">
           <p className="text-blue-600 font-medium">Registra al menos 2 medidas para ver el gráfico de evolución.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {physicalRecords.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
             <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
             <p>No hay registros físicos aún</p>
          </div>
        ) : (
          physicalRecords.map((record) => (
            <div key={record.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-shadow group relative">
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de eliminar este registro?')) {
                    onDeleteRecord(record.id);
                  }
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                 <span className="text-sm font-bold text-gray-900">{new Date(record.date).toLocaleDateString()}</span>
                 <Badge variant="neutral">Medición</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Peso</p>
                    <p className="text-lg font-black text-blue-600">{record.weight}kg</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Músculo</p>
                    <p className="text-lg font-black text-green-600">{record.muscleMass}%</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Grasa</p>
                    <p className="text-lg font-black text-amber-600">{record.fatPercentage}%</p>
                 </div>
              </div>
              {record.notes && (
                <p className="text-xs text-gray-500 italic border-t border-gray-50 pt-3">{record.notes}</p>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Nuevo Registro Físico">
         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
               <Input label="Peso (kg)" type="number" step="0.1" required value={recordForm.weight} onChange={e => setRecordForm({...recordForm, weight: e.target.value})} />
               <Input label="Músculo (%)" type="number" step="0.1" required value={recordForm.muscleMass} onChange={e => setRecordForm({...recordForm, muscleMass: e.target.value})} />
               <Input label="Grasa (%)" type="number" step="0.1" required value={recordForm.fatPercentage} onChange={e => setRecordForm({...recordForm, fatPercentage: e.target.value})} />
            </div>
            <Input label="Notas / Observaciones" value={recordForm.notes} onChange={e => setRecordForm({...recordForm, notes: e.target.value})} />
            <div className="flex gap-3 pt-6">
               <Button variant="outline" type="button" className="flex-1" onClick={() => setIsRecordModalOpen(false)}>Cancelar</Button>
               <Button type="submit" className="flex-1" isLoading={isPending}>Guardar</Button>
            </div>
         </form>
      </Modal>
    </div>
  );
};
