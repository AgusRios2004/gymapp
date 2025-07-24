import styles from './ClientPage.module.css';
import { useEffect, useState } from 'react';
import { getClients, getClientPayments } from '../../services/clientService';

// Components
import ClientCard from '../../components/ClientCard/ClientCard';
import Stats from '../../components/Stats/Stats';
import SearchBar from '../../components/SearchBar/SearchBar';

export default function ClientPage() {
    const [clients, setClients] = useState([]);
    const [err, setErr] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        getClients()
            .then(res => {
                const clientList = res.data;
                return Promise.all(
                    clientList.map(async client => {
                        const paymentsRes = await getClientPayments(client.id);
                        const payments = paymentsRes.data;

                        const lastPayment = payments.length > 0
                            ? payments.reduce((a, b) => new Date(a.date) > new Date(b.date) ? a : b)
                            : null;

                        return {
                            ...client,
                            lastPaymentDate: lastPayment,
                        };
                    })
                );
            })
            .then(fullClients => setClients(fullClients))
            .catch(error => setErr(error.message));
    }, []);

    const isUpToDate = (client) => {
        const today = new Date();
        if (!client.lastPaymentDate || !client.lastPaymentDate.date) return false;

        const paymentDate = new Date(client.lastPaymentDate.date);

        return (
            paymentDate.getFullYear() === today.getFullYear() &&
            paymentDate.getMonth() === today.getMonth()
        );
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const filteredClients = clients.filter(client =>
        `${client.name} ${client.lastName}`.toLowerCase().includes(search.toLowerCase())
    );


    const statsData = [
        { label: 'Total clientes', value: clients.length },
        { label: 'Al día', value: clients.filter(c => isUpToDate(c)).length },
        { label: 'Con deuda', value: clients.filter(c => !isUpToDate(c)).length }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Clientes</h2>
                <div className={styles.actions}>
                    <Stats stats={statsData} />
                </div>
                <div className={styles.actions}>
                    <SearchBar value={search} onChange={handleSearchChange} />
                </div>
            </div>

            <div className={styles.grid}>
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))
                ) : (
                    <p>No hay clientes disponibles.</p>
                )}
            </div>
        </div>
    );
}
