import type { PlotlySankeyData, SankeyNode, SankeyLink } from '../model/types';

// Color palette for different stages
const stageColors: Record<string, string> = {
    // Stage 1 - Input states (красные/оранжевые оттенки)
    'Исправимый брак': '#FF8787',
    'Исправимый брак (на ГДО)': '#FFA07A',
    'Комиссия': '#FFB84D',
    'Оборотный фонд': '#FFD93D',
    'Ожидание мойки': '#95E1D3',
    'Ожидание ремонта': '#6BCB77',
    'Отремонтированное': '#4D96FF',
    'После мойки': '#6C5CE7',

    // Stage 2 - Processing (синие оттенки)
    'ВК и Сортировка': '#45B7D1',
    'Диагностика и ревизия': '#5F9EA0',
    'Мойка': '#00CED1',
    'Подготовка к ПЭП': '#4682B4',
    'Ремонт': '#1E90FF',

    // Stage 3 - Output states (зеленые/фиолетовые оттенки)
    'Исправимый брак (на БМЗ)': '#E74C3C',
    'Неисправимый брак': '#C0392B',
    'Неисправимый брак (5.5м)': '#922B21',

    // External operations (темные оттенки)
    'Возврат со скважины': '#34495E',
    'Вывоз со скважины': '#2C3E50',
    'Завоз на скважину': '#1ABC9C',
};

const getNodeColor = (label: string): string => {
    // Try exact match first
    if (stageColors[label]) {
        return stageColors[label];
    }

    // Try to match by prefix
    for (const key of Object.keys(stageColors)) {
        if (label.startsWith(key)) {
            return stageColors[key];
        }
    }

    // Default color
    return '#95A5A6';
};

export const transformBackendDataToSankey = (
    backendResponse: any,
    selectedStates?: string[]
): PlotlySankeyData => {
    // Проверяем, какой формат данных пришел
    let rawData: any[];

    if (backendResponse.nodes && Array.isArray(backendResponse.nodes)) {
        rawData = backendResponse.nodes;
    } else if (backendResponse.result && Array.isArray(backendResponse.result)) {
        rawData = backendResponse.result[0].data;
    } else if (Array.isArray(backendResponse)) {
        rawData = backendResponse;
    } else if (backendResponse.data && Array.isArray(backendResponse.data)) {
        rawData = backendResponse.data;
    } else {
        console.error('Неизвестный формат данных:', backendResponse);
        return { nodes: [], links: [] };
    }

    // Фильтрация данных по выбранным состояниям
    if (selectedStates && selectedStates.length > 0) {
        rawData = rawData.filter((item: any) => {
            const source = item['Откуда'] || item.source;
            const target = item['Куда'] || item.target;
            return selectedStates.includes(source) || selectedStates.includes(target);
        });
    }

    // Collect all unique nodes
    const nodeLabels = new Set<string>();
    rawData.forEach((item: any) => {
        const source = item['Откуда'] || item.source;
        const target = item['Куда'] || item.target;

        if (source) nodeLabels.add(source);
        if (target) nodeLabels.add(target);
    });

    // Create nodes array with colors
    const nodesArray = Array.from(nodeLabels);
    const nodes: SankeyNode[] = nodesArray.map((label) => ({
        label,
        color: getNodeColor(label),
    }));

    // Create node index map for quick lookup
    const nodeIndexMap = new Map<string, number>();
    nodesArray.forEach((label, index) => {
        nodeIndexMap.set(label, index);
    });

    // Create links
    const links: SankeyLink[] = rawData
        .map((item: any) => {
            const source = item['Откуда'] || item.source;
            const target = item['Куда'] || item.target;
            const rawValue = item['SUM(Количество (шт))'] || item.value;

            const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue) || 0;

            const sourceIndex = nodeIndexMap.get(source);
            const targetIndex = nodeIndexMap.get(target);

            if (sourceIndex === undefined || targetIndex === undefined) {
                return null;
            }

            if (value <= 0) {
                return null;
            }

            return {
                source: sourceIndex,
                target: targetIndex,
                value: value,
                color: `${getNodeColor(source)}40`,
            };
        })
        .filter((link): link is SankeyLink => link !== null);

    return { nodes, links };
};
