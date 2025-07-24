import styles from './PaymentHistory.module.css';

export default function PaymentHistory({ payments }) {
  if (!payments || payments.length === 0) {
    return <p>Este cliente no tiene pagos registrados.</p>;
  }  
  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Historial de pagos</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((pago, index) => (
            <tr key={index}>
              <td>{new Date(pago.date).toLocaleDateString('es-AR')}</td>
              <td className={styles.amount}>${pago.amount}</td>
              <td className={pago.monthlyType ? styles.mensualidad : styles.producto}>
                {pago.monthlyType ? 'Mensualidad' : 'Producto'}
              </td>
            </tr>
          ))}
         <tr className={styles.totalRow}>
          <td colSpan={3} className={styles.totalCombined}>
            Total: ${totalAmount}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  );
}
