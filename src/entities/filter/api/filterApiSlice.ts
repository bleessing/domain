import { baseApi } from '@/shared/api/baseApi';
import type { FilterOptions } from '../model/types';

export interface FilterOptionsParams {
    zvz_table: string;
    rss_table: string;
    og_table?: string;
    vg_table?: string;
    /** Тип оборудования с главной страницы — на бэке вытесняет heuristic-detect. */
    equipment_type?: string;
}

export const filterApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFilterOptions: builder.query<FilterOptions, FilterOptionsParams>({
            query: ({ zvz_table, rss_table, og_table, vg_table, equipment_type }) => {
                const enc = encodeURIComponent;
                const params = [`zvz_table=${enc(zvz_table)}`, `rss_table=${enc(rss_table)}`];
                if (og_table) params.push(`og_table=${enc(og_table)}`);
                if (vg_table) params.push(`vg_table=${enc(vg_table)}`);
                if (equipment_type) params.push(`equipment_type=${enc(equipment_type)}`);
                return `/filter?${params.join('&')}`;
            },
            providesTags: ['Filters'],
        }),
    }),
});

export const { useGetFilterOptionsQuery } = filterApi;
