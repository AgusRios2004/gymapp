import React from 'react';
import type { ProductPurchased } from '../../../types';

interface ClientProductsTabProps {
  products: ProductPurchased[];
}

export const ClientProductsTab: React.FC<ClientProductsTabProps> = ({ products }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Compras en el Gimnasio</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400 uppercase font-bold">
            <tr className="border-b border-gray-100">
              <th className="pb-4 px-2">Producto</th>
              <th className="pb-4">Fecha</th>
              <th className="pb-4">Cant.</th>
              <th className="pb-4">Precio Unit.</th>
              <th className="pb-4">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.length === 0 ? (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No ha realizado compras</td></tr>
            ) : (
              products.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-2 font-medium text-gray-900">{p.nameProduct}</td>
                  <td className="py-4 text-sm text-gray-600">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="py-4 text-sm text-gray-900">{p.quantity}</td>
                  <td className="py-4 text-sm text-gray-900">${p.price.toLocaleString()}</td>
                  <td className="py-4 font-bold text-gray-900">${(p.price * p.quantity).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
