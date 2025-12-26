// Тип для одной записи из бэкенда
export interface SankeyDataItem {
    'Откуда': string;
    'Куда': string;
    'SUM(Количество (шт))': number;
}

// Тип для всего ответа от бэкенда
export interface BackendResponse {
    result: Array<{
        data: SankeyDataItem[];
        colnames: string[];
        coltypes: number[];
        rowcount: number;
        sql_rowcount: number;
    }>;
}

// Типы для Plotly Sankey
export interface SankeyNode {
    label: string;
    color: string;
}

export interface SankeyLink {
    source: number;
    target: number;
    value: number;
    color: string;
}

export interface PlotlySankeyData {
    nodes: SankeyNode[];
    links: SankeyLink[];
}
