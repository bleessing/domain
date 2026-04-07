import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { LeftoversChartProps, LeftoversTrace, LeftoversLayout } from '../lib/index.ts';
import type { Config, Data, Layout } from 'plotly.js';

type LeftoversConfig = Partial<Config>;

const LEFTOVERS_CONFIG: LeftoversConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
};

const LeftoversChart: React.FC<LeftoversChartProps> = ({
    data,
    title = 'Накопительный баланс',
}) => {
    // null = нет данных вообще, [] = нет серий "накопительный баланс"
    const traces = useMemo<LeftoversTrace[] | null>(() => {
        if (!data?.dates?.length) return null;

        const balanceSeries = data.series.filter(series =>
            series.name.toLowerCase().includes('накопительный баланс')
        );
        if (balanceSeries.length === 0) return [];

        return balanceSeries.map((series) => ({
            x: data.dates,
            y: series.data,
            mode: 'lines+markers',
            name: series.name,
            type: 'scatter',
            line: { color: '#FCDD6B', width: 2 },
            marker: { color: '#A3A2E6', size: 8 },
        }));
    }, [data]);

    const layout = useMemo<LeftoversLayout>(() => ({
        title: { text: title },
        xaxis: {
            title: 'Дата',
            type: 'date',
            tickformat: '%Y-%m-%d',
            tickangle: -25,
        },
        yaxis: {
            title: 'Баланс (шт)',
            autorange: true,
        },
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
    }), [title]);

    if (traces === null) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных для отображения графика остатков</p>
            </div>
        );
    }

    if (traces.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных "накопительный баланс" для отображения</p>
            </div>
        );
    }

    return (
        <Plot
            data={traces as Data[]}
            layout={layout as Partial<Layout>}
            config={LEFTOVERS_CONFIG}
        />
    );
};

export default memo(LeftoversChart);
