import { apiRequest } from '@/shared/api/client';
import type { FilterParams } from '@/entities/filter';
import type { BalanceResponse } from '../model/types';

export async function fetchBalanceData(filters: FilterParams): Promise<BalanceResponse> {
    const params = new URLSearchParams();

    // Обязательные параметры
    params.append('zvz_table', filters.zvz_table);
    params.append('rss_table', filters.rss_table);
    params.append('spr_table', filters.spr_table);
    params.append('ost_table', filters.ost_table);

    // Режимы фильтрации - используем только states и types
    if (filters.states_mode) params.append('states_mode', filters.states_mode);
    if (filters.types_mode) params.append('types_mode', 'not_in');

    // Массивы значений фильтров
    if (filters.states && filters.states.length > 0) {
        filters.states.forEach(s => params.append('states', s));
    }
    params.append('types', 'СПТ');

    // Даты
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    return apiRequest<BalanceResponse>('/balance', params);
}
