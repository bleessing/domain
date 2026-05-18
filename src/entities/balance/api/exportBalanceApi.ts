import { API_BASE_URL, API_HEADERS } from '@/shared/lib/constants';
import type { FilterParams } from '@/entities/filter';
import { buildFilterQuery, type FilterQueryOptions } from '@/shared/lib/queryBuilder';

const BALANCE_EXPORT_OPTIONS: FilterQueryOptions = {
    // Бэк /export/balance принимает обе таблицы: ost_table_start и ost_table_end
    ostTableMode: 'both',
    modes: ['states_mode', 'types_mode'],
    arrays: ['states', 'types'],
};

async function fetchExportBlob(url: string): Promise<Blob> {
    const response = await fetch(url, { method: 'GET', headers: API_HEADERS });
    if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }
    return response.blob();
}

export async function exportBalanceData(filters: FilterParams): Promise<Blob> {
    const queryString = buildFilterQuery(filters, BALANCE_EXPORT_OPTIONS);
    return fetchExportBlob(`${API_BASE_URL}/export/balance?${queryString}`);
}

export async function exportBalanceReportData(filters: FilterParams): Promise<Blob> {
    const queryString = buildFilterQuery(filters, BALANCE_EXPORT_OPTIONS);
    return fetchExportBlob(`${API_BASE_URL}/export/balance-report?${queryString}`);
}
