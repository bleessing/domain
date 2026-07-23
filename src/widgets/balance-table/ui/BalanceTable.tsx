import React, {memo, useMemo, useState} from 'react';
import {Table, ScrollArea, Text, UnstyledButton, Group, Paper} from '@mantine/core';
import {IconChevronUp, IconChevronDown, IconSelector} from '@tabler/icons-react';
import type {BalanceTableItem} from '@/entities/balance';
import {nc} from '@/shared/lib/mantineTheme';

interface BalanceTableProps {
    data: BalanceTableItem[];
}

type NumericKey = 'income' | 'expense' | 'balance';
type SortState = {key: NumericKey; desc: boolean} | null;

function SortableTh({
    label,
    sortKey,
    sort,
    onSort,
}: {
    label: string;
    sortKey: NumericKey;
    sort: SortState;
    onSort: (key: NumericKey) => void;
}) {
    const active = sort?.key === sortKey;
    const Icon = active ? (sort.desc ? IconChevronDown : IconChevronUp) : IconSelector;
    return (
        <Table.Th style={{textAlign: 'right'}}>
            <UnstyledButton onClick={() => onSort(sortKey)} style={{width: '100%'}}>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                    <Text size="sm" fw={600} c={nc.text}>{label}</Text>
                    <Icon size={14} color={active ? nc.green : nc.dimmed} />
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}

const BalanceTable: React.FC<BalanceTableProps> = ({data}) => {
    const [sort, setSort] = useState<SortState>(null);

    const handleSort = (key: NumericKey) => {
        setSort((prev) => (prev && prev.key === key ? (prev.desc ? null : {key, desc: true}) : {key, desc: false}));
    };

    // Итоговые строки всегда внизу, остальные — по выбранной сортировке.
    const rows = useMemo(() => {
        const regular = data.filter((r) => !r.isTotal);
        const totals = data.filter((r) => r.isTotal);
        const sorted = sort
            ? [...regular].sort((a, b) => (sort.desc ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key]))
            : regular;
        return [...sorted, ...totals];
    }, [data, sort]);

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <Paper withBorder radius="md" style={{borderColor: nc.border, overflow: 'hidden'}}>
            <ScrollArea>
                <Table highlightOnHover verticalSpacing="xs" horizontalSpacing="md" miw={720}>
                    <Table.Thead style={{background: nc.panel}}>
                        <Table.Tr>
                            <Table.Th style={{width: 200}}>
                                <Text size="sm" fw={600} c={nc.text}>Состояние</Text>
                            </Table.Th>
                            <Table.Th style={{width: 400}}>
                                <Text size="sm" fw={600} c={nc.text}>Поток</Text>
                            </Table.Th>
                            <SortableTh label="Приход" sortKey="income" sort={sort} onSort={handleSort} />
                            <SortableTh label="Расход" sortKey="expense" sort={sort} onSort={handleSort} />
                            <SortableTh label="Баланс" sortKey="balance" sort={sort} onSort={handleSort} />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.map((item, index) => (
                            <Table.Tr
                                key={`${item.state}-${item.flow}-${index}`}
                                style={item.isTotal ? {background: nc.panel, fontWeight: 600} : undefined}
                            >
                                <Table.Td>{item.state}</Table.Td>
                                <Table.Td>{item.flow}</Table.Td>
                                <Table.Td style={{textAlign: 'right', color: nc.green, fontWeight: 500}}>
                                    {item.income}
                                </Table.Td>
                                <Table.Td style={{textAlign: 'right', color: nc.red, fontWeight: 500}}>
                                    {item.expense}
                                </Table.Td>
                                <Table.Td style={{textAlign: 'right'}}>{item.balance}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
            <Text size="xs" c="dimmed" p="xs">Всего: {data.length} записей</Text>
        </Paper>
    );
};

export default memo(BalanceTable);
