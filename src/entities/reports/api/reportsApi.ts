import { API_V2_BASE_URL, API_HEADERS } from '@/shared/lib/constants';
import type { EquipmentType } from '@/shared/lib/equipment';
import type {
    ReportKind,
    RssReportParams,
    BalanceV2Params,
    OtbrakovkaParams,
    ReportPeriodsResponse,
} from '../model/types';

/**
 * Источник периодов зависит от отчёта: у «Отбраковки» он свой,
 * у РСС и баланса — общий.
 */
const PERIODS_PATH: Record<ReportKind, string> = {
    'rss-report': '/balance-periods',
    'balance-v2': '/balance-periods',
    'otbrakovka': '/otbrakovka-periods',
};

/** Добавляет параметр в query, только если он непустой. */
function appendIf(qs: URLSearchParams, key: string, value: string | number | undefined): void {
    if (value !== undefined && value !== null && value !== '') {
        qs.append(key, String(value));
    }
}

async function fetchReportBlob(url: string): Promise<Blob> {
    const response = await fetch(url, { method: 'GET', headers: API_HEADERS });
    if (!response.ok) {
        throw new Error(`Report failed: ${response.status} ${response.statusText}`);
    }
    return response.blob();
}

/** `/v2/rss-report` — отчёт по РСС (xlsx). */
export function exportRssReport(params: RssReportParams): Promise<Blob> {
    const qs = new URLSearchParams();
    qs.append('equipment_type', params.equipment_type);
    qs.append('date_from', params.date_from);
    qs.append('date_to', params.date_to);
    appendIf(qs, 'zvz_date_from', params.zvz_date_from);
    appendIf(qs, 'zvz_date_to', params.zvz_date_to);
    return fetchReportBlob(`${API_V2_BASE_URL}/rss-report?${qs.toString()}`);
}

/** `/v2/balance-v2` — материальный баланс (xlsx). */
export function exportBalanceV2(params: BalanceV2Params): Promise<Blob> {
    const qs = new URLSearchParams();
    qs.append('equipment_type', params.equipment_type);
    qs.append('date_from', params.date_from);
    qs.append('date_to', params.date_to);
    qs.append('ost_date_start', params.ost_date_start);
    qs.append('ost_date_end', params.ost_date_end);
    qs.append('otbrakovka_zvz_months', String(params.otbrakovka_zvz_months));
    return fetchReportBlob(`${API_V2_BASE_URL}/balance-v2?${qs.toString()}`);
}

/**
 * Доступные периоды для типа оборудования (JSON).
 * Путь зависит от вида отчёта: `/v2/otbrakovka_periods` для «Отбраковки»,
 * `/v2/balance-periods` — для РСС и баланса.
 */
export async function getReportPeriods(
    equipmentType: EquipmentType,
    kind: ReportKind,
): Promise<ReportPeriodsResponse> {
    const qs = new URLSearchParams({ equipment_type: equipmentType });
    const response = await fetch(`${API_V2_BASE_URL}${PERIODS_PATH[kind]}?${qs.toString()}`, {
        method: 'GET',
        headers: API_HEADERS,
    });
    if (!response.ok) {
        throw new Error(`Report periods failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<ReportPeriodsResponse>;
}

/** `/v2/otbrakovka` — только лист «Отбраковка» (xlsx). */
export function exportOtbrakovka(params: OtbrakovkaParams): Promise<Blob> {
    const qs = new URLSearchParams();
    qs.append('equipment_type', params.equipment_type);
    qs.append('date_from', params.date_from);
    qs.append('date_to', params.date_to);
    qs.append('otbrakovka_zvz_months', String(params.otbrakovka_zvz_months));
    return fetchReportBlob(`${API_V2_BASE_URL}/otbrakovka?${qs.toString()}`);
}
