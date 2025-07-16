import styles from './Button.module.css';

export default function Button({text, onClick, variant, type}){
    return (
        <button 
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}
            type={type}
        >
            {text}
        </button>
    )
}