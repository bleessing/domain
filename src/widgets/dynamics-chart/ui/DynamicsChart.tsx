import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Config, Data, Layout } from 'plotly.js';
import type { DynamicsChartProps, PlotLayout, DynamicsTrace } from '../lib/index.ts';

type PlotConfig = Partial<Config>;

const DYNAMICS_CONFIG: PlotConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
};

function getColorForSeries(name: string): string {
    if (name.includes('Приход')) return '#2ca02c';
    if (name.includes('Расход')) return '#d62728';
    if (name.includes('Баланс')) return '#1f77b4';
    return '#8884d8';
}

const DynamicsChart: React.FC<DynamicsChartProps> = ({
    data,
    title = 'Динамика по датам',
    chartType = 'bar',
}) => {
    const traces = useMemo<DynamicsTrace[]>(() => {
        if (!data?.dates?.length) return [];
        return data.series.map(series => {
            const color = getColorForSeries(series.name);
            return {
                x: data.dates,
                y: series.data,
                name: series.name,
                type: chartType === 'bar' ? 'bar' : 'scatter',
                mode: chartType === 'line' ? 'lines' : undefined,
                marker: { color },
                line: chartType === 'line' ? { color, width: 2 } : undefined,
            };
        });
    }, [data, chartType]);

    const layout = useMemo<PlotLayout>(() => ({
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
    }), [title, chartType]);

    if (!data || !data.dates || data.dates.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных для отображения гистограммы</p>
            </div>
        );
    }

    return (
        <Plot
            data={traces as Data[]}
            layout={layout as Partial<Layout>}
            config={DYNAMICS_CONFIG}
        />
    );
};

export default memo(DynamicsChart);
