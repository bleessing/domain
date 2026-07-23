export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * База для v2-эндпоинтов отчётов (`/api/v2/...`).
 * VITE_API_BASE_URL заканчивается на `/api/v1` — заменяем хвост на `/v2`.
 */
export const API_V2_BASE_URL = String(API_BASE_URL).replace(/\/v1\/?$/, '/v2');

export const API_HEADERS = {
    'Content-Type': 'application/xml',
    'ngrok-skip-browser-warning': 'true',
};
