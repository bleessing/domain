import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { Config, Data, Layout } from 'plotly.js';
import type { WaterfallChartProps, WaterfallTrace, WaterfallLayout } from '../lib';

type WaterfallConfig = Partial<Config>;

const WATERFALL_CONFIG: WaterfallConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
};

const WaterfallChart: React.FC<WaterfallChartProps> = ({
    data,
    title = 'Waterfall',
}) => {
    const trace = useMemo<WaterfallTrace | null>(() => {
        if (!data?.items?.length) return null;
        return {
            type: 'waterfall',
            x: data.items.map(item => item.name),
            y: data.items.map(item => item.value),
            measure: data.items.map(item => item.measure),
            text: data.items.map(item => item.text),
            textposition: 'outside',
            connector: { line: { color: '#888888' } },
            increasing: { marker: { color: '#2ca02c' } },
            decreasing: { marker: { color: '#d62728' } },
            totals: { marker: { color: '#1f77b4' } },
        };
    }, [data]);

    const layout = useMemo<WaterfallLayout>(() => ({
        title: { text: title },
        xaxis: { title: '', tickangle: -25 },
        yaxis: { title: 'Количество (шт)', autorange: true },
        autosize: true,
        width: 1440,
        height: 650,
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#f9f9f9',
        margin: { l: 60, r: 40, t: 80, b: 100 },
        showlegend: false,
    }), [title]);

    if (!trace) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных для отображения waterfall</p>
            </div>
        );
    }

    return (
        <Plot
            data={[trace] as Data[]}
            layout={layout as Partial<Layout>}
            config={WATERFALL_CONFIG}
        />
    );
};

export default memo(WaterfallChart);
