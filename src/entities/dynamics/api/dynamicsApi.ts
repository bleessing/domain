import { apiRequest } from '@/shared/api/client';
import type { FilterParams } from '@/entities/filter';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';
import type { DynamicsResponse } from '../model/types';

/**
 * Получает данные динамики для одного состояния
 */
export async function fetchDynamicsForState(
    filters: FilterParams,
    state: string
): Promise<DynamicsResponse> {
    const baseQuery = buildFilterQuery(filters, {
        ostTableKey: 'leftovers_table',
        includeIsLeftovers: true,
        staticParams: { states_mode: 'in' },
        modes: ['types_mode'],
        arrays: ['types'],
    });
    return apiRequest<DynamicsResponse>(`/dynamics?${baseQuery}&states=${state}`);
}

/**
 * Получает данные динамики для нескольких состояний
 */
export async function fetchDynamicsData(filters: FilterParams): Promise<DynamicsResponse> {
    const queryString = buildFilterQuery(filters, {
        ostTableKey: 'leftovers_table',
        includeIsLeftovers: true,
        modes: ['states_mode', 'types_mode'],
        arrays: ['states', 'types'],
    });
    return apiRequest<DynamicsResponse>(`/dynamics?${queryString}`);
}
