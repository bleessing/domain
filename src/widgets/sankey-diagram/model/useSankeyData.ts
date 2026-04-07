import { useMemo } from 'react';
import { useLazyGetSankeyQuery } from '@/entities/sankey/api/sankeyApiSlice';
import { transformBackendDataToSankey, type PlotlySankeyData, type BackendResponse } from '@/entities/sankey';
import type { FilterParams } from '@/entities/filter';

export const useSankeyData = () => {
    const [trigger, { data: response, isLoading, originalArgs }] = useLazyGetSankeyQuery();

    const data = useMemo<PlotlySankeyData | null>(() => {
        if (!response) return null;
        const transformed = transformBackendDataToSankey(
            response as BackendResponse,
            originalArgs?.states,
        );
        return transformed.nodes.length > 0 ? transformed : null;
    }, [response, originalArgs]);

    const loadData = (filters: FilterParams) => trigger(filters).unwrap();

    return { data, isLoading, loadData };
};
