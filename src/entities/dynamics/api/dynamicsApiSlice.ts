import { baseApi } from '@/shared/api/baseApi';
import type { FilterParams } from '@/entities/filter';
import type { DynamicsResponse } from '../model/types';

/**
 * RTK Query API slice для работы с динамикой
 */
export const dynamicsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Получение данных динамики для одного состояния
        getDynamicsForState: builder.query<DynamicsResponse, { filters: FilterParams; state: string }>({
            query: ({ filters, state }) => {
                const params = new URLSearchParams();

                params.append('zvz_table', filters.zvz_table);
                params.append('rss_table', filters.rss_table);
                params.append('spr_table', filters.spr_table);
                if (filters.ost_table) params.append('leftovers_table', filters.ost_table);

                params.append('states', state);
                params.append('states_mode', 'include');

                if (filters.is_leftovers !== undefined) {
                    params.append('is_leftovers', String(filters.is_leftovers));
                }

                if (filters.types_mode) params.append('types_mode', filters.types_mode);
                if (filters.types && filters.types.length > 0) {
                    filters.types.forEach(t => params.append('types', t));
                }

                if (filters.date_from) params.append('date_from', filters.date_from);
                if (filters.date_to) params.append('date_to', filters.date_to);

                return {
                    url: `/dynamics?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: (_result, _error, { state }) => [{ type: 'Dynamics', id: state }],
        }),

        // Экспорт данных динамики
        exportDynamics: builder.mutation<Blob, FilterParams>({
            query: (filters) => {
                const params = new URLSearchParams();

                params.append('zvz_table', filters.zvz_table);
                params.append('rss_table', filters.rss_table);
                params.append('spr_table', filters.spr_table);
                if (filters.ost_table) params.append('leftovers_table', filters.ost_table);

                params.append('is_leftovers', 'true');

                if (filters.states_mode) params.append('states_mode', filters.states_mode);
                if (filters.types_mode) params.append('types_mode', filters.types_mode);

                if (filters.states && filters.states.length > 0) {
                    filters.states.forEach(s => params.append('states', s));
                }
                if (filters.types && filters.types.length > 0) {
                    filters.types.forEach(t => params.append('types', t));
                }

                if (filters.date_from) params.append('date_from', filters.date_from);
                if (filters.date_to) params.append('date_to', filters.date_to);

                return {
                    url: `/export/dynamics?${params.toString()}`,
                    method: 'GET',
                    responseHandler: (response) => response.blob(),
                };
            },
        }),
    }),
});

export const {
    useGetDynamicsForStateQuery,
    useLazyGetDynamicsForStateQuery,
    useExportDynamicsMutation,
} = dynamicsApi;
