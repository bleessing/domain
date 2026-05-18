import type { FilterParams } from '@/entities/filter';

type ModeKey = 'sources_mode' | 'targets_mode' | 'diameters_mode' | 'types_mode' | 'states_mode';
type ArrayKey = 'sources' | 'targets' | 'diameters' | 'types' | 'states';

export interface FilterQueryOptions {
    /**
     * Как отправлять таблицы остатков:
     * - 'end' (default) — отправить ost_table_end под одним именем (ost_table / leftovers_table). Используется для эндпоинтов, которые принимают одну таблицу (sankey, balance, dynamics, leftovers).
     * - 'start' — отправить ost_table_start под одним именем.
     * - 'both' — отправить оба явно: ost_table_start=... & ost_table_end=... . Используется для waterfall.
     */
    ostTableMode?: 'start' | 'end' | 'both';
    /** Имя параметра для одиночной таблицы остатков (при ostTableMode 'start'/'end'). По умолчанию: 'ost_table' */
    ostTableKey?: 'ost_table' | 'leftovers_table';
    /** Какие mode-параметры включать из FilterParams */
    modes?: ModeKey[];
    /** Переопределить значение mode (условие берётся из filter) */
    modeOverrides?: Partial<Record<ModeKey, string>>;
    /** Какие массивы включать из FilterParams */
    arrays?: ArrayKey[];
    /** Статические параметры, всегда добавляемые (например, states_mode=in) */
    staticParams?: Record<string, string>;
    /** Включить is_leftovers из FilterParams (если задан) */
    includeIsLeftovers?: boolean;
}

/**
 * Строит строку query-параметров из FilterParams.
 * Устраняет дублирование логики построения запросов во всех API-файлах.
 */
export function buildFilterQuery(filters: FilterParams, options: FilterQueryOptions = {}): string {
    const {
        ostTableMode = 'end',
        ostTableKey = 'ost_table',
        modes = [],
        modeOverrides = {},
        arrays = [],
        staticParams = {},
        includeIsLeftovers = false,
    } = options;

    const params: string[] = [];
    const enc = (v: string | number | boolean) => encodeURIComponent(String(v));
    const add = (key: string, value: string | number | boolean) => params.push(`${key}=${enc(value)}`);

    // Обязательные параметры таблиц
    add('zvz_table', filters.zvz_table);
    add('rss_table', filters.rss_table);
    if (filters.og_table) add('og_table', filters.og_table);
    if (filters.vg_table) add('vg_table', filters.vg_table);

    // Таблицы остатков
    if (ostTableMode === 'both') {
        if (filters.ost_table_start) add('ost_table_start', filters.ost_table_start);
        if (filters.ost_table_end) add('ost_table_end', filters.ost_table_end);
    } else {
        const single = ostTableMode === 'start' ? filters.ost_table_start : filters.ost_table_end;
        if (single) add(ostTableKey, single);
    }

    // is_leftovers из фильтров (опционально)
    if (includeIsLeftovers && filters.is_leftovers !== undefined) {
        add('is_leftovers', filters.is_leftovers);
    }

    // Статические параметры (жёстко заданные значения)
    for (const [key, value] of Object.entries(staticParams)) {
        add(key, value);
    }

    // Mode-параметры (условные, с поддержкой переопределения значения)
    for (const mode of modes) {
        const filterValue = filters[mode];
        if (filterValue) {
            add(mode, modeOverrides[mode] ?? filterValue);
        }
    }

    // Массивы значений фильтров
    for (const key of arrays) {
        const arr = filters[key];
        if (arr && arr.length > 0) {
            arr.forEach(v => add(key, v));
        }
    }

    // Даты
    if (filters.date_from) add('date_from', filters.date_from);
    if (filters.date_to) add('date_to', filters.date_to);

    return params.join('&');
}