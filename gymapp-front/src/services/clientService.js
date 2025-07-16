const API_URL = "http://localhost:8080/api/clients"

export async function getClients() {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Error fetching clients");
    }
    return response.json();
}