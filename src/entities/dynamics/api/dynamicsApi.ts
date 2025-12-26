import { apiRequest } from '@/shared/api/client';
import type { FilterParams } from '@/entities/filter';
import type { DynamicsResponse } from '../model/types';

/**
 * Получает данные динамики для одного состояния
 */
export async function fetchDynamicsForState(
    filters: FilterParams,
    state: string
): Promise<DynamicsResponse> {
    const params = new URLSearchParams();

    // Обязательные параметры
    params.append('zvz_table', filters.zvz_table);
    params.append('rss_table', filters.rss_table);
    params.append('spr_table', filters.spr_table);
    params.append('leftovers_table', filters.ost_table);

    if (filters.is_leftovers !== undefined) {
        params.append('is_leftovers', filters.is_leftovers.toString());
    }

    // Режимы фильтрации
    params.append('states_mode', 'in');
    if (filters.types_mode) params.append('types_mode', filters.types_mode);

    // Типы
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => params.append('types', t));
    }

    // Даты
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    // Конкретное состояние
    params.append('states', state);

    return apiRequest<DynamicsResponse>('/dynamics', params);
}

/**
 * Получает данные динамики для нескольких состояний
 */
export async function fetchDynamicsData(filters: FilterParams): Promise<DynamicsResponse> {
    const params = new URLSearchParams();

    // Обязательные параметры
    params.append('zvz_table', filters.zvz_table);
    params.append('rss_table', filters.rss_table);
    params.append('spr_table', filters.spr_table);
    params.append('leftovers_table', filters.ost_table);


    if (filters.is_leftovers !== undefined) {
        params.append('is_leftovers', filters.is_leftovers.toString());
    }

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

    return apiRequest<DynamicsResponse>('/dynamics', params);
}
