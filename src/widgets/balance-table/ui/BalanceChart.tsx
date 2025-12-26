import Plot from 'react-plotly.js';
import type { Config } from 'plotly.js';

interface DataType {
    key: string;
    flow: string;
    income: number;
    expense: number;
    balance: number;
    state: string;
}

interface BalanceChartProps {
    data: DataType[];
    groupBy?: 'state' | 'flow';
    title?: string;
}

interface PlotTrace {
    x: string[];
    y: number[];
    name: string;
    type: 'scatter';
    mode: 'lines+markers';
    line: { color: string; width: number; dash?: string };
    marker: { size: number };
    legendgroup: string;
}

interface BalanceLayout {
    title: { text: string };
    xaxis: {
        title: string;
        autorange: boolean;
        tickangle: number;
    };
    yaxis: {
        title: string;
        autorange: boolean;
    };
    hovermode: 'closest';
    legend: {
        orientation: 'v';
        x: number;
        y: number;
        xanchor: 'left';
    };
    width: number;
    height: number;
    paper_bgcolor: string;
    plot_bgcolor: string;
    margin: { l: number; r: number; t: number; b: number };
}

type BalanceConfig = Partial<Config>;

const BalanceChart: React.FC<BalanceChartProps> = ({
    data,
    groupBy = 'state',
    title = 'Динамика баланса'
}) => {
    if (!data || data.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных для отображения графика</p>
            </div>
        );
    }

    // Группируем данные
    const groupedData = new Map<string, DataType[]>();

    data.forEach(item => {
        const key = groupBy === 'state' ? item.state : item.flow;
        if (!groupedData.has(key)) {
            groupedData.set(key, []);
        }
        groupedData.get(key)!.push(item);
    });

    // Создаем трейсы для графика
    const traces: PlotTrace[] = [];
    const colors = {
        income: '#2ca02c',  // зеленый для прихода
        expense: '#d62728', // красный для расхода
        balance: '#1f77b4'  // синий для баланса
    };

    groupedData.forEach((items, groupName) => {
        // Сортируем по потокам/состояниям для лучшей читаемости
        const sortedItems = [...items].sort((a, b) => {
            const compareKey = groupBy === 'state' ? 'flow' : 'state';
            return a[compareKey].localeCompare(b[compareKey]);
        });

        const xLabels = sortedItems.map(item =>
            groupBy === 'state' ? item.flow : item.state
        );

        // Трейс для прихода
        traces.push({
            x: xLabels,
            y: sortedItems.map(item => item.income),
            name: `${groupName} - Приход`,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: colors.income, width: 2 },
            marker: { size: 6 },
            legendgroup: groupName,
        });

        // Трейс для расхода
        traces.push({
            x: xLabels,
            y: sortedItems.map(item => item.expense),
            name: `${groupName} - Расход`,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: colors.expense, width: 2 },
            marker: { size: 6 },
            legendgroup: groupName,
        });

        // Трейс для баланса
        traces.push({
            x: xLabels,
            y: sortedItems.map(item => item.balance),
            name: `${groupName} - Баланс`,
            type: 'scatter',
            mode: 'lines+markers',
            line: { color: colors.balance, width: 2, dash: 'dot' },
            marker: { size: 6 },
            legendgroup: groupName,
        });
    });

    const layout: BalanceLayout = {
        title: { text: title },
        xaxis: {
            title: groupBy === 'state' ? 'Поток' : 'Состояние',
            autorange: true,
            tickangle: -45,
        },
        yaxis: {
            title: 'Сумма',
            autorange: true,
        },
        hovermode: 'closest',
        legend: {
            orientation: 'v',
            x: 1.02,
            y: 1,
            xanchor: 'left',
        },
        width: 1200,
        height: 600,
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#f9f9f9',
        margin: { l: 60, r: 200, t: 60, b: 120 },
    };

    const config: BalanceConfig = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
    };

    return (
        <Plot
            data={traces as any}
            layout={layout as any}
            config={config}
        />
    );
};

export default BalanceChart;
