import styles from './ClientCard.module.css';
import Button from '../Button/Button';
import { useNavigate } from 'react-router';

export default function ClientCard({ client }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/clients/${client.id}`);
  };

  const renderMensualidadStatus = () => {
    if (!client.lastPaymentDate || !client.lastPaymentDate.monthlyType) {
      return <span className={styles.inactive}>Sin pagos de mensualidad</span>;
    }

    const lastPaymentDate = new Date(client.lastPaymentDate.date);
    const today = new Date();

    const sameMonth = lastPaymentDate.getMonth() === today.getMonth();
    const sameYear = lastPaymentDate.getFullYear() === today.getFullYear();
    const dayInRange = lastPaymentDate.getDate() >= 1 && lastPaymentDate.getDate() <= 10;

    const isOnTime = sameMonth && sameYear && dayInRange;

    return (
      <span className={isOnTime ? styles.active : styles.inactive}>
        {isOnTime ? 'Pagada este mes (al día)' : 'Atrasada'}
      </span>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.name}>{client.name} {client.lastName}</h3>
        <span className={client.active ? styles.active : styles.inactive}>
          {client.active ? 'Activo' : 'No activo'}
        </span>
      </div>
      <div className={styles.info}>
        <p><strong>Teléfono:</strong> {client.phone || 'No registrado'}</p>
        <p><strong>DNI:</strong> {client.dni || 'No registrado'}</p>
        <p className={styles.date}>
          <strong>Último pago:</strong>{' '}
          {client.lastPaymentDate
            ? client.lastPaymentDate.monthlyType
              ? `Mensualidad – $${client.lastPaymentDate.amount} el ${new Date(client.lastPaymentDate.date).toLocaleDateString()}`
              : client.lastPaymentDate.products
                ? `Productos – $${client.lastPaymentDate.amount} el ${new Date(client.lastPaymentDate.date).toLocaleDateString()}`
                : 'Sin categoría'
            : 'No hay pagos registrados'}
        </p>
        <p><strong>Mensualidad:</strong> {renderMensualidadStatus()}</p>
      </div>
      <Button
        text="Ver detalles"
        variant="primary"
        type="button"
        onClick={handleViewDetails}
      />
    </div>
  );
}
