import { useState } from 'react';
import { message } from 'antd';
import { fetchLeftoversForState, type DynamicsResponse } from '@/entities/leftovers';
import type { FilterParams } from '@/entities/filter';

export const useLeftoversData = () => {
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

            // Делаем параллельные запросы для каждого состояния
            const promises = filters.states.map(state =>
                fetchLeftoversForState(filters, state)
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

            setData(mergedData);
        } catch (error) {
            message.error('Ошибка при загрузке данных графика баланса');
            console.error('Ошибка загрузки данных графика баланса:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, loadData };
};
