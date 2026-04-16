export interface WaterfallItem {
    name: string;
    value: number;
    measure: 'relative' | 'total' | 'absolute';
    text: string;
}

export interface WaterfallResponse {
    items: WaterfallItem[];
}
