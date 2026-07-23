import type { EquipmentType } from '@/shared/lib/equipment';

/** Вид отчёта — соответствует трём v2-эндпоинтам выгрузки в Excel. */
export type ReportKind = 'rss-report' | 'balance-v2' | 'otbrakovka';

/** Общие для всех отчётов обязательные поля. */
interface BaseReportParams {
    equipment_type: EquipmentType;
    /** YYYY-MM-DD */
    date_from: string;
    /** YYYY-MM-DD */
    date_to: string;
}

/**
 * `/v2/rss-report` — отчёт по РСС.
 * zvz_date_from/zvz_date_to опциональны (окно ЗВ для колонки «Дата вывоза со скважины»).
 */
export interface RssReportParams extends BaseReportParams {
    zvz_date_from?: string;
    zvz_date_to?: string;
}

/**
 * `/v2/balance-v2` — материальный баланс.
 * ost_date_start/ost_date_end — снапшот остатков (обязательны в нашем UI).
 * otbrakovka_zvz_months — окно ZVZ для матчинга «со скв» (1 или 2, по умолчанию 2).
 */
export interface BalanceV2Params extends BaseReportParams {
    /** YYYY-MM-DD — снапшот остатков на начало */
    ost_date_start: string;
    /** YYYY-MM-DD — снапшот остатков на конец */
    ost_date_end: string;
    /** 1 — текущий месяц, 2 — предыдущий + текущий */
    otbrakovka_zvz_months: 1 | 2;
}

/**
 * `/v2/otbrakovka` — только лист «Отбраковка».
 * otbrakovka_zvz_months — окно ZVZ (1 или 2, по умолчанию 2).
 */
export interface OtbrakovkaParams extends BaseReportParams {
    otbrakovka_zvz_months: 1 | 2;
}

/**
 * Один период из `/v2/balance-periods` — общий источник дат для всех отчётов
 * (РСС, баланс, отбраковка). В UI показываем только `label`; все 4 даты уже
 * привязаны к периоду. ost-даты нужны балансу, date_from/date_to — всем отчётам.
 */
export interface ReportPeriod {
    key: string;
    label: string;
    month?: number;
    year?: number;
    /** YYYY-MM-DD — снапшот остатков на начало (для баланса) */
    ost_date_start: string;
    /** YYYY-MM-DD — снапшот остатков на конец (для баланса) */
    ost_date_end: string;
    /** YYYY-MM-DD */
    date_from: string;
    /** YYYY-MM-DD */
    date_to: string;
}

/**
 * Ответ `/v2/balance-periods?equipment_type=...` — доступные периоды,
 * рассчитанные бэком по снапшотам остатков.
 */
export interface ReportPeriodsResponse {
    equipment_type: string;
    snapshots: string[];
    periods: ReportPeriod[];
    /** Весь период целиком (напр. «Апр–Июн 2026»). */
    full_range: ReportPeriod | null;
}
