import { apiRequest } from '@/shared/api/client';
import type { FilterOptions } from '../model/types';

export async function fetchFilterOptions(
    zvz_table: string,
    rss_table: string,
    spr_rss_table: string,
    spr_zvz_table: string,
    spr_ov_table: string,
    ov_table?: string,
    ost_table?: string,
): Promise<FilterOptions> {
    // Формируем параметры вручную (без кодирования запятых)
    const queryParams: string[] = [];
    queryParams.push(`zvz_table=${zvz_table}`);
    queryParams.push(`rss_table=${rss_table}`);
    if (ov_table) queryParams.push(`ov_table=${ov_table}`);
    queryParams.push(`spr_rss_table=${spr_rss_table}`);
    queryParams.push(`spr_zvz_table=${spr_zvz_table}`);
    queryParams.push(`spr_ov_table=${spr_ov_table}`);
    if (ost_table) queryParams.push(`ost_table=${ost_table}`);

    const queryString = queryParams.join('&');
    return apiRequest<FilterOptions>(`/filter?${queryString}`);
}
