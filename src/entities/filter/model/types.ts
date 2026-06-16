/** Ключ применимого фильтра — соответствует полям в EquipmentConfig.applicable_filters на бэке. */
export type FilterKey =
    | 'states'
    | 'date_range'
    | 'diameters'
    | 'types'
    | 'sources'
    | 'targets'
    | 'processes'
    | 'flows'
    | 'nomenclatures';

export interface FilterOptions {
    sources: string[];
    targets: string[];
    diameters: string[];
    types: string[];
    states: string[];
    date_range: {
        min: string;
        max: string;
    };
    filter_modes: string[];
    /**
     * Список фильтров, которые имеют смысл для текущего типа оборудования
     * (PIPES/PUMPS/RODS). Используй для условного рендера секций UI:
     * `if (options.available_filters?.includes('diameters')) <DiametersSection />`.
     * Если поле отсутствует (старый бэк) — считаем все фильтры применимы.
     */
    available_filters?: FilterKey[];
}

export interface FilterParams {
    zvz_table: string;
    rss_table: string;
    og_table?: string;
    vg_table?: string;
    /** Таблица остатков на начало периода */
    ost_table_start?: string;
    /** Таблица остатков на конец периода */
    ost_table_end?: string;
    sources_mode?: string;
    targets_mode?: string;
    diameters_mode?: string;
    types_mode?: string;
    states_mode?: string;
    sources?: string[];
    targets?: string[];
    diameters?: string[];
    types?: string[];
    states?: string[];
    date_from?: string | null;
    date_to?: string | null;
    is_leftovers?: boolean;
    /**
     * Тип оборудования, выбранный на главной странице (PIPES/PUMPS/RODS).
     * Передаётся в каждый запрос расчётов — на бэке вытесняет heuristic-определение
     * по имени RSS-таблицы.
     */
    equipment_type?: string;
}
