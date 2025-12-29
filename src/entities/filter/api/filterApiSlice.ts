import { baseApi } from '@/shared/api/baseApi';
import type { FilterOptions } from '../model/types';

interface FilterOptionsParams {
    zvz_table: string;
    rss_table: string;
    spr_zvz_table: string;
    spr_rss_table: string;
    spr_ov_table: string;
    ov_table?: string;
    leftovers_table?: string;
}

/**
 * RTK Query API slice для работы с фильтрами
 */
export const filterApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получение опций для фильтров
        getFilterOptions: builder.query<FilterOptions, FilterOptionsParams>({
            query: ({ zvz_table, rss_table, spr_zvz_table, spr_rss_table, spr_ov_table, ov_table, leftovers_table }) => {
                // Формируем параметры вручную (без кодирования запятых)
                const queryParams: string[] = [];

                queryParams.push(`zvz_table=${zvz_table}`);
                queryParams.push(`rss_table=${rss_table}`);
                if (ov_table) queryParams.push(`ov_table=${ov_table}`);
                queryParams.push(`spr_rss_table=${spr_rss_table}`);
                queryParams.push(`spr_zvz_table=${spr_zvz_table}`);
                queryParams.push(`spr_ov_table=${spr_ov_table}`);
                if (leftovers_table) queryParams.push(`leftovers_table=${leftovers_table}`);

                const queryString = queryParams.join('&');
                return {
                    url: `/filter?${queryString}`,
                    method: 'GET',
                };
            },
            providesTags: ['Filters'],
        }),
    }),
});

export const {
    useGetFilterOptionsQuery,
    useLazyGetFilterOptionsQuery,
} = filterApi;
