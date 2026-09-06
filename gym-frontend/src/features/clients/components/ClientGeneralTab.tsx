import React from 'react';
import { CheckCircle2, XCircle, CreditCard, Dumbbell } from 'lucide-react';
import type { Client, Payment, Routine } from '../../../types';

interface ClientGeneralTabProps {
  client: Client;
  payments: Payment[];
  routines: Routine[];
}

export const ClientGeneralTab: React.FC<ClientGeneralTabProps> = ({ client, payments, routines }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-blue-500 pl-3">Datos Personales</h3>
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Nombre Completo</p>
            <p className="text-gray-900 font-medium">{client.name} {client.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">DNI / ID</p>
            <p className="text-gray-900 font-medium">{client.dni}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Teléfono</p>
            <p className="text-gray-900 font-medium">{client.phone || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Estado Cuenta</p>
            <div className="flex items-center gap-1">
              {client.active ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
              <span className={client.active ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {client.active ? "Al día" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Resumen Reciente</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><CreditCard size={18} /></div>
              <span className="text-sm font-medium text-gray-700">Último Pago</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {payments.length > 0 ? `$${payments[0].amount.toLocaleString()}` : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><Dumbbell size={18} /></div>
              <span className="text-sm font-medium text-gray-700">Rutina Activa</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {routines.find(r => r.active)?.name || 'Ninguna'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
