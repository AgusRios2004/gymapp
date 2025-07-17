import styles from './ClientCard.module.css';
import Button from '../Button/Button';

export default function ClientCard({ name, lastPaymentDate, isActive, onClickDetails }) {
return (
    <div className={styles.card}>
        <div className={styles.header}>
            <h3>{name}</h3>
            <span className={isActive ? styles.active : styles.inactive}>
                {isActive ? 'Al día' : 'Vencido'}   
            </span>
        </div>
        <p>
            Ultimo pago: {lastPaymentDate}
        </p>
        <Button
        text='Ver detalles'
        variant='primary'
        type='button'
        onClick={onClickDetails}
        />
    </div>
)
}