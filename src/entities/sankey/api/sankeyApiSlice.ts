import { baseApi } from '@/shared/api/baseApi';
import type { FilterParams } from '@/entities/filter';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';

const SANKEY_OPTIONS = {
    ostTableKey: 'leftovers_table' as const,
    modes: ['sources_mode', 'targets_mode', 'diameters_mode', 'types_mode', 'states_mode'] as const,
    arrays: ['sources', 'targets', 'diameters', 'types', 'states'] as const,
};

export const sankeyApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSankey: builder.query<unknown, FilterParams>({
            query: (filters) => `/sankey?${buildFilterQuery(filters, SANKEY_OPTIONS)}`,
            providesTags: ['Sankey'],
        }),
    }),
});

export const { useGetSankeyQuery, useLazyGetSankeyQuery } = sankeyApi;
