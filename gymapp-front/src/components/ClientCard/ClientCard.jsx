import styles from './ClientCard.module.css';
import Button from '../Button/Button';
import { useNavigate } from 'react-router';

export default function ClientCard({ client }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/clients/${client.id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{client.name} {client.lastName}</h3>
        <span className={client.active ? styles.active : styles.inactive}>
          {client.active ? 'Al día' : 'Vencido'}
        </span>
      </div>
      <p>
        DNI: {client.dni}<br />
        Último pago: {client.lastPaymentDate
          ? new Date(client.lastPaymentDate).toLocaleDateString()
          : 'Sin pagos'}
      </p>
      <Button
        text="Ver detalles"
        variant="primary"
        type="button"
        onClick={handleViewDetails}
      />
    </div>
  );
}
