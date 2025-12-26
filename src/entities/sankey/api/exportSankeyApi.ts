import { API_BASE_URL, API_HEADERS } from '@/shared/lib/constants';
import type { FilterParams } from '@/entities/filter';

export async function exportSankeyData(filters: FilterParams): Promise<Blob> {
    const params = new URLSearchParams();

    // Обязательные параметры
    params.append('zvz_table', filters.zvz_table);
    params.append('rss_table', filters.rss_table);
    params.append('spr_table', filters.spr_table);
    if (filters.ost_table) params.append('leftovers_table', filters.ost_table);

    // Режимы фильтрации
    if (filters.sources_mode) params.append('sources_mode', filters.sources_mode);
    if (filters.targets_mode) params.append('targets_mode', filters.targets_mode);
    if (filters.diameters_mode) params.append('diameters_mode', filters.diameters_mode);
    if (filters.types_mode) params.append('types_mode', filters.types_mode);
    if (filters.states_mode) params.append('states_mode', filters.states_mode);

    // Массивы значений фильтров
    if (filters.sources && filters.sources.length > 0) {
        filters.sources.forEach(s => params.append('sources', s));
    }
    if (filters.targets && filters.targets.length > 0) {
        filters.targets.forEach(t => params.append('targets', t));
    }
    if (filters.diameters && filters.diameters.length > 0) {
        filters.diameters.forEach(d => params.append('diameters', d));
    }
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => params.append('types', t));
    }
    if (filters.states && filters.states.length > 0) {
        filters.states.forEach(s => params.append('states', s));
    }

    // Даты
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const url = `${API_BASE_URL}/export/sankey?${params.toString()}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: API_HEADERS,
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
}
