import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { dynamicsApi } from '@/entities/dynamics/api/dynamicsApiSlice';
import type { DynamicsResponse } from '@/entities/dynamics';
import type { FilterParams } from '@/entities/filter';
import type { AppDispatch } from '@/app/store';

export const useDynamicsData = () => {
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
            // Для динамики ВСЕГДА используем is_leftovers: false
            const dynamicsFilters = { ...filters, is_leftovers: false };

            // Делаем параллельные запросы для каждого состояния через RTK Query (с кэшированием)
            const promises = filters.states.map(state =>
                dispatch(dynamicsApi.endpoints.getDynamicsForState.initiate({ filters: dynamicsFilters, state })).unwrap()
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

            // Оставляем только первые три серии
            mergedData.series = mergedData.series.slice(0, 3);

            setData(mergedData);
        } catch (error) {
            notifications.show({ color: 'brandRed', message: 'Ошибка при загрузке данных динамики' });
            console.error('Ошибка загрузки данных динамики:', error);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    return { data, isLoading, loadData };
};
