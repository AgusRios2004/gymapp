import styles from './ClientPage.module.css';
import { useEffect, useState } from 'react';
import { getClients, getClientPayments } from '../../services/clientService'

//Components
import ClientCard from '../../components/ClientCard/ClientCard';

export default function ClientPage(){

    const [clients, setClients] = useState(null);
    const [err, setErr] = useState(null)

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
            lastPaymentDate: lastPayment?.date || null,
            };
        })
        ).then(fullClients => setClients(fullClients));
    })
    .catch(error => setErr(error.message));
    }, []);

    console.log(clients)

    return (
        <div className = {styles.container}>
            <h1>Clientes</h1>
            {clients && clients.map(client => (
            <ClientCard
                key={client.id}
                name={`${client.name} ${client.lastName}`}
                isActive={client.active}
                lastPaymentDate={client.lastPaymentDate}
                onClickDetails={() => console.log('Ver detalles de', client.id)}
            />
            ))}
        </div>
    )
}