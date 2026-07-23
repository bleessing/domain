import { baseApi } from '@/shared/api/baseApi';
import type { FilterParams } from '@/entities/filter';
import type { DynamicsResponse } from '../model/types';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';

const DYNAMICS_OPTIONS = {
    ostTableKey: 'leftovers_table' as const,
    includeIsLeftovers: true,
    modes: ['types_mode'] as const,
    arrays: ['types'] as const,
    staticParams: { states_mode: 'in' },
};


export const dynamicsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDynamicsForState: builder.query<DynamicsResponse, { filters: FilterParams; state: string }>({
            query: ({ filters, state }) =>
                `/dynamics?${buildFilterQuery(filters, DYNAMICS_OPTIONS)}&states=${state}`,
            providesTags: (_result, _error, { state }) => [{ type: 'Dynamics', id: state }],
        }),
    }),
});
export const { useGetDynamicsForStateQuery, useLazyGetDynamicsForStateQuery } = dynamicsApi;
