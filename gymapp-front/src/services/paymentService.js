const API_URL = "http://localhost:8080/api/payments";

export async function getPayments(){
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Error fetching payments");
    }
    return response.json();
}