import Plot from 'react-plotly.js';
import type { DynamicsResponse } from '@/entities/leftovers';

interface LeftoversChartProps {
    data: DynamicsResponse;
    title?: string;
}

const LeftoversChart: React.FC<LeftoversChartProps> = ({
    data,
    title = 'Накопительный баланс'
}) => {
    if (!data || !data.dates || data.dates.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных для отображения графика остатков</p>
            </div>
        );
    }

    // Фильтруем только серии с "накопительный баланс" (только при is_leftovers=true)
    const balanceSeries = data.series.filter(series =>
        series.name.toLowerCase().includes('накопительный баланс')
    );

    if (balanceSeries.length === 0) {
        return (
            <div style={{ padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                <p>Нет данных "накопительный баланс" для отображения</p>
            </div>
        );
    }

    // Создаем traces для Plotly с линией и маркерами для каждой серии
    const traces = balanceSeries.map((series, index) => {
        // Генерируем разные цвета для разных серий

        return {
            x: data.dates,
            y: series.data,
            mode: 'lines+markers',
            name: series.name,
            type: 'scatter',
            line: {
                color:"#FCDD6B",
                width: 2
            },
            marker: {
                color: '#A3A2E6',
                size: 8
            }
        };
    });

    return (
        <Plot
            data={traces as any}
            layout={{
                title: {
                    text: title,
                    font: { size: 18, weight: 600 }
                },
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
            }}
            config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            }}
        />
    );
};

export default LeftoversChart;
