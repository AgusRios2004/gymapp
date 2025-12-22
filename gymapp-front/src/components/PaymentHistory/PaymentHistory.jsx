export default function PaymentHistory({ payments }) {
  if (!payments || payments.length === 0) {
    return <p className="text-center text-gray-500 mt-6">Este cliente no tiene pagos registrados.</p>;
  }  
  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Historial de pagos</h3>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="border-b-2 border-gray-200 pb-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
            <th className="border-b-2 border-gray-200 pb-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
            <th className="border-b-2 border-gray-200 pb-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((pago, index) => (
            <tr key={index}>
              <td className="py-3 border-b border-gray-200">{new Date(pago.date).toLocaleDateString('es-AR')}</td>
              <td className="py-3 border-b border-gray-200 font-mono font-semibold">${pago.amount}</td>
              <td className={`py-3 border-b border-gray-200 font-medium ${pago.monthlyType ? 'text-blue-600' : 'text-purple-600'}`}>
                {pago.monthlyType ? 'Mensualidad' : 'Producto'}
              </td>
            </tr>
          ))}
         <tr>
          <td colSpan={3} className="text-right font-bold text-lg pt-4">
            Total: ${totalAmount}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}
