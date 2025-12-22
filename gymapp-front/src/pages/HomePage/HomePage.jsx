import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClients } from '../../services/clientService';
import { getRutines } from '../../services/rutineService';
import { getPayments } from '../../services/paymentService';

// Components
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import Button from '../../components/Button/Button';

export default function HomePage() {
  const [cantClients, setCantClients] = useState(null);
  const [cantRutines, setCantRutines] = useState(null);
  const [cantPayments, setCantPayments] = useState(null);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // TODO: Handle loading state
    getClients()
      .then(clients => setCantClients(clients.data.length))
      .catch(error => setErr(error.message));
    getRutines()
      .then(rutines => setCantRutines(rutines.data.length))
      .catch(error => setErr(error.message));
    getPayments()
      .then(payments => setCantPayments(payments.data.length))
      .catch(error => setErr(error.message));
  }, []);

  return (
    <div className="text-center p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
      <header className="mb-12">
        <h1 className="text-6xl font-extrabold text-brand font-serif">GymApp</h1>
        <p className="text-xl text-gray-600 mt-2">Bienvenido al sistema de gestión del gimnasio</p>
      </header>

      <section className="flex flex-wrap justify-center gap-8 my-12">
        <SummaryCard number={cantClients} label="Clientes" />
        <SummaryCard number={cantRutines} label="Rutinas" />
        <SummaryCard number={cantPayments} label="Pagos" />
      </section>

      <nav className="flex flex-wrap justify-center gap-6 mt-8">
        <Button text="Clientes" variant = "primary" type = "button" onClick={() => navigate("/clientes")} />
        <Button text="Rutinas" variant = "primary" type = "button" onClick={() => navigate("/rutinas")} />
        <Button text="Pagos" variant = "primary" type = "button" onClick={() => navigate("/pagos")} />
      </nav>
    </div>
  );
}
