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
    // Формируем параметры вручную (без кодирования запятых)
    const queryParams: string[] = [];

    // Обязательные параметры таблиц
    queryParams.push(`zvz_table=${filters.zvz_table}`);
    queryParams.push(`rss_table=${filters.rss_table}`);
    queryParams.push(`spr_zvz_table=${filters.spr_zvz_table}`);
    queryParams.push(`spr_rss_table=${filters.spr_rss_table}`);
    queryParams.push(`spr_ov_table=${filters.spr_ov_table}`);
    if (filters.ov_table) queryParams.push(`ov_table=${filters.ov_table}`);
    if (filters.ost_table) queryParams.push(`leftovers_table=${filters.ost_table}`);

    if (filters.is_leftovers !== undefined) {
        queryParams.push(`is_leftovers=${filters.is_leftovers.toString()}`);
    }

    // Режимы фильтрации
    queryParams.push(`states_mode=in`);
    if (filters.types_mode) queryParams.push(`types_mode=${filters.types_mode}`);

    // Типы
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => queryParams.push(`types=${t}`));
    }

    // Даты
    if (filters.date_from) queryParams.push(`date_from=${filters.date_from}`);
    if (filters.date_to) queryParams.push(`date_to=${filters.date_to}`);

    // Конкретное состояние
    queryParams.push(`states=${state}`);

    const queryString = queryParams.join('&');
    return apiRequest<DynamicsResponse>(`/dynamics?${queryString}`);
}

/**
 * Получает данные динамики для нескольких состояний
 */
export async function fetchDynamicsData(filters: FilterParams): Promise<DynamicsResponse> {
    // Формируем параметры вручную (без кодирования запятых)
    const queryParams: string[] = [];

    // Обязательные параметры таблиц
    queryParams.push(`zvz_table=${filters.zvz_table}`);
    queryParams.push(`rss_table=${filters.rss_table}`);
    queryParams.push(`spr_zvz_table=${filters.spr_zvz_table}`);
    queryParams.push(`spr_rss_table=${filters.spr_rss_table}`);
    queryParams.push(`spr_ov_table=${filters.spr_ov_table}`);
    if (filters.ov_table) queryParams.push(`ov_table=${filters.ov_table}`);
    if (filters.ost_table) queryParams.push(`leftovers_table=${filters.ost_table}`);

    if (filters.is_leftovers !== undefined) {
        queryParams.push(`is_leftovers=${filters.is_leftovers.toString()}`);
    }

    // Режимы фильтрации
    if (filters.states_mode) queryParams.push(`states_mode=${filters.states_mode}`);
    if (filters.types_mode) queryParams.push(`types_mode=${filters.types_mode}`);

    // Массивы значений фильтров
    if (filters.states && filters.states.length > 0) {
        filters.states.forEach(s => queryParams.push(`states=${s}`));
    }
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => queryParams.push(`types=${t}`));
    }

    // Даты
    if (filters.date_from) queryParams.push(`date_from=${filters.date_from}`);
    if (filters.date_to) queryParams.push(`date_to=${filters.date_to}`);

    const queryString = queryParams.join('&');
    return apiRequest<DynamicsResponse>(`/dynamics?${queryString}`);
}
