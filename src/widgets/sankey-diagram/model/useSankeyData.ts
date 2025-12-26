import { useState } from 'react';
import { message } from 'antd';
import { fetchSankeyData, transformBackendDataToSankey, type PlotlySankeyData } from '@/entities/sankey';
import type { FilterParams } from '@/entities/filter';

export const useSankeyData = () => {
    const [data, setData] = useState<PlotlySankeyData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadData = async (filters: FilterParams) => {
        setIsLoading(true);
        try {
            const response = await fetchSankeyData(filters);
            const transformedData = transformBackendDataToSankey(response, filters.states);

            if (transformedData.nodes.length === 0) {
                message.warning('Нет данных для отображения с выбранными фильтрами');
                setData(null);
            } else {
                setData(transformedData);
                message.success('Диаграмма обновлена!');
            }
        } catch (error) {
            message.error('Ошибка при загрузке данных диаграммы');
            console.error('Ошибка загрузки диаграммы:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, loadData };
};
