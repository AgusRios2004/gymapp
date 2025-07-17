const API_URL = "http://localhost:8080/api/routines";

export async function getRutines(){
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error("Error fetching rutines");
    }
    return response.json();
}