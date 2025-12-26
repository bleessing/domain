import Plot from 'react-plotly.js';
import type { PlotlySankeyData } from '@/entities/sankey';
import type { Config } from 'plotly.js';

interface SankeyDiagramProps {
    data: PlotlySankeyData;
    title?: string;
    colorScheme?: 'default' | 'pastel' | 'vibrant' | 'ocean' | 'sunset';
}

interface SankeyTrace {
    type: 'sankey';
    orientation: 'h';
    arrangement: 'freeform';
    node: {
        pad: number;
        thickness: number;
        line: {
            color: string;
            width: number;
        };
        label: string[];
        color: string[];
        customdata: number[][];
        hovertemplate: string;
    };
    link: {
        source: number[];
        value: number[];
        target: number[];
        color: string[];
        hovertemplate: string;
    };
    iterations: number;
    valueformat: string;
    valuesuffix: string;
}

interface SankeyLayout {
    title: {
        text: string;
        font: { size: number };
    };
    font: { size: number };
    width: number;
    height: number;
    paper_bgcolor: string;
    plot_bgcolor: string;
    margin: { l: number; r: number; t: number; b: number };
}

type SankeyConfig = Partial<Config>;

const COLOR_SCHEMES = {
    default: [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
    ],
    pastel: [
        '#FFB6C1', '#FFE4B5', '#B0E0E6', '#DDA0DD', '#F0E68C',
        '#E6E6FA', '#FFE4E1', '#F5DEB3', '#D8BFD8', '#AFEEEE',
    ],
    vibrant: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C0B4',
    ],
    ocean: [
        '#006994', '#0891B2', '#06B6D4', '#22D3EE', '#67E8F9',
        '#0C4A6E', '#075985', '#0369A1', '#0284C7', '#0EA5E9',
    ],
    sunset: [
        '#FF6B35', '#F7931E', '#FDC830', '#F37335', '#FF5E62',
        '#FF8C42', '#FFA500', '#FF7F50', '#FF6347', '#FF4500',
    ],
};

const SankeyDiagram: React.FC<SankeyDiagramProps> = ({
                                                         data,
                                                         title = 'Sankey Diagram',
                                                         colorScheme = 'default'
                                                     }) => {
    // Проверяем, что данные существуют и не пустые
    if (!data || !data.nodes || !data.links || data.nodes.length === 0 || data.links.length === 0) {
        return (
            <div style={{padding: '48px', textAlign: 'center', border: '1px dashed #ccc', borderRadius: '8px'}}>
                <p>Нет данных для отображения диаграммы</p>
                <p style={{fontSize: '12px', color: '#999'}}>
                    Nodes: {data?.nodes?.length || 0}, Links: {data?.links?.length || 0}
                </p>
            </div>
        );
    }

    const colors = COLOR_SCHEMES[colorScheme];

    // Автоматически назначаем цвета узлам, если они не указаны
    const nodeColors = data.nodes.map((node, index) =>
        node.color || colors[index % colors.length]
    );

    // Генерируем цвета для связей с прозрачностью
    const linkColors = data.links.map((link) => {
        if (link.color) return link.color;

        const sourceColor = nodeColors[link.source];
        // Добавляем прозрачность 40%
        return sourceColor.startsWith('#')
            ? `${sourceColor}33`
            : sourceColor.replace(')', ', 0.1)').replace('rgb', 'rgba');
    });

    // Подсчитываем количество входящих и исходящих связей для каждого узла
    const incomingLinks = new Array(data.nodes.length).fill(0);
    const outgoingLinks = new Array(data.nodes.length).fill(0);

    data.links.forEach((link) => {
        outgoingLinks[link.source]++;
        incomingLinks[link.target]++;
    });

    const sankeyTrace: SankeyTrace = {
        type: 'sankey',
        orientation: 'h',
        arrangement: 'freeform',
        node: {
            pad: 10,
            thickness: 20,
            line: {
                color: '#56a7f8',
                width: 1.5,
            },
            label: data.nodes.map((node) => node.label),
            color: nodeColors,
            // Используем массив массивов вместо массива объектов
            customdata: data.nodes.map((_, index) => [
                incomingLinks[index],
                outgoingLinks[index]
            ]),
            hovertemplate:
                '<b>%{label}</b><br>' +
                'Общий поток: %{value:.2f} шт<br>' +
                'Входящих связей: %{customdata[0]}<br>' +
                'Исходящих связей: %{customdata[1]}' +
                '<extra></extra>',
        },
        link: {
            source: data.links.map((link) => link.source),
            value: data.links.map((link) => link.value),
            target: data.links.map((link) => link.target),
            color: linkColors,
            hovertemplate: '%{value:.2f} шт<extra></extra>',
        },
        iterations: 50,
        valueformat: '.2f',
        valuesuffix: ' шт',
    };

    const layout: SankeyLayout = {
        title: {
            text: title,
            font: { size: 18 }
        },
        font: { size: 12 },
        width: 1050,
        height: 900,
        paper_bgcolor: '#ffffff',
        plot_bgcolor: '#f2f2f2',
        margin: { l: 20, r: 20, t: 50, b: 20 },
    };

    const config: SankeyConfig = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
    };

    return (
        <Plot
            data={[sankeyTrace] as any}
            layout={layout as any}
            config={config}
        />
    );
};

export default SankeyDiagram;