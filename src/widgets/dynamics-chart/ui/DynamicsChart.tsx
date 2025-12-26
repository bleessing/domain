import Plot from 'react-plotly.js';
import type { DynamicsResponse } from '@/entities/dynamics';
import type { Config } from 'plotly.js';

interface DynamicsChartProps {
    data: DynamicsResponse;
    title?: string;
    chartType?: 'bar' | 'line';
}

interface DynamicsTrace {
    x: string[];
    y: number[];
    name: string;
    type: 'bar' | 'scatter';
    mode?: 'lines';
    marker: {
        color: string;
    };
    line?: {
        color: string;
        width: number;
    };
}

interface PlotLayout {
    title: { text: string };
    xaxis: {
        title: string;
        type: 'date';
        tickformat: string;
        tickangle: number;
    };
    yaxis: {
        title: string;
        autorange: boolean;
    };
    barmode?: 'group';
    hovermode: 'x unified';
    legend: {
        orientation: 'h';
        x: number;
        xanchor: 'center';
        y: number;
        yanchor: 'top';
    };
    autosize: boolean;
    width: number;
    height: number;
    paper_bgcolor: string;
    plot_bgcolor: string;
    margin: { l: number; r: number; t: number; b: number };
}

type PlotConfig = Partial<Config>;

const DynamicsChart: React.FC<DynamicsChartProps> = ({
    data,
    title = 'Динамика по датам',
    chartType = 'bar'
}) => {
    if (!data || !data.dates || data.dates.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных для отображения гистограммы</p>
            </div>
        );
    }

    // Функция для определения цвета на основе типа метрики
    const getColorForSeries = (name: string): string => {
        if (name.includes('Приход')) return '#2ca02c';  // зеленый
        if (name.includes('Расход')) return '#d62728';  // красный
        if (name.includes('Баланс')) return '#1f77b4';  // синий
        return '#8884d8'; // дефолтный цвет
    };

    // Создаем трейсы для Plotly
    const traces: DynamicsTrace[] = data.series.map(series => {
        const color = getColorForSeries(series.name);
        return {
            x: data.dates,
            y: series.data,
            name: series.name,
            type: chartType === 'bar' ? 'bar' : 'scatter',
            mode: chartType === 'line' ? 'lines' : undefined,
            marker: {
                color: color,
            },
            line: chartType === 'line' ? {
                color: color,
                width: 2
            } : undefined,
        };
    });

    const layout: PlotLayout = {
        title: { text: title },
        xaxis: {
            title: 'Дата',
            type: 'date',
            tickformat: '%Y-%m-%d',
            tickangle: -25,
        },
        yaxis: {
            title: 'Количество (шт)',
            autorange: true,
        },
        barmode: chartType === 'bar' ? 'group' : undefined,
        hovermode: 'x unified',
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: 1.15,
            yanchor: 'top',
        },
        autosize: true,
        width: 1440,
        height: 650,
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#f9f9f9',
        margin: { l: 60, r: 40, t: 140, b: 80 },
    };

    const config: PlotConfig = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    };

    return (
        <Plot
            data={traces as any}
            layout={layout as any}
            config={config}
        />
    );
};

export default DynamicsChart;
