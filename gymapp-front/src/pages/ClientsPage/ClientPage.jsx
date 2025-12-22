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
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-4xl font-bold text-text-main mb-6">Clientes</h2>
                <Stats stats={statsData} />
                <div className="mt-6 flex justify-center">
                    <SearchBar value={search} onChange={handleSearchChange} />
                </div>
            </div>

            {err && <p className="text-center text-red-500">Error: {err}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClients.length > 0 ? (
                    filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500 mt-8">No hay clientes que coincidan con la búsqueda.</p>
                )}
            </div>
        </div>
    );
}
