// src/pages/HomePage.jsx
import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import SummaryCard from '../../components/SummaryCard/SummaryCard';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>GymApp</h1>
        <p>Bienvenido al sistema de gestión del gimnasio</p>
      </header>

      <section className={styles.summary}>
        <SummaryCard number={150} label="Clientes" />
        <SummaryCard number={30} label="Rutinas" />
        <SummaryCard number={2000} label="Pagos" />
      </section>

      <nav className={styles.nav}>
        <Button text="Clientes" variant = "primary" type = "button" onClick={() => navigate("/clientes")} />
        <Button text="Rutinas" variant = "primary" type = "button" onClick={() => navigate("/rutinas")} />
        <Button text="Pagos" variant = "primary" type = "button" onClick={() => navigate("/pagos")} />
      </nav>
    </div>
  );
}
