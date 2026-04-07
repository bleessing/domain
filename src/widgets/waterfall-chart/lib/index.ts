import type { WaterfallResponse } from '@/entities/waterfall';

export interface WaterfallChartProps {
    data: WaterfallResponse;
    title?: string;
}

export interface WaterfallTrace {
    type: 'waterfall';
    x: string[];
    y: number[];
    measure: Array<'relative' | 'total' | 'absolute'>;
    text: string[];
    textposition: 'outside';
    connector: {
        line: { color: string };
    };
    increasing: { marker: { color: string } };
    decreasing: { marker: { color: string } };
    totals: { marker: { color: string } };
}

export interface WaterfallLayout {
    title: { text: string };
    xaxis: { title: string; tickangle: number };
    yaxis: { title: string; autorange: boolean };
    autosize: boolean;
    width: number;
    height: number;
    paper_bgcolor: string;
    plot_bgcolor: string;
    margin: { l: number; r: number; t: number; b: number };
    showlegend: boolean;
}
