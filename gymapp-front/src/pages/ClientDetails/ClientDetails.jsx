// src/pages/ClientDetails.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClientById } from '../../services/clientService';

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientById(id)
      .then(clients => setClient(clients.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (!client) return <p>Cliente no encontrado</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Detalles del Cliente</h2>
      <p><strong>Nombre:</strong> {client.name} {client.lastName}</p>
      <p><strong>DNI:</strong> {client.dni}</p>
      <p><strong>Activo:</strong> {client.active ? 'Sí' : 'No'}</p>
      <p><strong>Último pago:</strong> {client.lastPaymentDate ? new Date(client.lastPaymentDate).toLocaleDateString() : 'Sin pagos'}</p>
    </div>
  );
}
