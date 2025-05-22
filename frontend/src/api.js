const API_URL =
    import.meta.env.VITE_API_URL;

export async function loginUser(credentials) {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include' // trimite cookie-urile la request
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return await response.json();
}

export const apiRequest = async(endpoint, method = 'GET', body = null, token = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        credentials: 'include' // dacă vrei să trimiți cookie-uri și aici
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }

    return response.json();
};

// Funcții specifice
export const spinSlot = (betAmount, token) =>
    apiRequest('/api/slot/spin', 'POST', { bet_amount: betAmount }, token);