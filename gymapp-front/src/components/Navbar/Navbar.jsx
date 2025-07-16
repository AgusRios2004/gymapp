import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';

export default function Navbar(){
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}> Gimnasio </div>
            <ul className={styles.navLinks}>
                <li><Link to="/" className={styles.link}>Home</Link></li>
                <li><Link to="/clientes" className={styles.link}>Clientes</Link></li>
                <li><Link to="/rutinas" className={styles.link}>Rutinas</Link></li>
                <li><Link to="/pagos" className={styles.link}>Pagos</Link></li>
                <li><Link to="/login" className={styles.link}>Login</Link></li>
            </ul>
        </nav>
    )
}