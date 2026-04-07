import { useMemo } from 'react';
import { useLazyGetBalanceQuery } from '@/entities/balance/api/balanceApiSlice';
import type { BalanceTableItem } from '@/entities/balance';
import type { FilterParams } from '@/entities/filter';

export const useBalanceData = () => {
    const [trigger, { data: response, isLoading }] = useLazyGetBalanceQuery();

    const data = useMemo<BalanceTableItem[]>(() => {
        if (!response) return [];

        const tableData: BalanceTableItem[] = [];
        let keyIndex = 0;

        response.states.forEach(stateItem => {
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

    const loadData = (filters: FilterParams) => trigger(filters).unwrap();

    return { data, isLoading, loadData };
};
