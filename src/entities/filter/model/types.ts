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
    spr_zvz_table: string;
    spr_rss_table: string;
    spr_ov_table: string;
    ov_table?: string;
    ost_table: string;
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
