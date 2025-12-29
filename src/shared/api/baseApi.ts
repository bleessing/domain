import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {  API_HEADERS } from '../lib/constants';

/**
 * Базовый API slice для всех endpoint'ов
 * Использует RTK Query для автоматического кэширования и управления состоянием
 */
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers) => {
            // Добавляем общие заголовки
            Object.entries(API_HEADERS).forEach(([key, value]) => {
                headers.set(key, value);
            });
            return headers;
        },
    }),
    // Определяем типы тегов для инвалидации кэша
    tagTypes: ['Balance', 'Dynamics', 'Sankey', 'Filters', 'Leftovers', 'Tables'],
    endpoints: () => ({}),
});
