import type {DynamicsResponse} from "@/entities/dynamics";

export interface DynamicsChartProps {
    data: DynamicsResponse;
    title?: string;
    chartType?: 'bar' | 'line';
}

export interface DynamicsTrace {
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

export interface PlotLayout {
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