import styles from './SummaryCard.module.css';

export default function SummaryCard({ number, label }) {
    return (
        <div className={styles.card}>
            <h2 className={styles.number}>{number}</h2>
            <p className={styles.label}>{label}</p>
        </div>
    )
}