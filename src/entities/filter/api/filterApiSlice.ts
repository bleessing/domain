import { baseApi } from '@/shared/api/baseApi';
import type { FilterOptions } from '../model/types';

export interface FilterOptionsParams {
    zvz_table: string;
    rss_table: string;
    og_table?: string;
    vg_table?: string;
}

export const filterApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFilterOptions: builder.query<FilterOptions, FilterOptionsParams>({
            query: ({ zvz_table, rss_table, og_table, vg_table }) => {
                const params = [`zvz_table=${zvz_table}`, `rss_table=${rss_table}`];
                if (og_table) params.push(`og_table=${og_table}`);
                if (vg_table) params.push(`vg_table=${vg_table}`);
                return `/filter?${params.join('&')}`;
            },
            providesTags: ['Filters'],
        }),
    }),
});

export const { useGetFilterOptionsQuery } = filterApi;
