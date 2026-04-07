import { useMemo } from 'react';
import { useLazyGetWaterfallQuery } from '@/entities/waterfall/api/waterfallApiSlice';
import type { WaterfallResponse } from '@/entities/waterfall';
import type { FilterParams } from '@/entities/filter';

export const useWaterfallData = () => {
    const [trigger, { data: response, isLoading }] = useLazyGetWaterfallQuery();

    const data = useMemo<WaterfallResponse | null>(() => {
        if (!response?.items?.length) return null;
        return response;
    }, [response]);

    const loadData = (filters: FilterParams) => trigger(filters).unwrap();

    return { data, isLoading, loadData };
};
