import React from 'react';
import { Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useExportData } from '../model/useExportData';
import type { FilterParams } from '@/entities/filter';

interface ExportButtonsProps {
    filters: FilterParams;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ filters }) => {
    const { isExporting, handleExportSankey, handleExportBalance, handleExportDynamics } = useExportData();

    return (
        <Space direction="horizontal" size="small" wrap>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'sankey'}
                onClick={() => handleExportSankey(filters)}
                size="small"
            >
                Sankey
            </Button>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'balance'}
                onClick={() => handleExportBalance(filters)}
                size="small"
            >
                Balance
            </Button>
            <Button
                type="default"
                icon={<DownloadOutlined />}
                loading={isExporting === 'dynamics'}
                onClick={() => handleExportDynamics(filters)}
                size="small"
            >
                Dynamics
            </Button>
        </Space>
    );
};

export default ExportButtons;
