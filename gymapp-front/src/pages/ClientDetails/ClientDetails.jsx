// src/pages/ClientDetails.jsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClientById, getClientPayments } from '../../services/clientService';

import PaymentHistory from '../../components/PaymentHistory/PaymentHistory';
import ClientInfo from '../../components/ClientInfo/ClientInfo';

export default function ClientDetails() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    getClientById(id)
      .then(async (res) => {
        const client = res.data;
        const paymentsRes = await getClientPayments(client.id);
        const payments = paymentsRes.data;

        const lastPayment = payments.length > 0
          ? payments.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b)
          : null;

        setClient({
          ...client,
          lastPaymentDate: lastPayment,
          payments: payments,
        });

        setLoading(false);
      })
      .catch((err) => {
        setErr(err.message);
        setLoading(false);
      });
  }, [id]);


  if (loading) return <p>Cargando...</p>;
  if (err) return <p>Error: {err}</p>;
  if (!client) return <p>Cliente no encontrado</p>;

  const isUpToDate = (client) => {
    const today = new Date();

      if (!client.lastPaymentDate || !client.lastPaymentDate.date) return false;

      const paymentDate = new Date(client.lastPaymentDate.date);

      return (
        paymentDate.getFullYear() === today.getFullYear() &&
        paymentDate.getMonth() === today.getMonth()
      );
  };


  return (
    <div style={{ padding: '2rem' }}>
      <ClientInfo client={client} isUpToDate={isUpToDate} />
      <PaymentHistory payments={client.payments}/>
    </div>
  );
}
