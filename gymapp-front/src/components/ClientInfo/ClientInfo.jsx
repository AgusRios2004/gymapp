import styles from './ClientInfo.module.css';

export default function ClientInfo({ client, isUpToDate }) {
  const upToDate = isUpToDate(client);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Detalles del Cliente</h2>

      <p className={styles.infoRow}>
        <span className={styles.label}>Nombre:</span>
        <span className={styles.value}>{client.name} {client.lastName}</span>
      </p>

      <p className={styles.infoRow}>
        <span className={styles.label}>DNI:</span>
        <span className={styles.value}>{client.dni}</span>
      </p>

      <p className={styles.infoRow}>
        <span className={styles.label}>Activo:</span>
        <span className={styles.value}>{client.active ? 'Sí' : 'No'}</span>
      </p>

      <p className={styles.infoRow}>
        <span className={styles.label}>Último pago:</span>
        <span className={styles.value}>
          {client.lastPaymentDate
            ? `${new Date(client.lastPaymentDate.date).toLocaleDateString('es-AR')} — $${client.lastPaymentDate.amount}`
            : 'Sin pagos'}
        </span>
      </p>

      <p className={styles.infoRow}>
        <span className={styles.label}>Estado:</span>
        <span className={`${styles.status} ${upToDate ? styles.upToDate : styles.late}`}>
          {upToDate ? 'AL DÍA' : 'PAGO ATRASADO'}
        </span>
      </p>
    </div>
  );
}
