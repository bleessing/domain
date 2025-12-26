import { useState } from 'react';
import { message } from 'antd';
import { fetchBalanceData, type BalanceTableItem } from '@/entities/balance';
import type { FilterParams } from '@/entities/filter';

export const useBalanceData = () => {
    const [data, setData] = useState<BalanceTableItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadData = async (filters: FilterParams) => {
        setIsLoading(true);
        try {
            const response = await fetchBalanceData(filters);

            // Преобразуем данные из API в формат для таблицы
            const tableData: BalanceTableItem[] = [];
            let keyIndex = 0;

            response.states.forEach(stateItem => {
                // Добавляем обычные строки
                stateItem.flows.forEach(flow => {
                    tableData.push({
                        key: `${keyIndex++}`,
                        state: stateItem.state,
                        flow: flow.flow,
                        income: flow.income,
                        expense: flow.expense,
                        balance: flow.balance,
                        isTotal: false,
                    });
                });

                // Добавляем итоговую строку для состояния
                if (stateItem.total) {
                    tableData.push({
                        key: `${keyIndex++}`,
                        state: stateItem.state,
                        flow: stateItem.total.flow,
                        income: stateItem.total.income,
                        expense: stateItem.total.expense,
                        balance: stateItem.total.balance,
                        isTotal: true,
                    });
                }
            });

            setData(tableData);
        } catch (error) {
            message.error('Ошибка при загрузке данных таблицы');
            console.error('Ошибка загрузки таблицы баланса:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, loadData };
};
