import React, { memo, useMemo } from 'react';
import { Table, type TableProps } from 'antd';
import type { BalanceTableItem } from '@/entities/balance';

interface BalanceTableProps {
    data: BalanceTableItem[];
}

const BalanceTable: React.FC<BalanceTableProps> = ({ data }) => {
    const columns: TableProps<BalanceTableItem>['columns'] = useMemo(() => [
        {
            title: 'Состояние',
            dataIndex: 'state',
            key: 'state',
            width: 200,
            filters: Array.from(new Set(data.map(item => item.state)))
                .sort()
                .map(state => ({ text: state, value: state })),
            onFilter: (value, record) => record.state === value,
            filterSearch: true,
        },
        {
            title: 'Поток',
            dataIndex: 'flow',
            key: 'flow',
            width: 400,
            filters: Array.from(new Set(data.map(item => item.flow)))
                .sort()
                .map(flow => ({ text: flow, value: flow })),
            onFilter: (value, record) => record.flow === value,
            filterSearch: true,
        },
        {
            title: 'Приход',
            dataIndex: 'income',
            key: 'income',
            width: 120,
            align: 'right',
            sorter: (a, b) => a.income - b.income,
            render: (value: number) => (
                <span style={{ color: '#2ca02c', fontWeight: 500 }}>{value}</span>
            ),
        },
        {
            title: 'Расход',
            dataIndex: 'expense',
            key: 'expense',
            width: 120,
            align: 'right',
            sorter: (a, b) => a.expense - b.expense,
            render: (value: number) => (
                <span style={{ color: '#d62728', fontWeight: 500 }}>{value}</span>
            ),
        },
        {
            title: 'Баланс',
            dataIndex: 'balance',
            key: 'balance',
            width: 120,
            align: 'right',
            sorter: (a, b) => a.balance - b.balance,
        },
    ], [data]);

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Всего: ${total} записей`,
            }}
            bordered
            size="small"
            scroll={{ x: 'max-content' }}
            rowClassName={(record) => record.isTotal ? 'total-row' : ''}
        />
    );
};

export default memo(BalanceTable);
