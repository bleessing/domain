import { API_BASE_URL, API_HEADERS } from '@/shared/lib/constants';
import type { FilterParams } from '@/entities/filter';

export async function exportSankeyData(filters: FilterParams): Promise<Blob> {
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

    // Режимы фильтрации
    if (filters.sources_mode) queryParams.push(`sources_mode=${filters.sources_mode}`);
    if (filters.targets_mode) queryParams.push(`targets_mode=${filters.targets_mode}`);
    if (filters.diameters_mode) queryParams.push(`diameters_mode=${filters.diameters_mode}`);
    if (filters.types_mode) queryParams.push(`types_mode=${filters.types_mode}`);
    if (filters.states_mode) queryParams.push(`states_mode=${filters.states_mode}`);

    // Массивы значений фильтров
    if (filters.sources && filters.sources.length > 0) {
        filters.sources.forEach(s => queryParams.push(`sources=${s}`));
    }
    if (filters.targets && filters.targets.length > 0) {
        filters.targets.forEach(t => queryParams.push(`targets=${t}`));
    }
    if (filters.diameters && filters.diameters.length > 0) {
        filters.diameters.forEach(d => queryParams.push(`diameters=${d}`));
    }
    if (filters.types && filters.types.length > 0) {
        filters.types.forEach(t => queryParams.push(`types=${t}`));
    }
    if (filters.states && filters.states.length > 0) {
        filters.states.forEach(s => queryParams.push(`states=${s}`));
    }

    // Даты
    if (filters.date_from) queryParams.push(`date_from=${filters.date_from}`);
    if (filters.date_to) queryParams.push(`date_to=${filters.date_to}`);

    const queryString = queryParams.join('&');
    const url = `${API_BASE_URL}/export/sankey?${queryString}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: API_HEADERS,
    });

    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
}
