import styles from './HomePage.module.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {getClients} from '../../services/clientService';
import {getRutines} from '../../services/rutineService';
import {getPayments} from '../../services/paymentService';

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
    getClients()
    .then(clients => setCantClients(clients.data.length))
    .catch(error => setErr(error.message));
    getRutines()
    .then(rutines => setCantRutines(rutines.data.length))
    .catch(error => setErr(error.message));
    getPayments()
    .then(payments => setCantPayments(payments.data.length))
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GymApp</h1>
        <p>Bienvenido al sistema de gestión del gimnasio</p>
      </header>

      <section className={styles.summary}>
        <SummaryCard number={cantClients} label="Clientes" />
        <SummaryCard number={cantRutines} label="Rutinas" />
        <SummaryCard number={cantPayments} label="Pagos" />
      </section>

      <nav className={styles.nav}>
        <Button text="Clientes" variant = "primary" type = "button" onClick={() => navigate("/clientes")} />
        <Button text="Rutinas" variant = "primary" type = "button" onClick={() => navigate("/rutinas")} />
        <Button text="Pagos" variant = "primary" type = "button" onClick={() => navigate("/pagos")} />
      </nav>
    </div>
  );
}
