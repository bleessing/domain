import React from 'react';
import { Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useExportData } from '../model/useExportData';
import type { FilterParams } from '@/entities/filter';

interface ExportButtonsProps {
    filters: FilterParams;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ filters }) => {
    const { isExporting, handleExportSankey, handleExportBalance, handleExportDynamics, handleExportBalanceReport } = useExportData();

    return (
        <Space  size="small" wrap>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'Санкей'}
                onClick={() => handleExportSankey(filters)}
                size="small"
            >
                Санкей
            </Button>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'Баланс'}
                onClick={() => handleExportBalance(filters)}
                size="small"
            >
                Баланс
            </Button>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'Динамика'}
                onClick={() => handleExportDynamics(filters)}
                size="small"
            >
                Динамика
            </Button>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'Баланс отчет'}
                onClick={() => handleExportBalanceReport(filters)}
                size="small"
            >
                Баланс Отчет ЦТР
            </Button>
        </Space>
    );
};

export default ExportButtons;
