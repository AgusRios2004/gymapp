import styles from './SearchBar.module.css';
import { Search } from 'lucide-react'; // Asegúrate de tener instalado `lucide-react` o usa un ícono alternativo

export default function SearchBar({ value, onChange }) {
    return (
        <div className={styles.searchBar}>
            <Search className={styles.icon} />
            <input
                type="text"
                placeholder="Buscar cliente..."
                value={value}
                onChange={onChange}
                className={styles.input}
            />
        </div>
    );
}
