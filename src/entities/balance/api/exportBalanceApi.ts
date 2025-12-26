import { API_BASE_URL, API_HEADERS } from '@/shared/lib/constants';
import type { FilterParams } from '@/entities/filter';

export async function exportBalanceData(filters: FilterParams): Promise<Blob> {
    const params = new URLSearchParams();

    // Обязательные параметры
    params.append('zvz_table', filters.zvz_table);
    params.append('rss_table', filters.rss_table);
    params.append('spr_table', filters.spr_table);
    if (filters.ost_table) params.append('leftovers_table', filters.ost_table);

    // Режимы фильтрации
    if (filters.states_mode) params.append('states_mode', filters.states_mode);
    if (filters.types_mode) params.append('types_mode', filters.types_mode);

    // Массивы значений фильтров
    if (filters.states && filters.states.length > 0) {
        filters.states.forEach(s => params.append('states', s));
    }
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => params.append('types', t));
    }

    // Даты
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const url = `${API_BASE_URL}/export/balance?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: API_HEADERS,
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
}

export async function exportBalanceReportData(filters: FilterParams): Promise<Blob> {
    const params = new URLSearchParams();

    // Обязательные параметры
    params.append('zvz_table', filters.zvz_table);
    params.append('rss_table', filters.rss_table);
    params.append('spr_table', filters.spr_table);
    if (filters.ost_table) params.append('leftovers_table', filters.ost_table);

    // Режимы фильтрации
    if (filters.states_mode) params.append('states_mode', filters.states_mode);
    if (filters.types_mode) params.append('types_mode', filters.types_mode);

    // Массивы значений фильтров
    if (filters.states && filters.states.length > 0) {
        filters.states.forEach(s => params.append('states', s));
    }
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => params.append('types', t));
    }

    // Даты
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const url = `${API_BASE_URL}/export/balance-report?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: API_HEADERS,
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
}
