export interface DynamicsSeries {
    name: string;
    data: number[];
}

export interface DynamicsResponse {
    dates: string[];
    series: DynamicsSeries[];
}
