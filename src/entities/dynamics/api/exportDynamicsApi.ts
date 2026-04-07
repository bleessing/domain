import { API_BASE_URL, API_HEADERS } from '@/shared/lib/constants';
import type { FilterParams } from '@/entities/filter';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';

export async function exportDynamicsData(filters: FilterParams): Promise<Blob> {
    // Для экспорта динамики остатков всегда используем is_leftovers=true
    const queryString = buildFilterQuery(filters, {
        ostTableKey: 'leftovers_table',
        staticParams: { is_leftovers: 'true' },
        modes: ['states_mode', 'types_mode'],
        arrays: ['states', 'types'],
    });

    const response = await fetch(`${API_BASE_URL}/export/dynamics?${queryString}`, {
        method: 'GET',
        headers: API_HEADERS,
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
}
