import React from 'react';
import {Group, Button} from '@mantine/core';
import {IconDownload} from '@tabler/icons-react';

import type {FilterParams} from '@/entities/filter';
import {useExportData} from '@/features/export';

interface ExportButtonsProps {
    filters: FilterParams;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({filters}) => {
    const {
        isExporting,
        handleExportSankey,
        handleExportBalance,
        handleExportDynamics,
        handleExportBalanceReport,
    } = useExportData();

    const items: {label: string; key: string; onClick: () => void}[] = [
        {label: 'Санкей', key: 'Санкей', onClick: () => handleExportSankey(filters)},
        {label: 'Баланс', key: 'Баланс', onClick: () => handleExportBalance(filters)},
        {label: 'Динамика', key: 'Динамика', onClick: () => handleExportDynamics(filters)},
        {label: 'Баланс Отчет ЦТР', key: 'Баланс отчет', onClick: () => handleExportBalanceReport(filters)},
    ];

    return (
        <Group gap="xs">
            {items.map((item) => (
                <Button
                    key={item.key}
                    variant="default"
                    size="compact-sm"
                    leftSection={<IconDownload size={14} />}
                    loading={isExporting === item.key}
                    onClick={item.onClick}
                >
                    {item.label}
                </Button>
            ))}
        </Group>
    );
};

export default ExportButtons;
