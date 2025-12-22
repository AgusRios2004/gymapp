import Button from '../Button/Button';
import { useNavigate } from 'react-router';

export default function ClientCard({ client }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/clients/${client.id}`);
  };

  const renderMensualidadStatus = () => {
    if (!client.lastPaymentDate || !client.lastPaymentDate.monthlyType) {
      return <span className="text-sm text-gray-500">Sin pagos de mensualidad</span>;
    }

    const lastPaymentDate = new Date(client.lastPaymentDate.date);
    const today = new Date();

    const sameMonth = lastPaymentDate.getMonth() === today.getMonth();
    const sameYear = lastPaymentDate.getFullYear() === today.getFullYear();

    const isOnTime = sameMonth && sameYear;

    return (
      <span className={`text-sm font-semibold ${isOnTime ? 'text-green-600' : 'text-red-600'}`}>
        {isOnTime ? 'Pagada este mes (al día)' : 'Atrasada'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800">{client.name} {client.lastName}</h3>
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {client.active ? 'Activo' : 'No activo'}
        </span>
      </div>
      <div className="text-sm text-gray-600 space-y-2 flex-grow">
        <p><strong className="font-medium text-gray-700">Teléfono:</strong> {client.phone || 'No registrado'}</p>
        <p><strong className="font-medium text-gray-700">DNI:</strong> {client.dni || 'No registrado'}</p>
        <p>
          <strong className="font-medium text-gray-700">Último pago:</strong>{' '}
          {client.lastPaymentDate
            ? client.lastPaymentDate.monthlyType
              ? `Mensualidad – $${client.lastPaymentDate.amount} el ${new Date(client.lastPaymentDate.date).toLocaleDateString()}`
              : client.lastPaymentDate.products
                ? `Productos – $${client.lastPaymentDate.amount} el ${new Date(client.lastPaymentDate.date).toLocaleDateString()}`
                : 'Sin categoría'
            : 'No hay pagos registrados'}
        </p>
        <p><strong className="font-medium text-gray-700">Mensualidad:</strong> {renderMensualidadStatus()}</p>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button
          text="Ver detalles"
          variant="primary"
          type="button"
          onClick={handleViewDetails}
        />
      </div>
    </div>
  );
}
