import { useState } from 'react';
import { message } from 'antd';
import { fetchDynamicsForState, type DynamicsResponse } from '@/entities/dynamics';
import type { FilterParams } from '@/entities/filter';

export const useDynamicsData = () => {
    const [data, setData] = useState<DynamicsResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadData = async (filters: FilterParams) => {
        setIsLoading(true);
        try {
            // Если нет выбранных состояний, не загружаем данные
            if (!filters.states || filters.states.length === 0) {
                setData(null);
                return;
            }

            // Для динамики ВСЕГДА используем is_leftovers: false
            const dynamicsFilters = {
                ...filters,
                is_leftovers: false,
            };

            // Делаем параллельные запросы для каждого состояния
            const promises = filters.states.map(state =>
                fetchDynamicsForState(dynamicsFilters, state)
            );

            const responses = await Promise.all(promises);

            // Объединяем данные от разных состояний
            const mergedData: DynamicsResponse = {
                dates: responses[0]?.dates || [],
                series: []
            };

            // Для каждого состояния добавляем его серии с префиксом
            responses.forEach((response, index) => {
                const stateName = filters.states![index];
                response.series.forEach(serie => {
                    mergedData.series.push({
                        name: `${stateName} - ${serie.name}`,
                        data: serie.data
                    });
                });
            });

            // Оставляем только первые три серии
            mergedData.series = mergedData.series.slice(0, 3);

            setData(mergedData);
        } catch (error) {
            message.error('Ошибка при загрузке данных динамики');
            console.error('Ошибка загрузки данных динамики:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, loadData };
};
