import React from 'react';
import type { Payment } from '../../../types';

interface ClientPaymentsTabProps {
  payments: Payment[];
}

export const ClientPaymentsTab: React.FC<ClientPaymentsTabProps> = ({ payments }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Historial de Pagos</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400 uppercase font-bold">
            <tr className="border-b border-gray-100">
              <th className="pb-4 px-2">Fecha</th>
              <th className="pb-4">Concepto</th>
              <th className="pb-4">Monto</th>
              <th className="pb-4">Cobrado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {payments.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-gray-400">No hay pagos registrados</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-2 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="py-4 font-medium text-gray-900">{p.monthlyTypeName || 'Producto'}</td>
                  <td className="py-4 text-gray-900 font-bold">${p.amount.toLocaleString()}</td>
                  <td className="py-4 text-sm text-gray-500">{p.professorName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
