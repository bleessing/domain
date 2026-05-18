import { baseApi } from '@/shared/api/baseApi';
import type { FilterParams } from '@/entities/filter';
import type { WaterfallResponse } from '../model/types';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';

const WATERFALL_OPTIONS = {
    ostTableMode: 'both' as const,
    modes: ['sources_mode', 'targets_mode', 'diameters_mode', 'types_mode', 'states_mode'] as const,
    arrays: ['sources', 'targets', 'diameters', 'types', 'states'] as const,
};

export const waterfallApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWaterfall: builder.query<WaterfallResponse, FilterParams>({
            query: (filters) => `/waterfall?${buildFilterQuery(filters, WATERFALL_OPTIONS)}`,
            providesTags: ['Waterfall'],
        }),
    }),
});

export const { useGetWaterfallQuery, useLazyGetWaterfallQuery } = waterfallApi;
