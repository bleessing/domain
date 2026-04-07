import { API_HEADERS } from '@/shared/lib/constants';
import type { FilterParams } from '@/entities/filter';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';

export async function exportSankeyData(filters: FilterParams): Promise<Blob> {
    const queryString = buildFilterQuery(filters, {
        ostTableKey: 'leftovers_table',
        modes: ['sources_mode', 'targets_mode', 'diameters_mode', 'types_mode', 'states_mode'],
        arrays: ['sources', 'targets', 'diameters', 'types', 'states'],
    });

    const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/export/sankey?${queryString}`,
        { method: 'GET', headers: API_HEADERS },
    );

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return response.blob();
}
