import { fetchDynamicsForState } from '@/entities/dynamics';
import type { FilterParams } from '@/entities/filter';
import type { DynamicsResponse } from '@/entities/dynamics';

/**
 * Получает данные остатков (leftovers) для одного состояния
 * Это обертка над dynamics API с гарантированным is_leftovers параметром
 */
export async function fetchLeftoversForState(
    filters: FilterParams,
    state: string
): Promise<DynamicsResponse> {
    return fetchDynamicsForState(
        {
            ...filters,
            is_leftovers: filters.is_leftovers ?? false, // используем значение из filters или false по умолчанию
        },
        state
    );
}
