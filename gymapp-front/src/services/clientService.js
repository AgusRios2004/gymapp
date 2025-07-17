const API_URL = "http://localhost:8080/api/clients"

export async function getClients() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Error fetching clients");
    }
    return response.json();
}

export async function getClientById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`Error fetching client with id ${id}`);
    }
    return response.json();
}

export async function createClient(clientData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
    });
    if (!response.ok) {
        throw new Error("Error creating client");
    }
    return response.json();
}

export async function updateClient(id, clientData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
    });
    if (!response.ok) {
        throw new Error(`Error updating client with id ${id}`);
    }
    return response.json();
}

export async function getClientPayments(id) {
    const response = await fetch(`http://localhost:8080/api/clients-info-controller/${id}/payments`);
    if (!response.ok) {
        throw new Error(`Error fetching payments for client ${id}`);
    }
    return response.json(); // esto te va a devolver { success, message, data }
}
