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
}
