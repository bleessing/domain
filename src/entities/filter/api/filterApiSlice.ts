import { baseApi } from '@/shared/api/baseApi';
import type { FilterOptions } from '../model/types';

interface FilterOptionsParams {
    zvz_table: string;
    rss_table: string;
    spr_table: string;
    leftovers_table?: string;
}

/**
 * RTK Query API slice для работы с фильтрами
 */
export const filterApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получение опций для фильтров
        getFilterOptions: builder.query<FilterOptions, FilterOptionsParams>({
            query: ({ zvz_table, rss_table, spr_table, leftovers_table }) => {
                const params = new URLSearchParams();

                params.append('zvz_table', zvz_table);
                params.append('rss_table', rss_table);
                params.append('spr_table', spr_table);
                if (leftovers_table) {
                    params.append('leftovers_table', leftovers_table);
                }

                return {
                    url: `/filters?${params.toString()}`,
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
