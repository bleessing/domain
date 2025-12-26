 import { useMemo } from 'react';
import { useLazyGetBalanceQuery } from '@/entities/balance/api/balanceApiSlice';
import type { BalanceTableItem } from '@/entities/balance';
import type { FilterParams } from '@/entities/filter';

/**
 * Хук для работы с данными баланса через RTK Query
 *
 * Преимущества по сравнению со старым хуком:
 * - Автоматическое кэширование
 * - Автоматический refetch при изменении параметров
 * - Встроенная отмена запросов
 * - Redux DevTools для отладки
 */
export const useBalanceData = () => {
    const [trigger, { data: response, isLoading, error }] = useLazyGetBalanceQuery();

    // Трансформируем данные из API в формат для таблицы
    const data = useMemo<BalanceTableItem[]>(() => {
        if (!response) return [];

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

        return tableData;
    }, [response]);

    const loadData = async (filters: FilterParams) => {
        try {
            await trigger(filters).unwrap();
        } catch (err) {
            console.error('Ошибка загрузки таблицы баланса:', err);
            // error уже содержится в состоянии RTK Query
        }
    };

    return {
        data,
        isLoading,
        error,
        loadData,
    };
};
