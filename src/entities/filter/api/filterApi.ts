import { apiRequest } from '@/shared/api/client';
import type { FilterOptions } from '../model/types';

export async function fetchFilterOptions(
    zvz_table: string,
    rss_table: string,
    spr_table: string,
    ost_table: string,
): Promise<FilterOptions> {
    const params = new URLSearchParams({
        zvz_table,
        rss_table,
        spr_table,
        ost_table,
    });

    return apiRequest<FilterOptions>('/filter', params);
}
