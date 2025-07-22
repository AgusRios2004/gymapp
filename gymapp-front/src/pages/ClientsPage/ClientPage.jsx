import styles from './ClientPage.module.css';
import { useEffect, useState } from 'react';
import { getClients, getClientPayments } from '../../services/clientService'

//Components
import ClientCard from '../../components/ClientCard/ClientCard';
import Stats from '../../components/Stats/Stats';

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

    const isUpToDate = (client) => {
        const today = new Date();

        if (!client.lastPaymentDate || !client.lastPaymentDate.date) {
            console.warn("Cliente sin pago:", client);
            return false;
        }

        const paymentDate = new Date(client.lastPaymentDate.date);
        return (
            paymentDate.getFullYear() === today.getFullYear() &&
            paymentDate.getMonth() === today.getMonth() &&
            paymentDate.getDate() <= 10
        );
    };
   
    const statsData = [
        { label: 'Total clientes', value: clients.length },
        { label: 'Al día', value: clients.filter(c => isUpToDate(c)).length },
        { label: 'Con deuda', value: clients.filter(c => !isUpToDate(c)).length }
    ]

    console.log(clients)

      return (
        <div className={styles.container}>
        <div className={styles.header}>
            <h2 className={styles.title}>Clientes</h2>
            <div className={styles.actions}>
            <Stats stats={statsData} />
            </div>
        </div>

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