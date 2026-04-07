import { useState } from 'react';
import { message } from 'antd';
import { exportSankeyData } from '@/entities/sankey';
import { exportBalanceData, exportBalanceReportData } from '@/entities/balance';
import { exportDynamicsData } from '@/entities/dynamics';
import type { FilterParams } from '@/entities/filter';

export const useExportData = () => {
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const downloadFile = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleExportSankey = async (filters: FilterParams) => {
        setIsExporting('Санкей');
        try {
            const blob = await exportSankeyData(filters);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadFile(blob, `sankey_${timestamp}.xlsx`);
            message.success('Sankey данные успешно экспортированы в Excel');
        } catch (error) {
            message.error('Ошибка при экспорте Sankey данных');
            console.error('Export Sankey error:', error);
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportBalance = async (filters: FilterParams) => {
        setIsExporting('Баланс');
        try {
            const blob = await exportBalanceData(filters);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadFile(blob, `balance_${timestamp}.xlsx`);
            message.success('Balance данные успешно экспортированы в Excel');
        } catch (error) {
            message.error('Ошибка при экспорте Balance данных');
            console.error('Export Balance error:', error);
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportDynamics = async (filters: FilterParams) => {
        setIsExporting('Динамика');
        try {
            const blob = await exportDynamicsData(filters);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadFile(blob, `dynamics_${timestamp}.xlsx`);
            message.success('Dynamics данные успешно экспортированы в Excel');
        } catch (error) {
            message.error('Ошибка при экспорте Dynamics данных');
            console.error('Export Dynamics error:', error);
        } finally {
            setIsExporting(null);
        }
    };

    const handleExportBalanceReport = async (filters: FilterParams) => {
        setIsExporting('Баланс отчет');
        try {
            const blob = await exportBalanceReportData(filters);
            const timestamp = new Date().toISOString().split('T')[0];
            downloadFile(blob, `balance_report_${timestamp}.xlsx`);
            message.success('Отчет баланса успешно экспортирован в Excel');
        } catch (error) {
            message.error('Ошибка при экспорте отчета баланса');
            console.error('Export Balance Report error:', error);
        } finally {
            setIsExporting(null);
        }
    };

    return {
        isExporting,
        handleExportSankey,
        handleExportBalance,
        handleExportDynamics,
        handleExportBalanceReport,
    };
};
