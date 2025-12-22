export default function ClientInfo({ client, isUpToDate }) {
  const upToDate = isUpToDate(client);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Detalles del Cliente</h2>

      <div className="space-y-3">
        <p className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-600">Nombre:</span>
          <span className="text-gray-800">{client.name} {client.lastName}</span>
        </p>

        <p className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-600">DNI:</span>
          <span className="text-gray-800">{client.dni}</span>
        </p>

        <p className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-600">Activo:</span>
          <span className="text-gray-800">{client.active ? 'Sí' : 'No'}</span>
        </p>

        <p className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-600">Último pago:</span>
          <span className="text-gray-800">
            {client.lastPaymentDate
              ? `${new Date(client.lastPaymentDate.date).toLocaleDateString('es-AR')} — $${client.lastPaymentDate.amount}`
              : 'Sin pagos'}
          </span>
        </p>

        <p className="flex justify-between items-center pt-2">
          <span className="font-semibold text-gray-600">Estado:</span>
          <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${upToDate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {upToDate ? 'AL DÍA' : 'PAGO ATRASADO'}
          </span>
        </p>
      </div>
    </div>
  );
}
