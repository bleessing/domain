import type {DynamicsResponse} from "@/entities/dynamics";

export interface LeftoversChartProps {
    data: DynamicsResponse;
    title?: string;
}

export interface LeftoversTrace {
    x: string[];
    y: number[];
    mode: 'lines+markers';
    name: string;
    type: 'scatter';
    line: {
        color: string;
        width: number;
    };
    marker: {
        color: string;
        size: number;
    };
}

export interface LeftoversLayout {
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