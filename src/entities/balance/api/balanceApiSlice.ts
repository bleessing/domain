import { baseApi } from '@/shared/api/baseApi';
import type { FilterParams } from '@/entities/filter';
import type { BalanceResponse } from '../model/types';
import { buildFilterQuery } from '@/shared/lib/queryBuilder';

const BALANCE_OPTIONS = {
    modes: ['states_mode', 'types_mode'] as const,
    arrays: ['states', 'types'] as const,
};

export const balanceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBalance: builder.query<BalanceResponse, FilterParams>({
            query: (filters) => `/balance?${buildFilterQuery(filters, BALANCE_OPTIONS)}`,
            providesTags: ['Balance'],
        }),
    }),
});

export const { useGetBalanceQuery, useLazyGetBalanceQuery } = balanceApi;
