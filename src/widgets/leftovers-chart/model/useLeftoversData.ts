import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { message } from 'antd';
import { dynamicsApi } from '@/entities/dynamics/api/dynamicsApiSlice';
import type { DynamicsResponse } from '@/entities/dynamics';
import type { FilterParams } from '@/entities/filter';
import type { AppDispatch } from '@/app/store';

export const useLeftoversData = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [data, setData] = useState<DynamicsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadData = useCallback(async (filters: FilterParams) => {
        if (!filters.states?.length) {
            setData(null);
            return;
        }

        setIsLoading(true);
        try {
            // Делаем параллельные запросы для каждого состояния через RTK Query (с кэшированием)
            // is_leftovers передаётся из filters (DashboardPage устанавливает true для остатков)
            const promises = filters.states.map(state =>
                dispatch(dynamicsApi.endpoints.getDynamicsForState.initiate({ filters, state })).unwrap()
            );

            const responses = await Promise.all(promises);

            // Объединяем данные от разных состояний
            const mergedData: DynamicsResponse = { dates: responses[0]?.dates || [], series: [] };

            responses.forEach((response, index) => {
                const stateName = filters.states![index];
                response.series.forEach(serie => {
                    mergedData.series.push({ name: `${stateName} - ${serie.name}`, data: serie.data });
                });
            });

            setData(mergedData);
        } catch (error) {
            message.error('Ошибка при загрузке данных графика баланса');
            console.error('Ошибка загрузки данных графика баланса:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    return { data, isLoading, loadData };
};
