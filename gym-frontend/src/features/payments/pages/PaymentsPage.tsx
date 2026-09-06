import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { usePayments } from '../hooks/usePayments';
import { useAuth } from '../../auth/context/AuthContext';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { toast } from 'react-toastify';
import type { MonthlyPaymentRequest } from '../../../types/index';
import Modal from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

export default function PaymentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Data for the form
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedProfessor, setSelectedProfessor] = useState<string>(user?.id.toString() || '');
  const [selectedMonthlyType, setSelectedMonthlyType] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const {
    payments,
    isLoadingPayments,
    clients,
    professors,
    monthlyTypes,
    createPayment,
    isCreatingPayment
  } = usePayments();

  const resetForm = () => {
    setSelectedClient('');
    setSelectedProfessor(user?.id.toString() || '');
    setSelectedMonthlyType('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedProfessor || !selectedMonthlyType) {
      toast.warning("Por favor completa todos los campos");
      return;
    }

    const request: MonthlyPaymentRequest = {
      idClient: Number(selectedClient),
      idProfessor: Number(selectedProfessor),
      idMonthlyType: Number(selectedMonthlyType),
      date: paymentDate
    };

    createPayment(request, () => {
      setIsModalOpen(false);
      resetForm();
    });
  };

  const filteredPayments = Array.isArray(payments) ? payments.filter(p => 
    p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.professorName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pagos y Suscripciones</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Historial de transacciones y cuotas mensuales</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={20} />
          Registrar Pago
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por cliente o profesor..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm dark:text-white dark:placeholder-gray-500"
        />
      </div>

      {/* Grid: Table for desktop, Cards for mobile */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-gray-400 text-sm uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Suscripción</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Profesor</th>
                <th className="px-6 py-4">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {isLoadingPayments ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">Cargando pagos...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No hay pagos registrados</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-350">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {payment.clientName?.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white">{payment.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-350">
                      {payment.monthlyTypeName || '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-350">
                      {payment.professorName}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={payment.paymentType === 'MONTHLY' ? 'success' : 'neutral'}>
                        {payment.paymentType === 'MONTHLY' ? 'Mensual' : 'Producto'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards layout for mobile view */}
      <div className="md:hidden space-y-4">
        {isLoadingPayments ? (
          <p className="text-center py-6 text-gray-500">Cargando pagos...</p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-center py-6 text-gray-500">No hay pagos registrados</p>
        ) : (
          filteredPayments.map((payment) => (
            <div key={payment.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                    {payment.clientName?.charAt(0)}
                  </div>
                  <span className="font-bold text-gray-950 dark:text-white text-sm">{payment.clientName}</span>
                </div>
                <Badge variant={payment.paymentType === 'MONTHLY' ? 'success' : 'neutral'}>
                  {payment.paymentType === 'MONTHLY' ? 'Mensual' : 'Producto'}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(payment.date).toLocaleDateString()}</span>
                <span>{payment.monthlyTypeName || '-'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-slate-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">Cobró: {payment.professorName}</span>
                <span className="text-lg font-black text-gray-950 dark:text-white">${payment.amount.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Registrar Pago Mensual"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                    {c.name} {c.lastName} {c.isDebtor ? '⚠️ (DEUDOR)' : ''}
                </option>
              ))}
            </select>
          </div>

          {user?.role === 'ADMIN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profesor que cobra</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
              >
                <option value="">Seleccionar profesor...</option>
                {professors.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.lastName}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuota</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={selectedMonthlyType}
              onChange={(e) => setSelectedMonthlyType(e.target.value)}
            >
              <option value="">Seleccionar cuota...</option>
              {monthlyTypes.map(m => (
                <option key={m.id} value={m.id}>{m.type} - ${m.price}</option>
              ))}
            </select>
          </div>

          <Input 
            label="Fecha de Pago"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />

          <div className="pt-4 flex gap-3">
            <Button 
              variant="outline" 
              type="button" 
              className="flex-1" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              isLoading={isCreatingPayment}
            >
              Confirmar Pago
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
