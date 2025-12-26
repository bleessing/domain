import { API_BASE_URL, API_HEADERS } from '../lib/constants';

export async function apiRequest<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
    const url = params
        ? `${API_BASE_URL}${endpoint}?${params.toString()}`
        : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: API_HEADERS,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
