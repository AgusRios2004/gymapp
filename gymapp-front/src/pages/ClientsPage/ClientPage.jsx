import styles from './ClientPage.module.css';
import { useEffect, useState } from 'react';
import { getClients, getClientPayments } from '../../services/clientService'

//Components
import ClientCard from '../../components/ClientCard/ClientCard';

export default function ClientPage(){

    const [clients, setClients] = useState([]);
    const [err, setErr] = useState([])

    useEffect(() => {
    getClients().then(res => {
        const clientList = res.data;

        Promise.all(
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
        ).then(fullClients => setClients(fullClients));
    })
    .catch(error => setErr(error.message));
    }, []);

    console.log(clients)

    return (
        <div className={styles.container}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Clientes</h2>
            <div className={styles.grid}>
                {clients && clients.length > 0 ? (
                    clients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))
                    ) : (
                    <p>No hay clientes disponibles.</p>
                )}
            </div>
        </div>
    )
}